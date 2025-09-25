import { Logger } from "@/lib/logger";
import pool from "../db";
import { Post, PostType } from "../types/post";
import { IPostService } from "./IPostService";
import { v4 } from "uuid";
import { QueryResult } from "mysql2";
import {  } from "./INotificationService";
import { notificationService } from "./serviceProvider";
import { convertMentionsIntoLinks, getEmbedSection, getLinksFromString, getMentionAndIdForString } from "@/utils/stringParser";

const COMPONENT = "PostService";
export class PostService implements IPostService {
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
    processedContent =await convertMentionsIntoLinks(processedContent,userId,type);


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
      await pool.query(
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
      const {mentions,usernameToId} = await getMentionAndIdForString(processedContent);
      for (const mention of mentions) {
        const username = mention[1];
        const userIdMentioned = usernameToId[username];
        if (!userIdMentioned) continue; // no user, skip
        if (userIdMentioned !== userId) {
          await notificationService.createNotification(
            userIdMentioned,
            'post_mention',
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
  async getUserPosts(userId: string): Promise<Post[]> {
    const FUNCTION = "getUserPosts";
    Logger.log(COMPONENT, FUNCTION, "debug", "get user's post", {
      userId,
    });
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const [results] = await pool.query(
        `SELECT p.id, p.user_id, u.username,COALESCE(c.comment_count,0) AS comment_count,COALESCE(l.like_count,0) AS like_count, p.type, p.content,p.original_content, p.duration_days, p.expires_at, p.is_archived, p.created_at
       FROM posts p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN (
         SELECT post_id, COUNT(*) as comment_count
         FROM comments GROUP BY post_id
         ) c ON p.id = c.post_id
        LEFT JOIN (
        SELECT post_id, COUNT(*) as like_count
         FROM likes GROUP BY post_id
         ) l ON p.id = l.post_id
       WHERE p.user_id = ? AND p.is_archived = false
       AND (p.expires_at IS NULL OR p.expires_at > NOW())`,
        [userId]
      );

      return (results as any[]).map((post) => ({
        id: post.id,
        userId: post.user_id,
        username: post.username,
        originalContent:post.original_content,
        type: post.type,
        content: post.content,
        durationDays: post.duration_days,
        expiresAt: post.expires_at ? new Date(post.expires_at) : null,
        isArchived: post.is_archived,
        createdAt: new Date(post.created_at),
        commentCount:post.comment_count,
        likeCount:post.like_count
      }));
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
    const [friendResults] = await pool.query(
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
      const [results] = await pool.query(
        `SELECT p.id, p.user_id, u.username,COALESCE(c.comment_count,0) AS comment_count,COALESCE(l.like_count,0) AS like_count, p.type, p.content,p.original_content, p.duration_days, p.expires_at, p.is_archived, p.created_at
         FROM posts p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN (
         SELECT post_id, COUNT(*) as comment_count
         FROM comments GROUP BY post_id
         ) c ON p.id = c.post_id
        LEFT JOIN (
        SELECT post_id, COUNT(*) as like_count
         FROM likes GROUP BY post_id
         ) l ON p.id = l.post_id
         WHERE p.user_id = ? AND p.type = 'friend_post' AND p.is_archived = false`,
        [userId]
      );
      Logger.log(COMPONENT, FUNCTION, "debug", "Post Fetched Successfully", {
        userId,
      });
      return (results as any[]).map((post) => ({
        id: post.id,
        userId: post.user_id,
        username: post.username,
        originalContent:post.original_content,
        type: post.type,
        content: post.content,
        durationDays: post.duration_days,
        expiresAt: post.expires_at ? new Date(post.expires_at) : null,
        isArchived: post.is_archived,
        createdAt: new Date(post.created_at),
        commentCount:post.comment_count,
        likeCount:post.like_count
      }));
    } catch (error: any) {
      throw new Error("Failed to fetch friend posts: " + error.message);
    }
  }

  async getPublicOpinions(
    userId?: string,
    isCurrentUser: boolean = false
  ): Promise<Post[]> {
    const FUNCTION = "getPublicOpinions";
    try {
      let results: QueryResult;
      if (!isCurrentUser && userId) {
        [results] = await pool.query(
          `SELECT p.id, p.user_id, u.username,COALESCE(c.comment_count,0) AS comment_count,COALESCE(l.like_count,0) AS like_count, p.type, p.content,p.original_content, p.duration_days, p.expires_at, p.is_archived, p.created_at
         FROM posts p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN (
         SELECT post_id, COUNT(*) as comment_count
         FROM comments GROUP BY post_id
         ) c ON p.id = c.post_id
        LEFT JOIN (
        SELECT post_id, COUNT(*) as like_count
         FROM likes GROUP BY post_id
         ) l ON p.id = l.post_id
         WHERE p.user_id = ? AND p.type = 'public_opinion' AND p.is_archived = false
         AND (p.expires_at IS NULL OR p.expires_at > NOW())`,
          [userId]
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
        [results] = await pool.query(
          `SELECT p.id, p.user_id, u.username,COALESCE(c.comment_count,0) AS comment_count,COALESCE(l.like_count,0) AS like_count, p.type, p.content,p.original_content, p.duration_days, p.expires_at, p.is_archived, p.created_at
         FROM posts p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN (
         SELECT post_id, COUNT(*) as comment_count
         FROM comments GROUP BY post_id
         ) c ON p.id = c.post_id
        LEFT JOIN (
        SELECT post_id, COUNT(*) as like_count
         FROM likes GROUP BY post_id
         ) l ON p.id = l.post_id
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
          [userId, userId, userId]
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
        originalContent:post.original_content,
        type: post.type,
        content: post.content,
        durationDays: post.duration_days,
        expiresAt: post.expires_at ? new Date(post.expires_at) : null,
        isArchived: post.is_archived,
        createdAt: new Date(post.created_at),
        commentCount:post.comment_count,
        likeCount:post.like_count
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
      const [results] = await pool.query(
        `SELECT p.id, p.user_id, u.username,COALESCE(c.comment_count,0) AS comment_count,COALESCE(l.like_count,0) AS like_count, p.type, p.content,p.original_content, p.duration_days, p.expires_at, p.is_archived, p.created_at
         FROM posts p
         JOIN users u ON p.user_id = u.id
         JOIN friends f ON (f.user_id_1 = p.user_id AND f.user_id_2 = ?) OR (f.user_id_1 = ? AND f.user_id_2 = p.user_id)
         LEFT JOIN (
         SELECT post_id, COUNT(*) as comment_count
         FROM comments GROUP BY post_id
         ) c ON p.id = c.post_id
        LEFT JOIN (
        SELECT post_id, COUNT(*) as like_count
         FROM likes GROUP BY post_id
         ) l ON p.id = l.post_id
         WHERE p.type = 'friend_post' AND p.is_archived = false`,
        [currentUserId, currentUserId]
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
        originalContent:post.original_content,
        durationDays: post.duration_days,
        expiresAt: post.expires_at ? new Date(post.expires_at) : null,
        isArchived: post.is_archived,
        createdAt: new Date(post.created_at),
        commentCount:post.comment_count,
        likeCount:post.like_count
      }));
    } catch (error: any) {
      throw new Error("Failed to fetch private posts: " + error.message);
    }
  }

  async getAllPublicOpinions(): Promise<Post[]> {
    try {
      const FUNCTION = "getPrivatePosts";
      const [results] = await pool.query(
        `SELECT p.id, p.user_id, u.username,COALESCE(c.comment_count,0) AS comment_count,COALESCE(l.like_count,0) AS like_count, p.type, p.content,p.original_content, p.duration_days, p.expires_at, p.is_archived, p.created_at
         FROM posts p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN (
         SELECT post_id, COUNT(*) as comment_count
         FROM comments GROUP BY post_id
         ) c ON p.id = c.post_id
        LEFT JOIN (
        SELECT post_id, COUNT(*) as like_count
         FROM likes GROUP BY post_id
         ) l ON p.id = l.post_id
         WHERE p.type = 'public_opinion' AND p.is_archived = false
         AND (p.expires_at IS NULL OR p.expires_at > NOW())
         ORDER BY p.created_at DESC`
      );
      Logger.log(COMPONENT, FUNCTION, "debug", "Post Fetched Successfully");
      return (results as any[]).map((post) => ({
        id: post.id,
        userId: post.user_id,
        username: post.username,
        type: post.type,
        content: post.content,
        originalContent:post.original_content,
        durationDays: post.duration_days,
        expiresAt: post.expires_at ? new Date(post.expires_at) : null,
        isArchived: post.is_archived,
        createdAt: new Date(post.created_at),
        commentCount:post.comment_count,
        likeCount:post.like_count
      }));
    } catch (error: any) {
      throw new Error("Failed to fetch all public opinions: " + error.message);
    }
  }

  async deletePost(userId:string,postId:string):Promise<void>{
    const FUNCTION = 'deletePost';
    if (!userId || !postId) {
      throw new Error("User ID and Post ID are required");
    }
try {
      const [result] = await pool.query(
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
        `[${COMPONENT}][${FUNCTION}]:Failed to delete Post: ` +
          error.message
      );
    }

  }
}
export const postService = new PostService();
