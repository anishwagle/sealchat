import { Post, PostType } from "@/types/post";

export interface IPostService {
  createPost(
    userId: string,
    content: string,
    type: PostType,
    durationDays?: number
  ): Promise<void>;
  getPostById(postId:string,currentUserId:string):Promise<Post|null>;
  getUserPaginatedPosts(userId: string,cursorCreatedAt?:string,direction?:string, limit?:number): Promise<Post[]>;
  getPublicOpinions(userId: string,currentUserId: string): Promise<Post[]>;
  getFriendPosts(userId: string,
    currentUserId: string,
    cursorCreatedAt?: string,
    direction?:string,
    limit?: number ): Promise<Post[]>;
  getPrivatePosts(currentUserId: string): Promise<Post[]>;
  getAllPublicOpinions(currentUserId: string): Promise<Post[]>;
  deletePost(userId:string,postId:string):Promise<void>;
}
