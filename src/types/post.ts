export type PostType = "friend_post" | "public_opinion";

export interface Like {
  id:number;
  userId: string;
  postId: string;
  createdAt: Date;
  username: string;
  fullName: string;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  type: PostType;
  content: string;
  originalContent: string;
  durationDays?: number;
  expiresAt?: Date | null;
  isArchived: boolean;
  createdAt: Date;
  likeCount:number;
  commentCount:number;
  sharedPostId:string|null;
  sharedPost?:Post;
  shareCount:number;
  isLikedByCurrentUser:boolean;
}
