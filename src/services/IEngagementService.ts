import { Like } from "@/types/post";
import { Comment } from "@/types/comment";
export interface IEngagementService {
  createComment(
    userId: string,
    content: string,
    postId: string,
    parentCommentId?: string | null
  ): Promise<Comment>;
  getPublicOpinionComment(
    postId: string,
    cursorCreatedAt?: string | null,
    limit?: number
  ): Promise<Comment[]>;
  getFriendPostComment(
    currentUserId: string,
    postId: string,
    cursorCreatedAt?: string | null,
    limit?: number
  ): Promise<Comment[]>;
  getCommentReplies(
    commentId: string,
    cursorCreatedAt?: string | null,
    limit?: number
  ): Promise<Comment[]>;
  deleteComment(userId: string, commentId: string): Promise<void>;
  togglePostLike(userId: string, postId: string): Promise<void>;
  toggleCommentLike(userId: string, commentId: string): Promise<void>;
  getPostLikeList(postId: string): Promise<Like[]>;
}
