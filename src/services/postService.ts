import { Logger } from "@/lib/logger";
import { Post, PostType } from "../types/post";
import { IPostService } from "./IPostService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { mediaService } from "./MediaService";

const COMPONENT = "PostService";

export class PostService implements IPostService {
  async createPost(
    userId: string,
    content: string,
    type: PostType,
    durationDays?: number,
    sharedPostId?: string,
    mediaIds?: string[]
  ): Promise<void> {
    const FUNCTION = "createPost";
    Logger.log(COMPONENT, FUNCTION, "debug", "Creating new post", { userId, type });

    let expiresAt = null;
    if (type === "public_opinion" && durationDays) {
      expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    }

    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .insert({
        user_id: userId,
        content: content,
        type: type,
        duration_days: durationDays || null,
        expires_at: expiresAt,
        shared_post_id: sharedPostId || null,
        is_draft: false,
      })
      .select("id")
      .single();

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to create post", { error });
      throw new Error("Failed to create post: " + error.message);
    }

    if (mediaIds && mediaIds.length > 0) {
      await mediaService.linkMediaToPost(post.id, mediaIds);
    }

    Logger.log(COMPONENT, FUNCTION, "info", "Post published successfully", { postId: post.id });
  }

  async saveDraft(
    userId: string,
    content: string,
    type: PostType,
    mediaIds?: string[]
  ): Promise<string> {
    const FUNCTION = "saveDraft";
    Logger.log(COMPONENT, FUNCTION, "debug", "Saving post draft", { userId });

    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .insert({
        user_id: userId,
        content: content,
        type: type,
        is_draft: true,
      })
      .select("id")
      .single();

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to save draft", { error });
      throw new Error("Failed to save draft: " + error.message);
    }

    if (mediaIds && mediaIds.length > 0) {
      await mediaService.linkMediaToPost(post.id, mediaIds);
    }

    return post.id;
  }

  async getPostById(postId: string, currentUserId: string): Promise<Post | null> {
    const FUNCTION = "getPostById";
    
    const { data: post, error } = await supabaseAdmin
      .from("posts")
      .select(`
        *,
        profiles (username, full_name),
        post_media (id, storage_path, url, media_type),
        likes:likes(count),
        comments:comments(count),
        shares:posts!shared_post_id(count)
      `)
      .eq("id", postId)
      .single();

    if (error || !post) {
      Logger.log(COMPONENT, FUNCTION, "debug", "Post not found or inaccessible", { postId });
      return null;
    }

    const isOwner = post.user_id === currentUserId;
    if (post.is_draft && !isOwner) return null;

    const [hydratedPost] = await this.hydrateEngagement([post], currentUserId);
    return hydratedPost;
  }

  async getPostsByIds(postIds: string[], currentUserId: string): Promise<Post[]> {
    if (!postIds.length) return [];
    
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select(`
        *,
        profiles (username, full_name),
        post_media (id, storage_path, url, media_type),
        likes:likes(count),
        comments:comments(count),
        shares:posts!shared_post_id(count)
      `)
      .in("id", postIds)
      .eq("is_archived", false)
      .eq("is_draft", false);

    if (error) return [];
    return this.hydrateEngagement(data, currentUserId);
  }

  async getUserPaginatedPosts(
    userId: string,
    cursorCreatedAt?: string,
    direction: "older" | "newer" = "older",
    limit: number = 20
  ): Promise<Post[]> {
    let query = supabaseAdmin
      .from("posts")
      .select(`
        *,
        profiles (username, full_name),
        post_media (id, storage_path, url, media_type),
        likes:likes(count),
        comments:comments(count),
        shares:posts!shared_post_id(count)
      `)
      .eq("user_id", userId)
      .eq("is_archived", false)
      .eq("is_draft", false)
      .order("created_at", { ascending: direction === "newer" })
      .limit(limit);

    if (cursorCreatedAt) {
      if (direction === "older") query = query.lt("created_at", cursorCreatedAt);
      else query = query.gt("created_at", cursorCreatedAt);
    }

    const { data, error } = await query;
    if (error) return [];
    return this.hydrateEngagement(data, userId);
  }

  async getPublicOpinions(
    userId: string,
    currentUserId: string,
    cursorCreatedAt?: string,
    direction: "older" | "newer" = "older",
    limit: number = 20
  ): Promise<Post[]> {
    return this.fetchPostsByFilter(
      { type: "public_opinion", user_id: userId, is_archived: false, is_draft: false },
      currentUserId,
      cursorCreatedAt,
      direction,
      limit
    );
  }

  async getAllPublicOpinions(
    currentUserId: string,
    cursorCreatedAt?: string,
    direction: "older" | "newer" = "older",
    limit: number = 20
  ): Promise<Post[]> {
    return this.fetchPostsByFilter(
      { type: "public_opinion", is_archived: false, is_draft: false },
      currentUserId,
      cursorCreatedAt,
      direction,
      limit
    );
  }

  async getFriendPosts(
    userId: string,
    currentUserId: string,
    cursorCreatedAt?: string,
    direction: "older" | "newer" = "older",
    limit: number = 20
  ): Promise<Post[]> {
    return this.fetchPostsByFilter(
      { type: "friend_post", user_id: userId, is_archived: false, is_draft: false },
      currentUserId,
      cursorCreatedAt,
      direction,
      limit
    );
  }

  async getPrivatePosts(currentUserId: string): Promise<Post[]> {
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select(`
        *,
        profiles (username, full_name),
        post_media (id, storage_path, url, media_type),
        likes:likes(count),
        comments:comments(count),
        shares:posts!shared_post_id(count)
      `)
      .eq("user_id", currentUserId)
      .eq("is_draft", true)
      .order("created_at", { ascending: false });

    if (error) return [];
    return this.hydrateEngagement(data, currentUserId);
  }

  async getUserFeed(
    currentUserId: string,
    cursorCreatedAt?: string,
    direction: "older" | "newer" = "older",
    limit: number = 20
  ): Promise<Post[]> {
    const FUNCTION = "getUserFeed";
    Logger.log(COMPONENT, FUNCTION, "debug", "Fetching optimized user feed via RPC", { currentUserId });

    // Use the RPC for the Feed logic
    const { data, error } = await supabaseAdmin.rpc("get_user_feed", {
      p_user_id: currentUserId,
      p_limit: limit,
      p_cursor: (cursorCreatedAt && !isNaN(Date.parse(cursorCreatedAt))) ? cursorCreatedAt : null
    });

    if (error || !data) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to fetch feed via RPC", { error });
      return [];
    }

    // Now we hydrate the profiles, media, and counts for these post IDs
    const postIds = data.map((p: any) => p.id);
    if (!postIds.length) return [];

    const { data: hydratedPosts, error: hydrationError } = await supabaseAdmin
      .from("posts")
      .select(`
        *,
        profiles (username, full_name),
        post_media (id, storage_path, url, media_type),
        likes:likes(count),
        comments:comments(count),
        shares:posts!shared_post_id(count)
      `)
      .in("id", postIds);

    if (hydrationError) return [];

    // Since in query results might be unordered, we re-order based on the initial RPC result
    const sortedPosts = postIds.map((id: string) => hydratedPosts.find(p => p.id === id)).filter(Boolean);
    return this.hydrateEngagement(sortedPosts, currentUserId);
  }

  async getArchivedPost(
    currentUserId: string,
    cursorCreatedAt?: string,
    limit: number = 20
  ): Promise<Post[]> {
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select(`
        *,
        profiles (username, full_name),
        post_media (id, storage_path, url, media_type),
        likes:likes(count),
        comments:comments(count),
        shares:posts!shared_post_id(count)
      `)
      .eq("user_id", currentUserId)
      .eq("is_archived", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return this.hydrateEngagement(data, currentUserId);
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const FUNCTION = "deletePost";
    const { data: media } = await supabaseAdmin
      .from("post_media")
      .select("storage_path")
      .eq("post_id", postId);

    const { error } = await supabaseAdmin
      .from("posts")
      .delete()
      .match({ id: postId, user_id: userId });

    if (error) {
      Logger.log(COMPONENT, FUNCTION, "error", "Failed to delete post", { error });
      throw new Error("Failed to delete post: " + error.message);
    }

    if (media && media.length > 0) {
      await mediaService.deleteMediaFromStorage(media.map(m => m.storage_path));
    }
  }

  // --- Helper Methods ---

  private async hydrateEngagement(rows: any[], currentUserId: string): Promise<Post[]> {
    if (!rows.length) return [];
    
    const postIds = rows.map(r => r.id);
    
    // Call the RPC to get engagement status for all these posts in one go
    const { data: statusData, error } = await supabaseAdmin.rpc("get_engagement_status", {
      p_user_id: currentUserId,
      p_post_ids: postIds
    });

    const likedPostIds = new Set((statusData || []).filter((s: any) => s.is_liked).map((s: any) => s.post_id));

    return rows.map(row => {
      const post = this.mapRowToPost(row, currentUserId);
      post.isLikedByCurrentUser = likedPostIds.has(post.id);
      return post;
    });
  }

  private async fetchPostsByFilter(
    filter: any,
    currentUserId: string,
    cursorCreatedAt?: string,
    direction: "older" | "newer" = "older",
    limit: number = 20
  ): Promise<Post[]> {
    let query = supabaseAdmin
      .from("posts")
      .select(`
        *,
        profiles (username, full_name),
        post_media (id, storage_path, url, media_type),
        likes:likes(count),
        comments:comments(count),
        shares:posts!shared_post_id(count)
      `)
      .match(filter)
      .order("created_at", { ascending: direction === "newer" })
      .limit(limit);

    if (cursorCreatedAt) {
      if (direction === "older") query = query.lt("created_at", cursorCreatedAt);
      else query = query.gt("created_at", cursorCreatedAt);
    }

    const { data, error } = await query;
    if (error) return [];
    return this.hydrateEngagement(data, currentUserId);
  }

  private mapRowToPost(row: any, currentUserId: string): Post {
    return {
      id: row.id,
      userId: row.user_id,
      username: row.profiles?.username || "Unknown",
      fullName: row.profiles?.full_name || "Unknown",
      type: row.type,
      content: row.content,
      originalContent: row.content,
      durationDays: row.duration_days,
      expiresAt: row.expires_at ? new Date(row.expires_at) : null,
      isArchived: row.is_archived,
      isDraft: row.is_draft,
      createdAt: new Date(row.created_at),
      likeCount: row.likes?.[0]?.count || 0,
      commentCount: row.comments?.[0]?.count || 0,
      shareCount: row.shares?.[0]?.count || 0,
      sharedPostId: row.shared_post_id,
      isLikedByCurrentUser: false, // Populated by hydrateEngagement for bulk, or overwritten by single query
      media: (row.post_media || []).map((m: any) => ({
        id: m.id,
        storagePath: m.storage_path,
        url: m.url,
        mediaType: m.media_type,
      })),
    };
  }
}

export const postService = new PostService();