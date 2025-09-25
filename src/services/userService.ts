import { v4 } from "uuid";
import { refreshTokens, users } from "@/lib/mockData";
import { User } from "@/types/user";
import { IUserService } from "./IUserService";
import { Logger } from "@/lib/logger";
import pool from "@/db";
const COMPONENT = "UserService";
export class UserService implements IUserService {
  async findUserById(userId: string): Promise<User | undefined> {
    const FUNCTION = "findUserById";
    Logger.log(COMPONENT, FUNCTION, "debug", "Checking for existing user", {
      userId,
    });
    const [queryResult] = await pool.query('SELECT id,username,email,password,created_at FROM users WHERE id=?',
        [userId]
    );
    const result = (queryResult as any[])[0];
    Logger.log(COMPONENT, FUNCTION, "debug", "User check complete", {
      found: !!result,
    });
    return {
      id: result.id,
      username: result.username,
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
    const [queryResult] = await pool.query('SELECT id,username,email,password,created_at FROM users WHERE username=?',
        [username]
    );
    const result:User = (queryResult as any[])[0];
    Logger.log(COMPONENT, FUNCTION, "debug", "User check complete", {
      found: !!result,
    });
    return result;
  }
  async findUserByEmail(email: string): Promise<User | undefined> {
    const FUNCTION = "findUserByemail";
    Logger.log(COMPONENT, FUNCTION, "debug", "Checking for existing user", {
      email,
    });
    const [queryResult] = await pool.query('SELECT id,username,email,password,created_at FROM users WHERE email=?',
        [email]
    );
    const result:User = (queryResult as any)[0];
    Logger.log(COMPONENT, FUNCTION, "debug", "User check complete", {
      found: !!result,
    });
    return result;
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
    const [queryResult] = await pool.query('SELECT id,username,email,password,created_at FROM users WHERE email=? OR username=?',
        [email,username]
    );
    const result:User = (queryResult as any)[0];
    Logger.log(COMPONENT, FUNCTION, "debug", "User check complete", {
      found: !!result,
    });
    return result;
  }

  async createUser(
    email: string,
    username: string,
    password: string,
  ): Promise<User> {
    const FUNCTION = "createUser";

    const [result] = await pool.query('INSERT INTO users (id,username,email,password) VALUES(?,?,?,?)',
        [v4(),username,email,password]);
    const newUser:User ={
        id:(result as any).insertId,
        email,
        username,
        password:'',
    } ;
    Logger.log(COMPONENT, FUNCTION, "info", "New User Created", {
      userId: newUser.id,
    });
    return newUser;
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const FUNCTION = "storeRefreshToken";
    Logger.log(COMPONENT, FUNCTION, "debug", "Storing refresh token", {
      userId,
    });
    await pool.query('INSERT INTO refresh_tokens (user_id,token) VALUES(?,?)',
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
    const [queryResult] = await pool.query('SELECT user_id,token FROM refresh_tokens WHERE user_id=?',
        [userId]);
    const token = (queryResult as any)[0].token;
    return token === refreshToken;
  }

  async removeRefreshToken(userId: string): Promise<void> {
    const FUNCTION = "removeRefreshToken";
    Logger.log(COMPONENT, FUNCTION, "debug", "Removing refresh token", {
      userId,
    });
    await pool.query('DELETE FROM refresh_tokens WHERE user_id=?',
        [userId]
    );
  }
}
export const userService = new UserService();
