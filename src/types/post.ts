export type PostType = "friend_post" | "public_opinion";

export interface Comment {
  id: string;
  content: string;
  originalContent: string;
  userId:string;
  username: string;
  createdAt: Date;
  postId: string;
  parentCommentId?: string | null;
  replyCount?:number;
  likeCount?:number;
}

export interface Like {
  id:number;
  userId: string;
  postId: string;
  createdAt: Date;
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
  likeCount:number;
  commentCount:number;
  isLikedByCurrentUser:boolean;
}
