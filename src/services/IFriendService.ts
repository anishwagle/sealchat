import {User} from "@/types/user";
export interface IFriendService {
findFriends(searchQuery: string): Promise<User[]>;
}