import { Post, PostType } from "@/types/post";

export interface IPostService {
  createPost(
    userId: string,
    content: string,
    type: PostType,
    durationDays?: number,
    sharedPostId?:string
  ): Promise<void>;
  getPostById(postId: string, currentUserId: string): Promise<Post | null>;
  getPostsByIds(
  postIds: string[],   // array of shared_post_id
  currentUserId: string
): Promise<Post[]>;
  getUserPaginatedPosts(
    userId: string,
    cursorCreatedAt?: string,
    direction?: "older" | "newer",
    limit?: number
  ): Promise<Post[]>;
  getPublicOpinions(
    userId: string,
    currentUserId: string,
    cursorCreatedAt?: string,
    direction?: "older" | "newer",
    limit?: number
  ): Promise<Post[]>;
  getFriendPosts(
    userId: string,
    currentUserId: string,
    cursorCreatedAt?: string,
    direction?: "older" | "newer",
    limit?: number
  ): Promise<Post[]>;
  getPrivatePosts(currentUserId: string): Promise<Post[]>;
  getAllPublicOpinions(
    currentUserId: string,
    cursorCreatedAt?: string,
    direction?: "older" | "newer",
    limit?: number
  ): Promise<Post[]>;
  getUserFeed(
    currentUserId: string,
    cursorCreatedAt?: string,
    direction?: "older" | "newer",
    limit?: number
  ): Promise<Post[]>;
  deletePost(userId: string, postId: string): Promise<void>;
}
