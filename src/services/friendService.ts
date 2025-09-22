import { User } from "@/types/user";
import { IFriendService } from "./IFriendService";
import { users } from "@/lib/mockData";
import { Logger } from "@/lib/logger";
import pool from "@/db";
import { FriendshipStatus } from "@/types/profile";
import { notificationService } from "./serviceProvider";
const COMPONENT = "FriendService";
export class FriendService implements IFriendService {
  async getFriendCount(userId: string): Promise<number> {
    const FUNCTION = "getFriendCount";
    Logger.log(COMPONENT, FUNCTION, "debug", "get User's Friend Count", {
      userId,
    });
    const [queryResult] = await pool.query(
      "SELECT * FROM friends WHERE user_id_1=? OR user_id_2=?",
      [userId, userId]
    );
    const count = (queryResult as any[]).length;
    Logger.log(
      COMPONENT,
      FUNCTION,
      "debug",
      "Calculated Profile friend Count",
      { count: count }
    );
    return count;
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
      await pool.query(
        "DELETE FROM follows WHERE follower_id=? AND followed_id=?",
        [userId1, userId2]
      );
    } else {
      
      Logger.log(COMPONENT, FUNCTION, "debug", "Profile Liked");
      await pool.query(
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
    const FUNCTION = "getProfileLikeCount";
    Logger.log(COMPONENT, FUNCTION, "debug", "get User's Like Count", {
      userId,
    });
    const [queryResult] = await pool.query(
      "SELECT * FROM follows WHERE followed_id=?",
      [userId]
    );
    const count = (queryResult as any[]).length;
    Logger.log(COMPONENT, FUNCTION, "debug", "Calculated Profile Like Count", {
      count: count,
    });
    return count;
  }
  async unfriendRequest(userId1: string, userId2: string): Promise<void> {
    const FUNCTION = "unfriendRequest";
    Logger.log(COMPONENT, FUNCTION, "debug", "unFriend a friend", {
      userId1,
      userId2,
    });
    await pool.query(
      "DELETE FROM friends WHERE (user_id_1=? AND user_id_2=?) OR user_id_1=? AND user_id_2=?",
      [userId1, userId2, userId2, userId1]
    );
    Logger.log(COMPONENT, FUNCTION, "debug", "unfriend done");
  }
  async getProfileLikeStatus(
    userId1: string,
    userId2: string
  ): Promise<boolean> {
    const FUNCTION = "getProfileLikeStatus";
    Logger.log(COMPONENT, FUNCTION, "debug", "get profile like status", {
      userId1,
      userId2,
    });
    const [queryResult] = await pool.query(
      "SELECT * FROM follows WHERE follower_id=? AND followed_id=?",
      [userId1, userId2]
    );
    const result = (queryResult as any[])[0];
    Logger.log(COMPONENT, FUNCTION, "debug", "Get Profile Like Status", {
      result,
    });
    return !!result;
  }
  async getFriendShipStatus(
    sender_id: string,
    receiver_id: string
  ): Promise<FriendshipStatus> {
    const FUNCTION = "getFriendShipStatus";
    Logger.log(COMPONENT, FUNCTION, "debug", "get friendship status", {
      sender_id,
      receiver_id,
    });
    const [acceptedRequest] = await pool.query(
      "SELECT * FROM friends WHERE (user_id_1=? AND user_id_2=?) OR (user_id_1=? AND user_id_2=?)",
      [sender_id, receiver_id, receiver_id, sender_id]
    );
    if ((acceptedRequest as any)[0]) {
      return "accepted";
    }
    const [sentResult] = await pool.query(
      "SELECT * FROM friend_requests WHERE sender_id=? AND receiver_id=?",
      [sender_id, receiver_id]
    );
    if ((sentResult as any)[0]) {
      return "sent";
    }
    const [receivedResult] = await pool.query(
      "SELECT * FROM friend_requests WHERE sender_id=? AND receiver_id=?",
      [receiver_id, sender_id]
    );
    if ((receivedResult as any)[0]) {
      return "received";
    }

    return "none";
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
    const [queryResult] = await pool.query(
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

    await pool.query(
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

    const [queryResult] = await pool.query(
      "INSERT INTO friends (user_id_1,user_id_2) VALUES (?,?)",
      [userId1, userId2]
    );
    Logger.log(COMPONENT, FUNCTION, "debug", "Friend request accepted", {
      requestId: (queryResult as any).insertId,
    });

    await pool.query(
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

  async getCurrentFriend(userId: string, limit: number = 5): Promise<User[]> {
    const FUNCTION = "getCurrentFriend";
    Logger.log(COMPONENT, FUNCTION, "debug", "Get current friend of user", {
      userId,
    });
    const [queryResult] = await pool.query(
      `SELECT u.id,u.username,u.email
       FROM users u
       JOIN friends f ON u.id = f.user_id_2
       WHERE f.user_id_1 = ?
       UNION
       SELECT u.id,u.username,u.email
       FROM users u
       JOIN friends f ON u.id = f.user_id_1
       WHERE f.user_id_2 = ?
       LIMIT ?`,
      [userId, userId, limit]
    );
    const result: User[] = (queryResult as any[]).map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
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
    const [queryResult] = await pool.query(
      "SELECT id,username,password,email FROM users WHERE username LIKE ? OR email LIKE ?",
      [`%${searchQuery}%`, `%${searchQuery}%`]
    );
    const result: User[] = (queryResult as any[]).map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      password: "",
    }));
    Logger.log(COMPONENT, FUNCTION, "debug", "Friend search complete", {
      found: !!result,
      users: result,
    });

    return result;
  }
}

export const friendService = new FriendService();
