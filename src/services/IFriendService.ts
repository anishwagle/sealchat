import { FriendshipStatus } from "@/types/profile";
import {User} from "@/types/user";
export interface IFriendService {
findFriends(searchQuery: string): Promise<User[]>;
sendFriendRequest(sender_id:string,receiver_id:string):Promise<void>;
acceptFriendRequest(userId1:string,userId2:string):Promise<void>;
cancelFriendRequest(userId1:string,userId2:string):Promise<void>;
unfriendRequest(userId1:string,userId2:string):Promise<void>;
toggleProfileLike(userId1:string,userId2:string):Promise<void>;
getProfileLikeCount(userId:string):Promise<number>;
getFriendCount(userId:string):Promise<number>;
getFriendShipStatus(sender_id: string, receiver_id: string): Promise<FriendshipStatus>;
getProfileLikeStatus(userId1: string, userId2: string): Promise<boolean>;
}