import { Logger } from "@/lib/logger";
import { Post, PostType } from "../types/post";
import { IPostService } from "./IPostService";
import { v4 } from "uuid";
import { QueryResult } from "mysql2";
import {} from "./INotificationService";
import { notificationService } from "./serviceProvider";
import {
  convertMentionsIntoLinks,
  getEmbedSection,
  getLinksFromString,
  getMentionAndIdForString,
} from "@/utils/stringParser";
import executeQuery from "../db";

const COMPONENT = "PostService";
export class PostService implements IPostService {
  async getPostById(
    postId: string,
    currentUserId: string
  ): Promise<Post | null> {
    const FUNCTION = "getPostById";
    Logger.log(COMPONENT, FUNCTION, "debug", "Fetching post by id", {
      postId,
      currentUserId,
    });

    const results = await executeQuery(
      `SELECT 
    p.id,
    p.user_id,
    u.username,
    p.original_content,
    p.type,
    p.content,
    p.duration_days,
    p.expires_at,
    p.is_archived,
    p.created_at,
    -- Pre-aggregated comment count
    COALESCE(c.comment_count, 0) AS comment_count,
    -- Pre-aggregated like count
    COALESCE(l.like_count, 0) AS like_count,
    -- Check if current user liked the post
    CASE WHEN ul.user_id IS NULL THEN FALSE ELSE TRUE END AS is_liked_by_current_user
    FROM posts p
    JOIN users u ON p.user_id = u.id
    -- Aggregate comments
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY post_id
    ) c ON p.id = c.post_id
    -- Aggregate likes
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS like_count
        FROM likes
        GROUP BY post_id
    ) l ON p.id = l.post_id
    -- Check if current user liked this post
    LEFT JOIN (
        SELECT post_id, user_id
        FROM likes
        WHERE user_id = ?  -- pass current user ID here
    ) ul ON p.id = ul.post_id
    WHERE p.id = ?;        -- pass target post ID here`,
      [currentUserId, postId]
    );

    const post = (results as any[])[0];
    Logger.log(COMPONENT, FUNCTION, "debug", " post by id fetched", post);
    if (currentUserId != post.user_id) {
      // Check if users are friends
      const friendResults = await executeQuery(
        "SELECT id FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)",
        [currentUserId, post.user_id, post.user_id, currentUserId]
      );
      const isFriend = (friendResults as any[]).length > 0;

      if (!isFriend) {
        Logger.log(COMPONENT, FUNCTION, "debug", "Users are not friends", {
          userId: post.user_id,
          currentUserId,
        });
        return null; // Return empty array if not friends
      }
    }

    return {
      id: post.id,
      userId: post.user_id,
      username: post.username,
      originalContent: post.original_content,
      type: post.type,
      content: post.content,
      durationDays: post.duration_days,
      expiresAt: post.expires_at ? new Date(post.expires_at) : null,
      isArchived: post.is_archived,
      createdAt: new Date(post.created_at),
      commentCount: post.comment_count,
      likeCount: post.like_count,
      isLikedByCurrentUser:post.is_liked_by_current_user
    };
  }
  async createPost(
    userId: string,
    content: string,
    type: PostType,
    durationDays?: number
  ): Promise<void> {
    const FUNCTION = "createPost";
    Logger.log(COMPONENT, FUNCTION, "debug", "creating new post", {
      userId,
      content,
      type,
    });
    if (!userId || !content || !type) {
      throw new Error("User ID, content, and type are required");
    }
    if (content.length > 1000) {
      throw new Error("Content must be 1000 characters or less");
    }
    if (
      type === "public_opinion" &&
      (!durationDays || durationDays < 1 || durationDays > 7)
    ) {
      throw new Error("Public opinions require duration between 1 and 7 days");
    }

    // Store original content and initialize embed section
    let processedContent = content;
    let embedSection = getEmbedSection(content);
    processedContent = getLinksFromString(processedContent);
    processedContent = await convertMentionsIntoLinks(
      processedContent,
      userId,
      type
    );

    // Combine processed content with embeds
    const finalContent = `
      <div class="post-content">${processedContent}</div>
      ${embedSection ? `<div class="post-embeds">${embedSection}</div>` : ""}
      `;

    try {
      const expiresAt =
        type === "public_opinion"
          ? new Date(Date.now() + durationDays! * 24 * 60 * 60 * 1000)
          : null;
      const postId = v4();
      await executeQuery(
        "INSERT INTO posts (id,user_id, type, content,original_content, duration_days, expires_at, is_archived) VALUES (?,?,?, ?, ?, ?, ?, ?)",
        [
          postId,
          userId,
          type,
          finalContent,
          content,
          durationDays || null,
          expiresAt,
          false,
        ]
      );
      const { mentions, usernameToId } = await getMentionAndIdForString(
        processedContent
      );
      for (const mention of mentions) {
        const username = mention[1];
        const userIdMentioned = usernameToId[username];
        if (!userIdMentioned) continue; // no user, skip
        if (userIdMentioned !== userId) {
          await notificationService.createNotification(
            userIdMentioned,
            "post_mention",
            userId,
            postId
          );
        }
      }
      Logger.log(COMPONENT, FUNCTION, "info", "New Post Created");
    } catch (error: any) {
      throw new Error("Failed to create post: " + error.message);
    }
  }
  async getUserPaginatedPosts(userId: string,cursorCreatedAt?:string,direction = 'older',limit:number = 20): Promise<Post[]> {
    const FUNCTION = "getUserPosts";
    Logger.log(COMPONENT, FUNCTION, "debug", "get user's post", {
      userId,
    });
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    let query = `SELECT 
    p.id,
    p.user_id,
    u.username,
    p.original_content,
    p.type,
    p.content,
    p.duration_days,
    p.expires_at,
    p.is_archived,
    p.created_at,
    -- Pre-aggregated comment count
    COALESCE(c.comment_count, 0) AS comment_count,
    -- Pre-aggregated like count
    COALESCE(l.like_count, 0) AS like_count,
    -- Check if current user liked the post
    CASE WHEN ul.user_id IS NULL THEN FALSE ELSE TRUE END AS is_liked_by_current_user
    FROM posts p
    JOIN users u ON p.user_id = u.id
    -- Aggregate comments
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY post_id
    ) c ON p.id = c.post_id
    -- Aggregate likes
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS like_count
        FROM likes
        GROUP BY post_id
    ) l ON p.id = l.post_id
    -- Check if current user liked this post
    LEFT JOIN (
        SELECT post_id, user_id
        FROM likes
        WHERE user_id = ?  -- pass current user ID here
    ) ul ON p.id = ul.post_id
       WHERE p.user_id = ? AND p.is_archived = false
       AND (p.expires_at IS NULL OR p.expires_at > NOW())`;
  const params = [userId,userId];
  if (cursorCreatedAt) {
    query += direction === 'older' ? ` AND p.created_at < ? ` : ` AND p.created_at > ? `;
    params.push(cursorCreatedAt);
  }

  query += ` ORDER BY p.created_at ${direction === 'older' ? 'DESC' : 'ASC'} LIMIT ? `;
  params.push(`${limit}`);


    try {
      const queryResult = await executeQuery(
        query,
        params
      );
      const posts:Post[]= (queryResult as any[]).map((post) => ({
        id: post.id,
        userId: post.user_id,
        username: post.username,
        originalContent: post.original_content,
        type: post.type,
        content: post.content,
        durationDays: post.duration_days,
        expiresAt: post.expires_at ? new Date(post.expires_at) : null,
        isArchived: post.is_archived,
        createdAt: new Date(post.created_at),
        commentCount: post.comment_count,
        likeCount: post.like_count,
        isLikedByCurrentUser:post.is_liked_by_current_user
      }));
      return direction === 'older' ? posts : posts.reverse();
    } catch (error: any) {
      throw new Error("Failed to fetch user posts: " + error.message);
    }
  }

