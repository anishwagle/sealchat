import { Logger } from "@/lib/logger";
import executeQuery from "../db";
import { IProfileService } from "./IProfileService";
import { GenderType, PrivacyLevel, Profile } from "@/types/profile";
const COMPONENT = "NotificationService";
export class ProfileService implements IProfileService {
  async getProfile(
    currentUserId: string,
    profileUserId: string
  ): Promise<Profile | null> {
    const FUNCTION = "getProfile";
    const query = `
SELECT 
  u.id AS userId,
  u.username,
  u.full_name AS fullName,
  DATE_FORMAT(u.created_at, '%Y-%m-%d') AS joinedAt,
  p.bio,

  -- Location (visible if allowed)
  CASE
    WHEN u.id = ? THEN p.location
    WHEN p.location_visibility = 'public' THEN p.location
    WHEN p.location_visibility = 'friends' AND EXISTS (
      SELECT 1 FROM friends f
      WHERE (f.user_id_1 = ? AND f.user_id_2 = u.id)
         OR (f.user_id_1 = u.id AND f.user_id_2 = ?)
    ) THEN p.location
    ELSE NULL
  END AS location,

  -- Birthdate (visible if allowed)
  CASE
    WHEN u.id = ? THEN p.birthdate
    WHEN p.birthdate_visibility = 'public' THEN p.birthdate
    WHEN p.birthdate_visibility = 'friends' AND EXISTS (
      SELECT 1 FROM friends f
      WHERE (f.user_id_1 = ? AND f.user_id_2 = u.id)
         OR (f.user_id_1 = u.id AND f.user_id_2 = ?)
    ) THEN p.birthdate
    ELSE NULL
  END AS birthdate,

  -- Gender (visible if allowed)
  CASE
    WHEN u.id = ? THEN p.gender
    WHEN p.gender_visibility = 'public' THEN p.gender
    WHEN p.gender_visibility = 'friends' AND EXISTS (
      SELECT 1 FROM friends f
      WHERE (f.user_id_1 = ? AND f.user_id_2 = u.id)
         OR (f.user_id_1 = u.id AND f.user_id_2 = ?)
    ) THEN p.gender
    ELSE NULL
  END AS gender,

  -- Visibility settings (only shown for self)
  CASE WHEN u.id = ? THEN p.location_visibility ELSE NULL END AS locationVisibility,
  CASE WHEN u.id = ? THEN p.birthdate_visibility ELSE NULL END AS birthdateVisibility,
  CASE WHEN u.id = ? THEN p.gender_visibility ELSE NULL END AS genderVisibility,

  -- Profile Like Count
  (SELECT COUNT(*) FROM follows WHERE followed_id = u.id) AS profileLikeCount,

  -- Profile Friend Count
  (SELECT COUNT(*) FROM friends WHERE user_id_1 = u.id OR user_id_2 = u.id) AS profileFriendCount,

  -- Profile Like Status
  EXISTS(
    SELECT 1 FROM follows 
    WHERE follower_id = ? AND followed_id = u.id
  ) AS profileLikeStatus,

  -- Friendship Status
  CASE
    WHEN u.id = ? THEN 'self'
    WHEN EXISTS(
      SELECT 1 FROM friends 
      WHERE (user_id_1 = ? AND user_id_2 = u.id)
         OR (user_id_1 = u.id AND user_id_2 = ?)
    ) THEN 'accepted'
    WHEN EXISTS(
      SELECT 1 FROM friend_requests 
      WHERE sender_id = ? AND receiver_id = u.id
    ) THEN 'sent'
    WHEN EXISTS(
      SELECT 1 FROM friend_requests 
      WHERE sender_id = u.id AND receiver_id = ?
    ) THEN 'received'
    ELSE 'none'
  END AS friendshipStatus

FROM users u
JOIN profiles p ON p.user_id = u.id
WHERE u.id = ?;
`;

const params: string[] = [
  // For location visibility
  currentUserId, currentUserId, currentUserId,
  // For birthdate visibility
  currentUserId, currentUserId, currentUserId,
  // For gender visibility
  currentUserId, currentUserId, currentUserId,
  // For returning visibilities when self
  currentUserId, currentUserId, currentUserId,
  // For profile like + friendship
  currentUserId,
  currentUserId, currentUserId, currentUserId, currentUserId, currentUserId,
  // Target user
  profileUserId,
];
    const queryResult = await executeQuery(query, params);
    const profile: Profile = (queryResult as any[])[0];
Logger.log(COMPONENT, FUNCTION, "debug", "Profile fetched successfully", {
      found: !!profile,
      profile: profile,
    });
    return profile||null;
  }
  async createProfile(
    userId: string,
    dateOfBirth: string,
    dateOfBirthVisibility: PrivacyLevel,
    gender: GenderType,
    genderVisibility: PrivacyLevel,
    bio: string,
    location: string,
    locationVisibility: PrivacyLevel
  ): Promise<void> {
    const FUNCTION = "createProfile";
    if (!userId || !dateOfBirth || !gender || !location) {
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
        ,location = VALUES(location),location_visibility=VALUES(location_visibility)
        ,birthdate=VALUES(birthdate),birthdate_visibility=VALUES(birthdate_visibility)
        ,gender = VALUES(gender),gender_visibility=VALUES(gender_visibility)
        `,
        [
          userId,
          bio || "",
          location,
          locationVisibility,
          dateOfBirth,
          dateOfBirthVisibility,
          gender,
          genderVisibility,
        ]
      );

      Logger.log(COMPONENT, FUNCTION, "debug", "Profile Created successfully", {
        userId,
      });
    } catch (error: any) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]Failed to create notification: ` +
          error.message
      );
    }
  }
}
export const profileService = new ProfileService();
