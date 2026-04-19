import { Logger } from "@/lib/logger";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { IProfileService } from "./IProfileService";
import { Profile } from "@/types/profile";

const COMPONENT = "ProfileService";

export class ProfileService implements IProfileService {
  async getProfile(
    currentUserId: string,
    profileUserId: string
  ): Promise<Profile | null> {
    const FUNCTION = "getProfile";
    // Execute the complete complex relation logic identically via a Postgres Function (RPC)
    // This perfectly replaces the legacy massive MySQL query without breaking any frontend logic!
    const { data: profile, error } = await supabaseAdmin.rpc('get_profile_metadata', {
      p_current_user_id: currentUserId,
      p_target_user_id: profileUserId
    });

    if (error || !profile) {
      Logger.log(COMPONENT, FUNCTION, "error", "RPC Profile fetching error or not found", { error: error?.message });
      return null;
    }

    Logger.log(COMPONENT, FUNCTION, "debug", "Profile fetched seamlessly via RPC", { profileId: profile.userId });
    
    // Returns identical struct expected by frontend React components
    return profile as Profile;
  }

  async createProfile(
    userId: string,
    fullName: string,
    username: string,
    bio: string,
    avatarUrl: string,
    email: string,
  ): Promise<void> {
    const FUNCTION = "createProfile";
    if (!userId || !fullName || !username || !email) {
      throw new Error(`[${COMPONENT}][${FUNCTION}] User ID, Name, Username, and Email are absolutely required`);
    }

    try {
      // Postgres native Upsert pattern
      const { error } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName,
          username: username.toLowerCase(),
          email: email.toLowerCase(),
          bio: bio || null,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString()
        });

      if (error) throw new Error(error.message);

      Logger.log(COMPONENT, FUNCTION, "debug", "Supabase Profile generated cleanly", { userId });
    } catch (error: any) {
      throw new Error(`[${COMPONENT}][${FUNCTION}] Failed to Upsert Profile: ` + error.message);
    }
  }

  async findProfileById(id: string): Promise<Profile | null> {
    const FUNCTION = "findProfileById";
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToProfile(data);
  }

  async findProfileByUsername(username: string): Promise<Profile | null> {
    const FUNCTION = "findProfileByUsername";
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();

    if (error || !data) return null;

    return this.mapToProfile(data);
  }

  private mapToProfile(data: any): Profile {
    return {
      userId: data.id,
      username: data.username,
      fullName: data.full_name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      joinedAt: data.created_at,
      // Map other fields as needed or defaults
      ...data
    } as Profile;
  }
}

export const profileService = new ProfileService();
