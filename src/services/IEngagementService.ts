import { Comment,Like} from "@/types/post";

export interface IEngagementService {
  createComment(
    userId: string,
    content: string,
    postId: string,
    parentCommentId?: string | null
  ): Promise<Comment>;
  getPublicOpinionComment(postId:string): Promise<Comment[]>;
  getFriendPostComment(currentUserId: string,postId:string): Promise<Comment[]>;
  deleteComment(userId:string,commentId:string):Promise<void>;
  togglePostLike(userId: string, postId: string): Promise<void>;
  getPostLikeList(postId:string):Promise<Like[]>;
  getPostLikeList(postId: string): Promise<Like[]>
}