  async getFriendPosts(userId: string, currentUserId: string): Promise<Post[]> {
    const FUNCTION = "getFriendPosts";
    if (!userId || !currentUserId) {
      throw new Error("User ID and current user ID are required");
    }

    // Check if users are friends
    const friendResults = await executeQuery(
      "SELECT id FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)",
      [currentUserId, userId, userId, currentUserId]
    );
    const isFriend = (friendResults as any[]).length > 0;

    if (!isFriend) {
      Logger.log(COMPONENT, FUNCTION, "debug", "Users are not friends", {
        userId,
        currentUserId,
      });
      return []; // Return empty array if not friends
    }

    try {
      const results = await executeQuery(
        `SELECT 
    p.id,
    p.user_id,
    u.username,
    p.original_content,
    p.type,
    p.content,
    p.duration_days,
    p.expires_at,
    p.is_archived,
    p.created_at,
    -- Pre-aggregated comment count
    COALESCE(c.comment_count, 0) AS comment_count,
    -- Pre-aggregated like count
    COALESCE(l.like_count, 0) AS like_count,
    -- Check if current user liked the post
    CASE WHEN ul.user_id IS NULL THEN FALSE ELSE TRUE END AS is_liked_by_current_user
    FROM posts p
    JOIN users u ON p.user_id = u.id
    -- Aggregate comments
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY post_id
    ) c ON p.id = c.post_id
    -- Aggregate likes
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS like_count
        FROM likes
        GROUP BY post_id
    ) l ON p.id = l.post_id
    -- Check if current user liked this post
    LEFT JOIN (
        SELECT post_id, user_id
        FROM likes
        WHERE user_id = ?  -- pass current user ID here
    ) ul ON p.id = ul.post_id
         WHERE p.user_id = ? AND p.type = 'friend_post' AND p.is_archived = false`,
        [currentUserId, userId]
      );
      Logger.log(COMPONENT, FUNCTION, "debug", "Post Fetched Successfully", {
        userId,
      });
      return (results as any[]).map((post) => ({
        id: post.id,
        userId: post.user_id,
        username: post.username,
        originalContent: post.original_content,
        type: post.type,
        content: post.content,
        durationDays: post.duration_days,
        expiresAt: post.expires_at ? new Date(post.expires_at) : null,
        isArchived: post.is_archived,
        createdAt: new Date(post.created_at),
        commentCount: post.comment_count,
        likeCount: post.like_count,
        isLikedByCurrentUser:post.is_liked_by_current_user
      }));
    } catch (error: any) {
      throw new Error("Failed to fetch friend posts: " + error.message);
    }
  }

