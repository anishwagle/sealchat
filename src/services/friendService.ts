import { User } from "@/types/user";
import { IFriendService } from "./IFriendService";
import { users } from "@/lib/mockData";
import { Logger } from "@/lib/logger";
import pool from "@/db";
import { FriendshipStatus } from "@/types/profile";
const COMPONENT = "FriendService";
export class FriendService implements IFriendService {
  async unfriendRequest(userId1: string, userId2: string): Promise<void> {
    const FUNCTION = "unfriendRequest";
    Logger.log(COMPONENT,FUNCTION,"debug","unFriend a friend",{
      userId1,
      userId2
    });
    await pool.query('DELETE FROM friends WHERE (user_id_1=? AND user_id_2=?) OR user_id_1=? AND user_id_2=?',
      [
        userId1,userId2,
        userId2,userId1
      ]
    );
    Logger.log(COMPONENT,FUNCTION,"debug","unfriend done");
  }

  async getFriendShipStatus(sender_id: string, receiver_id: string): Promise<FriendshipStatus> {
    const FUNCTION = "getFriendShipStatus";
    Logger.log(COMPONENT, FUNCTION, "debug", "send Friend Request", {
      sender_id,
      receiver_id,
    });
    const [acceptedRequest] = await pool.query("SELECT * FROM friends WHERE (user_id_1=? AND user_id_2=?) OR (user_id_1=? AND user_id_2=?)",
        [sender_id,receiver_id,receiver_id,sender_id]
    );
    if((acceptedRequest as any)[0]){
      return 'accepted';
    }
    const [sentResult] = await pool.query("SELECT * FROM friend_requests WHERE sender_id=? AND receiver_id=?",
        [sender_id,receiver_id]
    );
    if((sentResult as any)[0]){
      return 'sent';
    }
    const [receivedResult] = await pool.query("SELECT * FROM friend_requests WHERE sender_id=? AND receiver_id=?",
        [receiver_id,sender_id]
    );
    if((receivedResult as any)[0]){
      return 'received';
    }

    return 'none';
  }
  async sendFriendRequest(sender_id: string, receiver_id: string): Promise<void> {
    const FUNCTION = "sendFriendRequest";
    Logger.log(COMPONENT, FUNCTION, "debug", "send Friend Request", {
      sender_id,
      receiver_id,
    });
    const [queryResult] = await pool.query("INSERT INTO friend_requests (sender_id,receiver_id) VALUES (?,?)",
        [sender_id,receiver_id]
    );
    Logger.log(COMPONENT, FUNCTION, "debug", "Friend request sent", {
      queryResult
    });
  }
  async cancelFriendRequest(sender_id: string, receiver_id: string): Promise<void> {
    const FUNCTION = "cancelFriendRequest";
    Logger.log(COMPONENT, FUNCTION, "debug", "cancel Friend Request", {
      sender_id,
      receiver_id,
    });

   await pool.query("DELETE FROM friend_requests WHERE (sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?)",[
    sender_id,receiver_id,receiver_id,sender_id
   ]);
   Logger.log(COMPONENT, FUNCTION, "debug", "Record deleted from Friend request table", {
      sender_id,
      receiver_id,
    });
  }
  async acceptFriendRequest(userId1: string, userId2: string): Promise<void> {
    const FUNCTION = "acceptFriendRequest";
    Logger.log(COMPONENT, FUNCTION, "debug", "accept Friend Request", {
      userId1,
      userId2,
    });

    const [queryResult] = await pool.query("INSERT INTO friends (user_id_1,user_id_2) VALUES (?,?)",
        [userId1,userId2]
    );
    Logger.log(COMPONENT, FUNCTION, "debug", "Friend request accepted", {
      requestId: (queryResult as any).insertId
    });

   await pool.query("DELETE FROM friend_requests WHERE sender_id=? AND receiver_id=?",[
    userId2,userId1
   ]);
   Logger.log(COMPONENT, FUNCTION, "debug", "Record deleted from Friend request table", {
      userId1,
      userId2,
    });
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
