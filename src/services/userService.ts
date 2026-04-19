import { User } from "@/types/user";
import { IUserService } from "./IUserService";
import { Logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { toTitleCase } from "@/utils/helperFunctions";

const COMPONENT = "UserService";

export class UserService implements IUserService {
  async findUserById(userId: string): Promise<User | undefined> {
    const FUNCTION = "findUserById";
    Logger.log(COMPONENT, FUNCTION, "debug", "Checking for existing user", { userId });

    // Now querying Supabase 'profiles' natively instead of legacy MySQL
    const { data: result, error } = await supabaseAdmin
      .from('profiles')
      .select('id, username, full_name, email, created_at')
      .eq('id', userId)
      .single();

    Logger.log(COMPONENT, FUNCTION, "debug", "User check complete", { found: !!result });

    if (error || !result) return undefined;

    return {
      id: result.id,
      username: result.username,
      fullName: result.full_name,
      email: result.email,
      password: '', // passwords are no longer managed locally, Supabase Auth handles it
      createdAt: result.created_at,
    };
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const FUNCTION = "findUserByUsername";
    const { data: result, error } = await supabaseAdmin
      .from('profiles')
      .select('id, username, email, full_name, created_at')
      .eq('username', username.toLowerCase())
      .single();

    if (error || !result) return undefined;
    return {
      id: result.id,
      username: result.username,
      fullName: result.full_name,
      email: result.email,
      password: ''
    };
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const { data: result, error } = await supabaseAdmin
      .from('profiles')
      .select('id, username, email, full_name, created_at')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !result) return undefined;
    return {
      id: result.id,
      username: result.username,
      email: result.email,
      fullName: result.full_name,
      password: ''
    };
  }

  async findUserByEmailOrUsername(email: string, username: string): Promise<User | undefined> {
    const { data: result, error } = await supabaseAdmin
      .from('profiles')
      .select('id, username, email, full_name, created_at')
      .or(`email.eq.${email.toLowerCase()},username.eq.${username.toLowerCase()}`)
      .single();

    if (error || !result) return undefined;
    return {
      id: result.id,
      username: result.username,
      fullName: result.full_name,
      email: result.email,
      password: ''
    };
  }

  async createUser(
    userId: string,
    email: string,
    username: string,
    fullname: string,
  ): Promise<User> {
    const FUNCTION = "createUser";

    Logger.log(COMPONENT, FUNCTION, 'debug', "Creating User mapping:", { userId });

    const { error } = await supabaseAdmin
      .from('profiles')
      .insert([
        {
          id: userId,
          username: username.toLowerCase(),
          full_name: toTitleCase(fullname),
          email: email.toLowerCase()
        }
      ]);

    if (error) {
      Logger.log(COMPONENT, FUNCTION, 'error', "Failed to execute Supabase Insert", { error: error.message });
      throw Error("Failed to Create User in Supabase");
    }

    const newUser = await this.findUserById(userId);
    if (!newUser) throw Error("Failed to Create and Fetch User");

    return newUser;
  }


}

export const userService = new UserService();
