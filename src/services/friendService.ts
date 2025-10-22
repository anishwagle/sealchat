import { User } from "@/types/user";
import { IFriendService } from "./IFriendService";
import { users } from "@/lib/mockData";
import { Logger } from "@/lib/logger";
import { FriendshipStatus } from "@/types/profile";
import { notificationService } from "./serviceProvider";
import executeQuery from "@/db";
const COMPONENT = "FriendService";
export class FriendService implements IFriendService {
  async getCurrentProfileLikeList(userId: string): Promise<User[]> {
    const FUNCTION = "getCurrentProfileLikeList";
    Logger.log(COMPONENT, FUNCTION, "debug", "get User's Like Count", {
      userId,
    });
    const queryResult = await executeQuery(
      `SELECT f.*,u.email,u.username,u.full_name FROM follows f
        JOIN users u on f.follower_id = u.id
       WHERE f.followed_id=?`,
      [userId]
    );

    return (queryResult as any[]).map((user) => ({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      password: "",
    }));
  }
  async checkFriendship(userId1: string, userId2: string): Promise<boolean> {
  const query = `
    SELECT EXISTS(
      SELECT 1 FROM friends
      WHERE (user_id_1 = ? AND user_id_2 = ?)
         OR (user_id_1 = ? AND user_id_2 = ?)
    ) AS areFriends
  `;
  const result = await executeQuery(query, [userId1, userId2, userId2, userId1]);
  return !!(result as any)[0].areFriends;
}
  async getFriendCount(userId: string): Promise<number> {
  const query = `
    SELECT COUNT(*) AS friendCount
    FROM friends
    WHERE user_id_1 = ? OR user_id_2 = ?
  `;
  const result = await executeQuery(query, [userId, userId]);
  return (result as any)[0].friendCount;
}
  async toggleProfileLike(userId1: string, userId2: string): Promise<void> {
    const FUNCTION = "toggleProfileLike";
    Logger.log(COMPONENT, FUNCTION, "debug", "toggle profile like status", {
      userId1,
      userId2,
    });
    const result = await this.getProfileLikeStatus(userId1, userId2);
    if (result) {
      const notifications =
        await notificationService.getNotificationByUserIdAndType(
          userId2,
          "profile_like",
          userId1
        );
      notifications.forEach(async (x) => {
        await notificationService.deleteNotification(x.id, x.userId);
      });
      Logger.log(COMPONENT, FUNCTION, "debug", "Profile dis-liked");
      await executeQuery(
        "DELETE FROM follows WHERE follower_id=? AND followed_id=?",
        [userId1, userId2]
      );
    } else {
      
      Logger.log(COMPONENT, FUNCTION, "debug", "Profile Liked");
      await executeQuery(
        "INSERT INTO follows (follower_id,followed_id) VALUES(?,?)",
        [userId1, userId2]
      );
      await notificationService.createNotification(
        userId2,
        "profile_like",
        userId1
      );
    }
    Logger.log(COMPONENT, FUNCTION, "debug", "Like status toggled");
  }
  async getProfileLikeCount(userId: string): Promise<number> {
  const query = `
    SELECT COUNT(*) AS likeCount
    FROM follows
    WHERE followed_id = ?
  `;
  const result = await executeQuery(query, [userId]);
  return (result as any)[0].likeCount;
}
  async unfriendRequest(userId1: string, userId2: string): Promise<void> {
    const FUNCTION = "unfriendRequest";
    Logger.log(COMPONENT, FUNCTION, "debug", "unFriend a friend", {
      userId1,
      userId2,
    });
    await executeQuery(
      "DELETE FROM friends WHERE (user_id_1=? AND user_id_2=?) OR user_id_1=? AND user_id_2=?",
      [userId1, userId2, userId2, userId1]
    );
    Logger.log(COMPONENT, FUNCTION, "debug", "unfriend done");
  }
  async getProfileLikeStatus(followerId: string, followedId: string): Promise<boolean> {
  const query = `
    SELECT EXISTS(
      SELECT 1 FROM follows 
      WHERE follower_id = ? AND followed_id = ?
    ) AS isLiked
  `;
  const result = await executeQuery(query, [followerId, followedId]);
  return !!(result as any)[0].isLiked;
}
  async getFriendShipStatus(userId1: string, userId2: string): Promise<FriendshipStatus> {
  const query = `
    SELECT CASE
      WHEN EXISTS (
        SELECT 1 FROM friends 
        WHERE (user_id_1 = ? AND user_id_2 = ?)
           OR (user_id_1 = ? AND user_id_2 = ?)
      ) THEN 'accepted'
      WHEN EXISTS (
        SELECT 1 FROM friend_requests 
        WHERE sender_id = ? AND receiver_id = ?
      ) THEN 'sent'
      WHEN EXISTS (
        SELECT 1 FROM friend_requests 
        WHERE sender_id = ? AND receiver_id = ?
      ) THEN 'received'
      ELSE 'none'
    END AS status
  `;
  
  const result = await executeQuery(query, [
    userId1, userId2, userId2, userId1,
    userId1, userId2,
    userId2, userId1,
  ]);
  
  return (result as any)[0].status as FriendshipStatus;
}
  async sendFriendRequest(
    sender_id: string,
    receiver_id: string
  ): Promise<void> {
    const FUNCTION = "sendFriendRequest";
    Logger.log(COMPONENT, FUNCTION, "debug", "send Friend Request", {
      sender_id,
      receiver_id,
    });
    const queryResult = await executeQuery(
      "INSERT INTO friend_requests (sender_id,receiver_id) VALUES (?,?)",
      [sender_id, receiver_id]
    );
    Logger.log(COMPONENT, FUNCTION, "debug", "Friend request sent", {
      queryResult,
    });
  }
  async cancelFriendRequest(
    sender_id: string,
    receiver_id: string
  ): Promise<void> {
    const FUNCTION = "cancelFriendRequest";
    Logger.log(COMPONENT, FUNCTION, "debug", "cancel Friend Request", {
      sender_id,
      receiver_id,
    });

    await executeQuery(
      "DELETE FROM friend_requests WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)",
      [sender_id, receiver_id, receiver_id, sender_id]
    );
    Logger.log(
      COMPONENT,
      FUNCTION,
      "debug",
      "Record deleted from Friend request table",
      {
        sender_id,
        receiver_id,
      }
    );
  }
  async acceptFriendRequest(userId1: string, userId2: string): Promise<void> {
    const FUNCTION = "acceptFriendRequest";
    Logger.log(COMPONENT, FUNCTION, "debug", "accept Friend Request", {
      userId1,
      userId2,
    });

    const queryResult = await executeQuery(
      "INSERT INTO friends (user_id_1,user_id_2) VALUES (?,?)",
      [userId1, userId2]
    );
    Logger.log(COMPONENT, FUNCTION, "debug", "Friend request accepted", {
      requestId: (queryResult as any).insertId,
    });

    await executeQuery(
      "DELETE FROM friend_requests WHERE sender_id=? AND receiver_id=?",
      [userId2, userId1]
    );
    Logger.log(
      COMPONENT,
      FUNCTION,
      "debug",
      "Record deleted from Friend request table",
      {
        userId1,
        userId2,
      }
    );
  }

