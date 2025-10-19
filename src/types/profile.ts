export type FriendshipStatus= 'accepted'|'blocked'|'received'|'sent'|'none'

export interface Profile {
  userId:string;
  username: string;
  friendshipStatus:FriendshipStatus;
  profileLikeCount:number;
  profileFriendCount?:number;
  profileLikeStatus:boolean;
  fullName: string;
  bio?: string;
  location?: string;
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