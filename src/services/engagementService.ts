import { Logger } from "@/lib/logger";
import { Like } from "../types/post";
import { Comment } from "@/types/comment";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { IEngagementService } from "./IEngagementService";

const COMPONENT = "EngagementService";

export class EngagementService implements IEngagementService {
  async getPostLikeList(postId: string): Promise<Like[]> {
    const FUNCTION = "getPostLikeList";
    Logger.log(COMPONENT, FUNCTION, "debug", "Fetching post like list", { postId });

    const { data, error } = await supabaseAdmin
      .from("likes")
      .select(`
        id,
        user_id,
        post_id,
        created_at,
        profiles (
          username,
          full_name
        )
      `)
      .eq("post_id", postId);

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to fetch post likes", { error });
      return [];
    }

    return (data || []).map((x: any) => ({
      id: x.id,
      userId: x.user_id,
      postId: x.post_id,
      username: x.profiles?.username || "Unknown",
      fullName: x.profiles?.full_name || "Unknown",
      createdAt: new Date(x.created_at),
    }));
  }

  async createComment(
    userId: string,
    content: string,
    postId: string,
    parentCommentId?: string | null
  ): Promise<Comment> {
    const FUNCTION = "createComment";
    Logger.log(COMPONENT, FUNCTION, "debug", "Creating new comment", { userId, postId });

    if (!userId || !content || !postId) {
      throw new Error("User ID, content, and postId are required");
    }

    const { data: comment, error } = await supabaseAdmin
      .from("comments")
      .insert({
        user_id: userId,
        post_id: postId,
        content: content, // RAW TEXT
        parent_comment_id: parentCommentId || null,
      })
      .select(`
        *,
        profiles (
          username,
          full_name
        )
      `)
      .single();

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to create comment", { error });
      throw new Error("Failed to create comment: " + error.message);
    }

    return {
      id: comment.id,
      content: comment.content,
      originalContent: comment.content,
      userId: comment.user_id,
      postId: comment.post_id,
      createdAt: new Date(comment.created_at),
      username: comment.profiles?.username || "Unknown",
      fullName: comment.profiles?.full_name || "Unknown",
      parentCommentId: comment.parent_comment_id,
      replyCount: 0,
      likeCount: 0,
      isLikedByCurrentUser: false,
    };
  }

  async getPostComment(
    currentUserId: string,
    postId: string,
    cursorCreatedAt?: string | null,
    limit: number = 10
  ): Promise<Comment[]> {
    const FUNCTION = "getPostComment";
    Logger.log(COMPONENT, FUNCTION, "debug", "Fetching post comments", { postId });

    let query = supabaseAdmin
      .from("comments")
      .select(`
        *,
        profiles (username, full_name),
        comment_likes (user_id),
        replies:comments(count),
        likes:comment_likes(count)
      `)
      .eq("post_id", postId)
      .is("parent_comment_id", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cursorCreatedAt) {
      query = query.lt("created_at", cursorCreatedAt);
    }

    const { data, error } = await query;

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to fetch comments", { error });
      return [];
    }

    return (data || []).map((c: any) => ({
      id: c.id,
      userId: c.user_id,
      username: c.profiles?.username || "Unknown",
      fullName: c.profiles?.full_name || "Unknown",
      originalContent: c.content,
      content: c.content,
      parentCommentId: c.parent_comment_id,
      postId: c.post_id,
      createdAt: new Date(c.created_at),
      replyCount: c.replies?.[0]?.count || 0,
      likeCount: c.likes?.[0]?.count || 0,
      isLikedByCurrentUser: (c.comment_likes || []).some((l: any) => l.user_id === currentUserId),
    }));
  }

  async getCommentReplies(
    currentUserId: string,
    commentId: string,
    cursorCreatedAt?: string | null,
    limit: number = 10
  ): Promise<Comment[]> {
    const FUNCTION = "getCommentReplies";
    Logger.log(COMPONENT, FUNCTION, "debug", "Fetching comment replies", { commentId });

    let query = supabaseAdmin
      .from("comments")
      .select(`
        *,
        profiles (username, full_name),
        comment_likes (user_id),
        replies:comments(count),
        likes:comment_likes(count)
      `)
      .eq("parent_comment_id", commentId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (cursorCreatedAt) {
      query = query.lt("created_at", cursorCreatedAt);
    }

    const { data, error } = await query;

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to fetch replies", { error });
      return [];
    }

    return (data || []).map((c: any) => ({
      id: c.id,
      userId: c.user_id,
      username: c.profiles?.username || "Unknown",
      fullName: c.profiles?.full_name || "Unknown",
      originalContent: c.content,
      content: c.content,
      parentCommentId: c.parent_comment_id,
      postId: c.post_id,
      createdAt: new Date(c.created_at),
      replyCount: c.replies?.[0]?.count || 0,
      likeCount: c.likes?.[0]?.count || 0,
      isLikedByCurrentUser: (c.comment_likes || []).some((l: any) => l.user_id === currentUserId),
    }));
  }

  async deleteComment(userId: string, commentId: string): Promise<void> {
    const FUNCTION = "deleteComment";
    Logger.log(COMPONENT, FUNCTION, "debug", "Deleting comment", { userId, commentId });

    // RLS handles permission, but we'll include userId check in query for safety
    const { error } = await supabaseAdmin
      .from("comments")
      .delete()
      .match({ id: commentId, user_id: userId });

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to delete comment", { error });
      throw new Error("Failed to delete comment: " + error.message);
    }
  }

  async togglePostLike(userId: string, postId: string): Promise<void> {
    const FUNCTION = "togglePostLike";
    Logger.log(COMPONENT, FUNCTION, "debug", "Toggling post like", { userId, postId });

    const { data: existingLike } = await supabaseAdmin
      .from("likes")
      .select("id")
      .match({ user_id: userId, post_id: postId })
      .single();

    if (existingLike) {
      await supabaseAdmin.from("likes").delete().match({ user_id: userId, post_id: postId });
    } else {
      await supabaseAdmin.from("likes").insert({ user_id: userId, post_id: postId });
    }
  }

  async toggleCommentLike(userId: string, commentId: string): Promise<void> {
    const FUNCTION = "toggleCommentLike";
    Logger.log(COMPONENT, FUNCTION, "debug", "Toggling comment like", { userId, commentId });

    const { data: existingLike } = await supabaseAdmin
      .from("comment_likes")
      .select("id")
      .match({ user_id: userId, comment_id: commentId })
      .single();

    if (existingLike) {
      await supabaseAdmin.from("comment_likes").delete().match({ user_id: userId, comment_id: commentId });
    } else {
      await supabaseAdmin.from("comment_likes").insert({ user_id: userId, comment_id: commentId });
    }
  }
}

export const engagementService = new EngagementService();