  async getPublicOpinions(
    userId: string,
    currentUserId: string
  ): Promise<Post[]> {
    const FUNCTION = "getPublicOpinions";
    try {
      let results: QueryResult;
      if (currentUserId!= userId) {
        results = await executeQuery(
          `SELECT 
    p.id,
    p.user_id,
    u.username,
    p.original_content,
    p.type,
    p.content,
    p.duration_days,
    p.expires_at,
    p.is_archived,
    p.created_at,
    -- Pre-aggregated comment count
    COALESCE(c.comment_count, 0) AS comment_count,
    -- Pre-aggregated like count
    COALESCE(l.like_count, 0) AS like_count,
    -- Check if current user liked the post
    CASE WHEN ul.user_id IS NULL THEN FALSE ELSE TRUE END AS is_liked_by_current_user
    FROM posts p
    JOIN users u ON p.user_id = u.id
    -- Aggregate comments
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY post_id
    ) c ON p.id = c.post_id
    -- Aggregate likes
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS like_count
        FROM likes
        GROUP BY post_id
    ) l ON p.id = l.post_id
    -- Check if current user liked this post
    LEFT JOIN (
        SELECT post_id, user_id
        FROM likes
        WHERE user_id = ?  -- pass current user ID here
    ) ul ON p.id = ul.post_id
         WHERE p.user_id = ? AND p.type = 'public_opinion' AND p.is_archived = false
         AND (p.expires_at IS NULL OR p.expires_at > NOW())`,
          [currentUserId,userId]
        );
        Logger.log(
          COMPONENT,
          FUNCTION,
          "debug",
          "Public opinion Fetched for profile Successfully",
          {
            userId,
          }
        );
      } else {
        results = await executeQuery(
          `SELECT 
    p.id,
    p.user_id,
    u.username,
    p.original_content,
    p.type,
    p.content,
    p.duration_days,
    p.expires_at,
    p.is_archived,
    p.created_at,
    -- Pre-aggregated comment count
    COALESCE(c.comment_count, 0) AS comment_count,
    -- Pre-aggregated like count
    COALESCE(l.like_count, 0) AS like_count,
    -- Check if current user liked the post
    CASE WHEN ul.user_id IS NULL THEN FALSE ELSE TRUE END AS is_liked_by_current_user
    FROM posts p
    JOIN users u ON p.user_id = u.id
    -- Aggregate comments
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY post_id
    ) c ON p.id = c.post_id
    -- Aggregate likes
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS like_count
        FROM likes
        GROUP BY post_id
    ) l ON p.id = l.post_id
    -- Check if current user liked this post
    LEFT JOIN (
        SELECT post_id, user_id
        FROM likes
        WHERE user_id = ?  -- pass current user ID here
    ) ul ON p.id = ul.post_id
         WHERE p.type = 'public_opinion' AND p.is_archived = false AND (p.expires_at > NOW() OR p.expires_at IS NULL)
           AND (
             EXISTS (
               SELECT 1 FROM friends f
               WHERE (f.user_id_1 = p.user_id AND f.user_id_2 = ?) OR (f.user_id_1 = ? AND f.user_id_2 = p.user_id)
             ) OR EXISTS (
               SELECT 1 FROM follows fo
               WHERE fo.followed_id = p.user_id AND fo.follower_id = ?
             )
           )`,
          [currentUserId,currentUserId, currentUserId, currentUserId]
        );
        Logger.log(
          COMPONENT,
          FUNCTION,
          "debug",
          "Public opinion Fetched for feed Successfully",
          {
            userId,
          }
        );
      }

      return (results as any[]).map((post) => ({
        id: post.id,
        userId: post.user_id,
        username: post.username,
        originalContent: post.original_content,
        type: post.type,
        content: post.content,
        durationDays: post.duration_days,
        expiresAt: post.expires_at ? new Date(post.expires_at) : null,
        isArchived: post.is_archived,
        createdAt: new Date(post.created_at),
        commentCount: post.comment_count,
        likeCount: post.like_count,
        isLikedByCurrentUser:post.is_liked_by_current_user
      }));
    } catch (error: any) {
      throw new Error("Failed to fetch public opinions: " + error.message);
    }
  }

