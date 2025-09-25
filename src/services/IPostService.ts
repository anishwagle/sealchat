import { Post, PostType } from "@/types/post";

export interface IPostService {
  createPost(
    userId: string,
    content: string,
    type: PostType,
    durationDays?: number
  ): Promise<void>;
  getPostById(postId:string,currentUserId:string):Promise<Post|null>;
  getUserPosts(userId: string): Promise<Post[]>;
  getPublicOpinions(userId: string,isCurrentUser?:boolean): Promise<Post[]>;
  getFriendPosts(userId: string, currentUserId: string): Promise<Post[]>;
  getPrivatePosts(currentUserId: string): Promise<Post[]>;
  getAllPublicOpinions(): Promise<Post[]>;
  deletePost(userId:string,postId:string):Promise<void>;
}
