export type PostType = "friend_post" | "public_opinion";
export interface FeedResult {
  posts: Post[];
  nextCursor?: Date | null;
}
export interface Post {
  id: string;
  userId: string;
  username:string;
  type: PostType;
  content: string;
  originalContent:string;
  durationDays?: number;
  expiresAt?: Date|null;
  isArchived: boolean;
  createdAt: Date;
}
