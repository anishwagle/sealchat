import { Logger } from "@/lib/logger";
import executeQuery from "../db";
import { IProfileService } from "./IProfileService";
import { GenderType, PrivacyLevel } from "@/types/profile";
const COMPONENT = "NotificationService";
export class ProfileService implements IProfileService {
  async createProfile(
    userId: string,
        dateOfBirth:string,
        dateOfBirthVisibility:PrivacyLevel,
        gender:GenderType,
        genderVisibility:PrivacyLevel,
        bio:string,
        location:string,
        locationVisibility:PrivacyLevel
  ): Promise<void> {
    const FUNCTION = "createProfile";
    if (!userId||!dateOfBirth || !gender || !location) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]Date of Birth, gender,location and user ID are required`
      );
    }

    try {
      await executeQuery(
        `INSERT INTO profiles 
        (user_id, bio
        ,location,location_visibility
        ,birthdate, birthdate_visibility
        ,gender,gender_visibility) VALUES (?, ?,?, ?, ?, ?,?,?)
        ON DUPLICATE KEY UPDATE
        bio = VALUES(bio)
        ,location = VALUES(location),location_visibility=VALUES(location_visibility
        ,birthdate=VALUES(birthdate),birthdate_visibility=VALUES(birthdate_visibility)
        ,gender = VALUES(gender),gender_visibility=VALUES(gender_visibility)
        )`,
        [userId, bio||"", location,locationVisibility, dateOfBirth,dateOfBirthVisibility,gender,genderVisibility]
      );
     
      Logger.log(
        COMPONENT,
        FUNCTION,
        "debug",
        "Profile Created successfully",
        {
          userId
        }
      );
      
    } catch (error: any) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]Failed to create notification: ` +
          error.message
      );
    }
  }
  
}
export const profileService = new ProfileService();
