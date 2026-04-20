import { Profile } from "@/types/profile";

export interface IFriendRecommendationService {
  recommendFriends(currentUserId: string): Promise<Profile[]>;
  recommendProfile(currentUserId: string): Promise<Profile[]>;
}