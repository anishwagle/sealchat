export type PostType = "friend_post" | "public_opinion";

export interface Comment {
  id: string;
  content: string;
  userId:string;
  username: string;
  createdAt: string;
}

export interface Like {
  username: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  type: PostType;
  content: string;
  originalContent: string;
  durationDays?: number;
  expiresAt?: Date | null;
  isArchived: boolean;
  createdAt: Date;
  likes?: Like[];
  comments?: Comment[];
}
