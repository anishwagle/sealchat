import { User } from "@/types/user";

export interface IUserService {
    findUserById(userId: string): Promise<User | undefined>;
    findUserByUsername(username: string): Promise<User | undefined>;
    findUserByEmail(email: string): Promise<User | undefined>;
    findUserByEmailOrUsername(email: string, username: string): Promise<User | undefined>;
    createUser(userId: string, email: string, username: string, fullname: string): Promise<User>;
}