  async getCurrentFriend(userId: string): Promise<User[]> {
    const FUNCTION = "getCurrentFriend";
    Logger.log(COMPONENT, FUNCTION, "debug", "Get current friend of user", {
      userId,
    });
    const queryResult = await executeQuery(
      `SELECT u.id,u.username,u.email,u.full_name
       FROM users u
       JOIN friends f ON u.id = f.user_id_2
       WHERE f.user_id_1 = ?
       UNION
       SELECT u.id,u.username,u.email,u.full_name
       FROM users u
       JOIN friends f ON u.id = f.user_id_1
       WHERE f.user_id_2 = ?`,
      [userId, userId]
    );
    const result: User[] = (queryResult as any[]).map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      password: "",
    }));
    Logger.log(COMPONENT, FUNCTION, "debug", "Friend search complete", {
      found: !!result,
      users: result,
    });

    return result;
  }
  async findFriends(searchQuery: string): Promise<User[]> {
    const FUNCTION = "findFriends";
    Logger.log(COMPONENT, FUNCTION, "debug", "Search friend based on query", {
      searchQuery,
    });
    const queryResult = await executeQuery(
      "SELECT id,username,password,email,full_name FROM users WHERE username LIKE ? OR email LIKE ?",
      [`%${searchQuery}%`, `%${searchQuery}%`]
    );
    const result: User[] = (queryResult as any[]).map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName:user.full_name,
      password: "",
    }));
    Logger.log(COMPONENT, FUNCTION, "debug", "Friend search complete", {
      found: !!result,
      users: result,
    });

    return result;
  }
  async getPendingRequestList(userId: string): Promise<User[]> {
    const FUNCTION = "getPendingRequestList";
    Logger.log(COMPONENT, FUNCTION, "debug", "get User's Pending Request List", {
      userId,
    });
    const queryResult = await executeQuery(
      `SELECT u.* FROM users u JOIN friend_requests fr ON u.id = fr.receiver_id WHERE fr.sender_id = ?`,
      [userId]
    );

    return (queryResult as any[]).map((user) => ({
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
      password: "",
    }));
  }
}

export const friendService = new FriendService();
