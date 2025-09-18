export type PostType = "friend_post" | "public_opinion";
export interface FeedResult {
  posts: Post[];
  nextCursor?: Date | null;
}
export interface Post {
  id: string;
  userId: string;
  type: PostType;
  content: string;
  durationDays?: number;
  expiresAt?: Date;
  isArchived: boolean;
  createdAt: Date;
}
