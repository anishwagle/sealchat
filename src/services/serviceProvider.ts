import { mockUserService } from "./mockUserService";
import { IUserService } from "./IUserService";
import { IFriendService } from "./IFriendService";
import { mockFriendService } from "./mockFriendService";

export const userService: IUserService = mockUserService;
export const friendService:IFriendService = mockFriendService;