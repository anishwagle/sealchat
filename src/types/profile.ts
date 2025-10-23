export type FriendshipStatus= 'accepted'|'blocked'|'received'|'sent'|'none'
export type PrivacyLevel = 'private' | 'friends' | 'public';
export type GenderType = 'male' | 'female' | 'non-binary' | 'other'|'prefer_not_to_say';
export interface Profile {
  userId:string;
  username: string;
  friendshipStatus?:FriendshipStatus;
  profileLikeCount?:number;
  profileFriendCount?:number;
  profileLikeStatus?:boolean;
  fullName: string;
  bio?: string;
  gender?: GenderType;
  genderVisibility?:PrivacyLevel;
  birthdate?: Date;
  birthdateVisibility?:PrivacyLevel;
  location?: string;
  locationVisibility?:PrivacyLevel;
  profession?: string;
  education?: Array<{
    school: string;
    degree?: string;
    year?: string;
  }>;
  work?: Array<{
    company: string;
    position: string;
    period?: string;
  }>;
  skills?: string[];
  interests?: string[];
  links?: Array<{
    title: string;
    url: string;
  }>;
  joinedAt: string;
}