  async getPrivatePosts(currentUserId: string): Promise<Post[]> {
    const FUNCTION = "getPrivatePosts";
    if (!currentUserId) {
      throw new Error("Current user ID is required");
    }

    try {
      const results = await executeQuery(
        `SELECT 
    p.id,
    p.user_id,
    u.username,
    p.original_content,
    p.type,
    p.content,
    p.duration_days,
    p.expires_at,
    p.is_archived,
    p.created_at,
    -- Pre-aggregated comment count
    COALESCE(c.comment_count, 0) AS comment_count,
    -- Pre-aggregated like count
    COALESCE(l.like_count, 0) AS like_count,
    -- Check if current user liked the post
    CASE WHEN ul.user_id IS NULL THEN FALSE ELSE TRUE END AS is_liked_by_current_user
    FROM posts p
    JOIN users u ON p.user_id = u.id
    -- Aggregate comments
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY post_id
    ) c ON p.id = c.post_id
    -- Aggregate likes
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS like_count
        FROM likes
        GROUP BY post_id
    ) l ON p.id = l.post_id
    -- Check if current user liked this post
    LEFT JOIN (
        SELECT post_id, user_id
        FROM likes
        WHERE user_id = ?  -- pass current user ID here
    ) ul ON p.id = ul.post_id
         JOIN friends f ON (f.user_id_1 = p.user_id AND f.user_id_2 = ?) OR (f.user_id_1 = ? AND f.user_id_2 = p.user_id)
         WHERE p.type = 'friend_post' AND p.is_archived = false`,
        [currentUserId,currentUserId, currentUserId]
      );
      Logger.log(COMPONENT, FUNCTION, "debug", "Post Fetched Successfully", {
        currentUserId,
      });
      return (results as any[]).map((post) => ({
        id: post.id,
        userId: post.user_id,
        username: post.username,
        type: post.type,
        content: post.content,
        originalContent: post.original_content,
        durationDays: post.duration_days,
        expiresAt: post.expires_at ? new Date(post.expires_at) : null,
        isArchived: post.is_archived,
        createdAt: new Date(post.created_at),
        commentCount: post.comment_count,
        likeCount: post.like_count,
        isLikedByCurrentUser:post.is_liked_by_current_user
      }));
    } catch (error: any) {
      throw new Error("Failed to fetch private posts: " + error.message);
    }
  }

