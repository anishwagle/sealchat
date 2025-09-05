import {User} from "../types/user";

export interface IUserService {
    findUserByEmailOrUsername(email: string, username: string): Promise<User | undefined>;
    createUser(email: string, username: string, password: string): Promise<User>;
}