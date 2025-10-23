import { GenderType, PrivacyLevel, Profile } from "@/types/profile";

export interface IProfileService {
  createProfile(
    userId: string,
    dateOfBirth:string,
    dateOfBirthVisibility:PrivacyLevel,
    gender:GenderType,
    genderVisibility:PrivacyLevel,
    bio:string,
    location:string,
    locationVisibility:PrivacyLevel
  ): Promise<void>;
  getProfile(currentUserId:string,profileUserId:string):Promise<Profile|null>;
}