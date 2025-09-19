import { FeedResult, Post, PostType } from "@/types/post";

export interface IPostService {
  createPost(
    userId: string,
    content: string,
    type: PostType,
    durationDays?: number
  ): Promise<void>;
  getUserPosts(userId: string): Promise<Post[]>
}
