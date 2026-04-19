import { Profile } from "@/types/profile";

export interface IProfileService {
  createProfile(
    userId: string,
    fullName: string,
    username: string,
    bio: string,
    avatarUrl: string,
    email: string,
  ): Promise<void>;
  getProfile(currentUserId: string, profileUserId: string): Promise<Profile | null>;
  findProfileById(id: string): Promise<Profile | null>;
  findProfileByUsername(username: string): Promise<Profile | null>;
}