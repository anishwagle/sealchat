import { v4 } from "uuid";
import { User } from "@/types/user";
import { IUserService } from "./IUserService";
import { Logger } from "@/lib/logger";
import executeQuery from "@/db";
import {toTitleCase} from "@/utils/helperFunctions"
const COMPONENT = "UserService";
export class UserService implements IUserService {
  async findUserById(userId: string): Promise<User | undefined> {
    const FUNCTION = "findUserById";
    Logger.log(COMPONENT, FUNCTION, "debug", "Checking for existing user", {
      userId,
    });
    const queryResult = await executeQuery('SELECT id,username,full_name,email,password,created_at FROM users WHERE id=?',
        [userId]
    );
    const result = (queryResult as any[])[0];
    Logger.log(COMPONENT, FUNCTION, "debug", "User check complete", {
      found: !!result,
    });
    return {
      id: result.id,
      username: result.username,
      fullName:result.full_name,
      email: result.email,
      password: result.password,
      createdAt: result.created_at,
    };
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const FUNCTION = "findUserByUsername";
    Logger.log(COMPONENT, FUNCTION, "debug", "Checking for existing user", {
      username,
    });
    const queryResult = await executeQuery('SELECT id,username,email,full_name,created_at FROM users WHERE username=?',
        [username.toLowerCase()]
    );
    const result = (queryResult as any[])[0];
    Logger.log(COMPONENT, FUNCTION, "debug", "User check complete", {
      found: !!result,
    });
    return {
      id:result.id,
      username:result.username,
      fullName:result.full_name,
      email:result.email,
      password:''
    };
  }
  async findUserByEmail(email: string): Promise<User | undefined> {
    const FUNCTION = "findUserByemail";
    Logger.log(COMPONENT, FUNCTION, "debug", "Checking for existing user", {
      email,
    });
    const queryResult = await executeQuery('SELECT id,username,email,full_name,created_at FROM users WHERE email=?',
        [email.toLowerCase()]
    );
    const result = (queryResult as any)[0];
    Logger.log(COMPONENT, FUNCTION, "debug", "User check complete", {
      found: !!result,
    });
    return {
      id:result.id,
      username:result.username,
      email:result.email,
      fullName:result.full_name,
      password:''
    };
  }
  async findUserByEmailOrUsername(
    email: string,
    username: string
  ): Promise<User | undefined> {
    const FUNCTION = "findUserByEmailOrUsername";
    Logger.log(COMPONENT, FUNCTION, "debug", "Checking for existing user", {
      email,
      username,
    });
    const queryResult = await executeQuery('SELECT id,username,email,full_name,created_at FROM users WHERE email=? OR username=?',
        [email.toLowerCase(),username.toLowerCase()]
    );
    const result = (queryResult as any)[0];
    Logger.log(COMPONENT, FUNCTION, "debug", "User check complete", {
      found: !!result,
    });
    return {
      id:result.id,
      username:result.username,
      fullName:result.full_name,
      email:result.email,
      password:''
    };
  }

  async createUser(
    email: string,
    username: string,
    fullname: string,
    password: string,
  ): Promise<User> {
    const FUNCTION = "createUser";
    const id = v4();
    await executeQuery('INSERT INTO users (id,username,full_name,email,password) VALUES(?,?,?,?,?)',
        [id,username.toLowerCase(),toTitleCase(fullname),email.toLowerCase(),password]);

    const newUser = await this.findUserById(id);
    if(!newUser){
      throw Error("Failed to Create and Fetch User");
    }
    Logger.log(COMPONENT, FUNCTION, "info", "New User Created", {
      userId: newUser?.id,
    });
    return newUser;
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const FUNCTION = "storeRefreshToken";
    Logger.log(COMPONENT, FUNCTION, "debug", "Storing refresh token", {
      userId,
    });
    await executeQuery('INSERT INTO refresh_tokens (user_id,token) VALUES(?,?)',
        [userId,refreshToken]
    );
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<boolean> {
    const FUNCTION = "validateRefreshToken";
    Logger.log(COMPONENT, FUNCTION, "debug", "Validating refresh token", {
      userId,
    });
    const queryResult = await executeQuery('SELECT user_id,token FROM refresh_tokens WHERE user_id=?',
        [userId]);
    const token = (queryResult as any)[0].token;
    return token === refreshToken;
  }

  async removeRefreshToken(userId: string): Promise<void> {
    const FUNCTION = "removeRefreshToken";
    Logger.log(COMPONENT, FUNCTION, "debug", "Removing refresh token", {
      userId,
    });
    await executeQuery('DELETE FROM refresh_tokens WHERE user_id=?',
        [userId]
    );
  }
}
export const userService = new UserService();
