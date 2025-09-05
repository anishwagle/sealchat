import { v4 } from "uuid";
import bcrypt from "bcryptjs";
import { users } from "@/lib/mockData";
import { User } from "@/types/user";
import { IUserService } from "./IUserService";
import { Logger } from "@/lib/logger";

const COMPONENT = 'MockUserService';
export class MockUserService implements IUserService {
    async findUserByEmailOrUsername(email:string, username:string): Promise<User | undefined>{
        const FUNCTION= 'findUserByEmailOrUsername';
        Logger.log(COMPONENT,FUNCTION,'debug','Checking for existing user',{email,username});
        const result =  users.find(user => user.email === email || user.username === username);
        Logger.log(COMPONENT,FUNCTION,'debug','User check complete',{found:!!result});
        return result;
    }

    async createUser(email:string,username:string,password:string):Promise<User>{
        const FUNCTION = 'createUser';
        Logger.time(COMPONENT,FUNCTION,'bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);
        Logger.timeEnd(COMPONENT,FUNCTION,'bcrypt');
        const newUser: User = {
            id: v4(),
            email,
            username,
            password:hashedPassword
        }
        users.push(newUser);
        Logger.log(COMPONENT,FUNCTION,'info','New User Created',{userId:newUser.id})
        return newUser;
    }
}
export const mockUserService = new MockUserService();