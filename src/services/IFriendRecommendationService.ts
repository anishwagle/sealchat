import { User } from "@/types/user";

export interface IFriendRecommendationService {
  recommendFriends(currentUserId: string): Promise<User[]>;
}