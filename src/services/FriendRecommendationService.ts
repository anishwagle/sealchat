import { Profile } from "@/types/profile";
import { IFriendRecommendationService } from "./IFriendRecommendationService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { Logger } from "@/lib/logger";

const COMPONENT = "FriendRecommendationService";

export class FriendRecommendationService implements IFriendRecommendationService {
  async recommendFriends(currentUserId: string): Promise<Profile[]> {
    const FUNCTION = "recommendFriends";
    Logger.log(COMPONENT, FUNCTION, "debug", "Fetching friend recommendations via RPC", { currentUserId });

    const { data, error } = await supabaseAdmin.rpc("get_mutual_friends_recommendations", {
      target_user_id: currentUserId,
    });

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to fetch mutual friends", { error });
      return [];
    }

    return (data || []).map(this.mapRowToProfile);
  }

  async recommendProfile(currentUserId: string): Promise<Profile[]> {
    const FUNCTION = "recommendProfile";
    Logger.log(COMPONENT, FUNCTION, "debug", "Fetching profile recommendations via RPC", { currentUserId });

    const { data, error } = await supabaseAdmin.rpc("get_liked_by_friends_recommendations", {
      target_user_id: currentUserId,
    });

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to fetch liked by friends", { error });
      return [];
    }

    return (data || []).map(this.mapRowToProfile);
  }

  private mapRowToProfile(row: any): Profile {
    return {
      userId: row.id,
      username: row.username,
      fullName: row.full_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      joinedAt: row.created_at,
    } as Profile;
  }
}

export const friendRecommendationService = new FriendRecommendationService();
