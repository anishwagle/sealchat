import { User } from "@/types/user";
import { IFriendRecommendationService } from "./IFriendRecommendationService";
import executeQuery from "@/db";

export class FriendRecommendationService implements IFriendRecommendationService {
  async recommendFriends(currentUserId: string): Promise<User[]> {
    const query = `
      SELECT u.id, u.username, u.email, COUNT(mutual.user_id_1) AS mutual_friends_count
      FROM users u
      JOIN friends f1 ON (u.id = f1.user_id_1 OR u.id = f1.user_id_2)
      JOIN friends f2 ON (f1.user_id_1 = f2.user_id_1 OR f1.user_id_1 = f2.user_id_2 OR f1.user_id_2 = f2.user_id_1 OR f1.user_id_2 = f2.user_id_2)
      JOIN friends mutual ON (u.id = mutual.user_id_1 OR u.id = mutual.user_id_2) AND (mutual.user_id_1 = f2.user_id_1 OR mutual.user_id_1 = f2.user_id_2 OR mutual.user_id_2 = f2.user_id_1 OR mutual.user_id_2 = f2.user_id_2)
      WHERE (f2.user_id_1 = ? OR f2.user_id_2 = ?) AND u.id != ?
        AND u.id NOT IN (
          SELECT user_id_2 FROM friends WHERE user_id_1 = ?
          UNION
          SELECT user_id_1 FROM friends WHERE user_id_2 = ?
        )
      GROUP BY u.id, u.username, u.email
      ORDER BY mutual_friends_count DESC;
    `;

    const params = [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId];
    const result = await executeQuery(query, params);

    return (result as any[]).map((row) => ({
      id: row.id,
      username: row.username,
      email: row.email,
      password: "",
    }));
  }
}

export const friendRecommendationService = new FriendRecommendationService();
