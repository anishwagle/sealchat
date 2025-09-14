import { v4 } from "uuid";
import bcrypt from "bcryptjs";
import { refreshTokens, users } from "@/lib/mockData";
import { User } from "@/types/user";
import { IUserService } from "./IUserService";
import { Logger } from "@/lib/logger";
import { LoginResponse } from "@/types/loginResponse";

const COMPONENT = "MockUserService";
export class MockUserService implements IUserService {
  async findUserById(userId: string): Promise<User | undefined> {
    const FUNCTION = "findUserById";
    Logger.log(COMPONENT, FUNCTION, "debug", "Checking for existing user", {
      userId,
    });
    const result = users.find((user) => user.id === userId);
    Logger.log(COMPONENT, FUNCTION, "debug", "User check complete", {
      found: !!result,
    });
    return result;
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const FUNCTION = "findUserByUsername";
    Logger.log(COMPONENT, FUNCTION, "debug", "Checking for existing user", {
      username,
    });
    const result = users.find((user) => user.username === username);
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
    const result = users.find((user) => user.email === email);
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
    const result = users.find(
      (user) => user.email === email || user.username === username
    );
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
    const newUser: User = {
      id: v4(),
      email,
      username,
      password,
    };
    users.push(newUser);
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
    refreshTokens[userId] = refreshToken;
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<boolean> {
    const FUNCTION = "validateRefreshToken";
    Logger.log(COMPONENT, FUNCTION, "debug", "Validating refresh token", {
      userId,
    });
    return refreshTokens[userId] === refreshToken;
  }

  async removeRefreshToken(userId: string): Promise<void> {
    const FUNCTION = "removeRefreshToken";
    Logger.log(COMPONENT, FUNCTION, "debug", "Removing refresh token", {
      userId,
    });
    delete refreshTokens[userId];
  }
}
export const mockUserService = new MockUserService();
