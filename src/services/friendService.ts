import { User } from "@/types/user";
import { IFriendService } from "./IFriendService";
import {  users } from "@/lib/mockData";
import { Logger } from "@/lib/logger";
import pool from "@/db";
const COMPONENT = "FriendService";
export class FriendService implements IFriendService {
    async findFriends(searchQuery: string): Promise<User[]> {
        const FUNCTION = "findFriends";
            Logger.log(COMPONENT, FUNCTION, "debug", "Search friend based on query", {
              searchQuery,
            });
            const queryResult = await pool.query('SELECT id,username,password,email FROM users WHERE username LIKE ? OR email LIKE ?',
                [`%${searchQuery}%`,`%${searchQuery}%`]
            )
            const result:User[] = (queryResult[0] as any[]).map(user => ({
                id:user.id,
                username:user.username,
                email:user.email,
                password:''
            }))
            Logger.log(COMPONENT, FUNCTION, "debug", "Friend search complete", {
              found: !!result,users:result
            });
        
        return result;
    }

}

export const friendService = new FriendService();