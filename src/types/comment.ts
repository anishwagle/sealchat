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
export interface CommentLike {
  id:number;
  userId: string;
  commentId: string;
  createdAt: Date;
  username: string;
}