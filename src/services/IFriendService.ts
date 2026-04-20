import { FriendshipStatus, Profile } from "@/types/profile";

export interface IFriendService {
  findFriends(searchQuery: string): Promise<Profile[]>;
  sendFriendRequest(sender_id: string, receiver_id: string): Promise<void>;
  acceptFriendRequest(userId1: string, userId2: string): Promise<void>;
  cancelFriendRequest(userId1: string, userId2: string): Promise<void>;
  unfriendRequest(userId1: string, userId2: string): Promise<void>;
  toggleProfileLike(userId1: string, userId2: string): Promise<void>;
  getProfileLikeCount(userId: string): Promise<number>;
  getFriendCount(userId: string): Promise<number>;
  getFriendShipStatus(
    sender_id: string,
    receiver_id: string
  ): Promise<FriendshipStatus>;
  getCurrentFriend(userId: string): Promise<Profile[]>;
  getCurrentProfileLikeList(userId: string): Promise<Profile[]>;
  getPendingRequestList(userId: string): Promise<Profile[]>;
  getSentRequestList(userId: string): Promise<Profile[]>;
  checkFriendship(userId1: string, userId2: string): Promise<boolean>;
  getProfileLikeStatus(userId1: string, userId2: string): Promise<boolean>;
}
