import { Profile } from "@/types/profile";

export interface IProfileService {
  createProfile(
    userId: string,
    fullName: string,
    username: string,
    bio: string,
    avatarUrl: string,
  ): Promise<void>;
  getProfile(currentUserId: string, profileUserId: string): Promise<Profile | null>;
}