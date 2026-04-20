import { Profile, FriendshipStatus } from "@/types/profile";
import { IFriendService } from "./IFriendService";
import { Logger } from "@/lib/logger";
import { notificationService } from "./serviceProvider";
import { supabaseAdmin } from "@/lib/supabase/admin";

const COMPONENT = "FriendService";

export class FriendService implements IFriendService {
  async findFriends(searchQuery: string): Promise<Profile[]> {
    const FUNCTION = "findFriends";
    Logger.log(COMPONENT, FUNCTION, "debug", "Searching for friends", { searchQuery });

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      .limit(20);

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to search friends", { error });
      return [];
    }

    return data.map(this.mapRowToProfile);
  }

  async sendFriendRequest(senderId: string, receiverId: string): Promise<void> {
    const FUNCTION = "sendFriendRequest";
    
    const { error } = await supabaseAdmin
      .from("friend_requests")
      .insert({ sender_id: senderId, receiver_id: receiverId });

    if (error) throw new Error(`[${COMPONENT}][${FUNCTION}] Failed: ${error.message}`);

    await notificationService.createNotification(receiverId, "friend_request", senderId);
  }

  async acceptFriendRequest(userId1: string, userId2: string): Promise<void> {
    const FUNCTION = "acceptFriendRequest";

    // Standardize order: user_id_1 < user_id_2 for uniqueness consistency
    const [id1, id2] = [userId1, userId2].sort();

    const { error: insertError } = await supabaseAdmin
      .from("friends")
      .insert({ user_id_1: id1, user_id_2: id2 });

    if (insertError) throw new Error(`[${COMPONENT}][${FUNCTION}] Insert Failed: ${insertError.message}`);

    // Cleanup requests both ways to be safe
    await supabaseAdmin
      .from("friend_requests")
      .delete()
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`);

    await notificationService.createNotification(userId2, "friend_accept", userId1);
  }

  async cancelFriendRequest(senderId: string, receiverId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from("friend_requests")
      .delete()
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`);

    if (error) throw new Error(error.message);
  }

  async unfriendRequest(userId1: string, userId2: string): Promise<void> {
    const [id1, id2] = [userId1, userId2].sort();
    const { error } = await supabaseAdmin
      .from("friends")
      .delete()
      .match({ user_id_1: id1, user_id_2: id2 });

    if (error) throw new Error(error.message);
  }

  async toggleProfileLike(userId1: string, userId2: string): Promise<void> {
    const isFollowing = await this.getProfileLikeStatus(userId1, userId2);
    
    if (isFollowing) {
      await supabaseAdmin.from("follows").delete().match({ follower_id: userId1, followed_id: userId2 });
      // Delete notification logic usually handled by service/trigger
    } else {
      await supabaseAdmin.from("follows").insert({ follower_id: userId1, followed_id: userId2 });
      await notificationService.createNotification(userId2, "profile_like", userId1);
    }
  }

  async getProfileLikeCount(userId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("followed_id", userId);
    return count || 0;
  }

  async getFriendCount(userId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from("friends")
      .select("*", { count: "exact", head: true })
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);
    return count || 0;
  }

  async getFriendShipStatus(userId1: string, userId2: string): Promise<FriendshipStatus> {
    const [id1, id2] = [userId1, userId2].sort();
    
    const { data: friendship } = await supabaseAdmin
      .from("friends")
      .select("id")
      .match({ user_id_1: id1, user_id_2: id2 })
      .single();

    if (friendship) return "accepted";

    const { data: sentTask } = await supabaseAdmin
      .from("friend_requests")
      .select("id")
      .match({ sender_id: userId1, receiver_id: userId2 })
      .single();

    if (sentTask) return "sent";

    const { data: receivedTask } = await supabaseAdmin
      .from("friend_requests")
      .select("id")
      .match({ sender_id: userId2, receiver_id: userId1 })
      .single();

    if (receivedTask) return "received";

    return "none";
  }

  async getCurrentFriend(userId: string): Promise<Profile[]> {
    const { data, error } = await supabaseAdmin
      .from("friends")
      .select(`
        user_id_1,
        user_id_2,
        profiles!user_id_1(*),
        target_profile:profiles!user_id_2(*)
      `)
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

    if (error || !data) return [];

    return data.map((row: any) => {
      const friendData = row.user_id_1 === userId ? row.target_profile : row.profiles;
      return this.mapRowToProfile(friendData);
    });
  }

  async getCurrentProfileLikeList(userId: string): Promise<Profile[]> {
    const { data, error } = await supabaseAdmin
      .from("follows")
      .select("profiles!follower_id(*)")
      .eq("followed_id", userId);

    if (error || !data) return [];
    return data.map((row: any) => this.mapRowToProfile(row.profiles));
  }

  async getPendingRequestList(userId: string): Promise<Profile[]> {
    const { data, error } = await supabaseAdmin
      .from("friend_requests")
      .select("profiles!sender_id(*)")
      .eq("receiver_id", userId);

    if (error || !data) return [];
    return data.map((row: any) => this.mapRowToProfile(row.profiles));
  }

  async getSentRequestList(userId: string): Promise<Profile[]> {
    const { data, error } = await supabaseAdmin
      .from("friend_requests")
      .select("profiles!receiver_id(*)")
      .eq("sender_id", userId);

    if (error || !data) return [];
    return data.map((row: any) => this.mapRowToProfile(row.profiles));
  }

  async checkFriendship(userId1: string, userId2: string): Promise<boolean> {
    const status = await this.getFriendShipStatus(userId1, userId2);
    return status === "accepted";
  }

  async getProfileLikeStatus(followerId: string, followedId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from("follows")
      .select("id")
      .match({ follower_id: followerId, followed_id: followedId })
      .single();
    return !!data;
  }

  private mapRowToProfile(row: any): Profile {
    return {
      userId: row.id,
      username: row.username,
      fullName: row.full_name,
      bio: row.bio,
      avatarUrl: row.avatar_url,
      joinedAt: row.created_at,
    } as Profile;
  }
}

export const friendService = new FriendService();
