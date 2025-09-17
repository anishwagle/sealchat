import { User } from "@/types/user";
import { IFriendService } from "./IFriendService";
import {  users } from "@/lib/mockData";
import { Logger } from "@/lib/logger";
const COMPONENT = "MockFriendService";
export class MockFriendService implements IFriendService {
    sendFriendRequest(sender_id: string, receiver_id: string): Promise<void> {
      throw new Error("Method not implemented.");
    }
    acceptFriendRequest(userId1: string, userId2: string): Promise<void> {
      throw new Error("Method not implemented.");
    }
    cancelFriendRequest(userId1: string, userId2: string): Promise<void> {
      throw new Error("Method not implemented.");
    }
    async findFriends(searchQuery: string): Promise<User[]> {
        const FUNCTION = "findFriends";
            Logger.log(COMPONENT, FUNCTION, "debug", "Search friend based on query", {
              searchQuery,
            });
            const result =searchQuery? users.filter(x=>x.email.toLowerCase().includes(searchQuery.toLowerCase())||x.username.toLowerCase().includes(searchQuery.toLowerCase())):users;
            Logger.log(COMPONENT, FUNCTION, "debug", "Friend search complete", {
              found: !!result,
            });
        
        return result;
    }

}

export const mockFriendService = new MockFriendService();