import { Like } from "@/types/post";
import { Comment } from "@/types/comment";
export interface IEngagementService {
  createComment(
    userId: string,
    content: string,
    postId: string,
    parentCommentId?: string | null
  ): Promise<Comment>;

  getPostComment(
    currentUserId: string,
    postId: string,
    cursorCreatedAt?: string | null,
    limit?: number
  ): Promise<Comment[]>;
  getCommentReplies(
    currentUserId:string,
    commentId: string,
    cursorCreatedAt?: string | null,
    limit?: number
  ): Promise<Comment[]>;
  deleteComment(userId: string, commentId: string): Promise<void>;
  togglePostLike(userId: string, postId: string): Promise<void>;
  toggleCommentLike(userId: string, commentId: string): Promise<void>;
  getPostLikeList(postId: string): Promise<Like[]>;
}
