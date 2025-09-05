import {User} from "@/types/user";

export interface IUserService {
    findUserById(userId:string): Promise<User | undefined>;
    findUserByEmailOrUsername(email: string, username: string): Promise<User | undefined>;
    createUser(email: string, username: string, password: string): Promise<User>;
    storeRefreshToken(userId: string, refreshToken: string): Promise<void>;
    validateRefreshToken(userId: string, refreshToken: string): Promise<boolean>;
    removeRefreshToken(userId: string): Promise<void>;
}