  async getAllPublicOpinions(currentUserId:string): Promise<Post[]> {
    try {
      const FUNCTION = "getPrivatePosts";
      const results = await executeQuery(
        `SELECT 
    p.id,
    p.user_id,
    u.username,
    p.original_content,
    p.type,
    p.content,
    p.duration_days,
    p.expires_at,
    p.is_archived,
    p.created_at,
    -- Pre-aggregated comment count
    COALESCE(c.comment_count, 0) AS comment_count,
    -- Pre-aggregated like count
    COALESCE(l.like_count, 0) AS like_count,
    -- Check if current user liked the post
    CASE WHEN ul.user_id IS NULL THEN FALSE ELSE TRUE END AS is_liked_by_current_user
    FROM posts p
    JOIN users u ON p.user_id = u.id
    -- Aggregate comments
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS comment_count
        FROM comments
        GROUP BY post_id
    ) c ON p.id = c.post_id
    -- Aggregate likes
    LEFT JOIN (
        SELECT post_id, COUNT(*) AS like_count
        FROM likes
        GROUP BY post_id
    ) l ON p.id = l.post_id
    -- Check if current user liked this post
    LEFT JOIN (
        SELECT post_id, user_id
        FROM likes
        WHERE user_id = ?  -- pass current user ID here
    ) ul ON p.id = ul.post_id
         WHERE p.type = 'public_opinion' AND p.is_archived = false
         AND (p.expires_at IS NULL OR p.expires_at > NOW())
         ORDER BY p.created_at DESC`
      ,[currentUserId]);
      Logger.log(COMPONENT, FUNCTION, "debug", "Post Fetched Successfully");
      return (results as any[]).map((post) => ({
        id: post.id,
        userId: post.user_id,
        username: post.username,
        type: post.type,
        content: post.content,
        originalContent: post.original_content,
        durationDays: post.duration_days,
        expiresAt: post.expires_at ? new Date(post.expires_at) : null,
        isArchived: post.is_archived,
        createdAt: new Date(post.created_at),
        commentCount: post.comment_count,
        likeCount: post.like_count,
        isLikedByCurrentUser:post.is_liked_by_current_user
      }));
    } catch (error: any) {
      throw new Error("Failed to fetch all public opinions: " + error.message);
    }
  }

  async deletePost(userId: string, postId: string): Promise<void> {
    const FUNCTION = "deletePost";
    if (!userId || !postId) {
      throw new Error("User ID and Post ID are required");
    }
    try {
      const result = await executeQuery(
        "DELETE FROM posts WHERE id = ? AND user_id = ?",
        [postId, userId]
      );
      if ((result as any).affectedRows === 0) {
        throw new Error(
          `[${COMPONENT}][${FUNCTION}]:Post not found or not owned by user`
        );
      }
    } catch (error: any) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]:Failed to delete Post: ` + error.message
      );
    }
  }
}
export const postService = new PostService();
