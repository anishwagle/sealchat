import { Logger } from "@/lib/logger";
import executeQuery from "../db";
import {Like, PostType } from "../types/post";
import { Comment } from "@/types/comment";
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
import { IEngagementService } from "./IEngagementService";

const COMPONENT = "EngagementService";
export class EngagementService implements IEngagementService {
  async getPostLikeList(postId: string): Promise<Like[]> {
    const FUNCTION = "getPostLikeList";
    Logger.log(COMPONENT, FUNCTION, "debug", "get post like list", {
      postId,
    });
    const queryResult = await executeQuery(
      `SELECT l.*,u.username AS username FROM likes l
      JOIN users u ON u.id=l.user_id
       WHERE post_id=? `,
      [postId]
    );
    const result = queryResult as any[];
    Logger.log(COMPONENT, FUNCTION, "debug", "Get Post Like Status", {
      result,
    });
    return (result as any[]).map((x) => ({
      id: x.id,
      userId: x.user_id,
      postId: x.post_id,
      username: x.username,
      createdAt: x.created_at,
    }));
  }
  async createComment(
    userId: string,
    content: string,
    postId: string,
    parentCommentId?: string | null
  ): Promise<Comment> {
    const FUNCTION = "createComment";
    Logger.log(COMPONENT, FUNCTION, "debug", "creating new Comment", {
      userId,
      content,
      postId,
    });
    if (!userId || !content || !postId) {
      throw new Error("User ID, content, and postId are required");
    }
    if (content.length > 1000) {
      throw new Error("Content must be 1000 characters or less");
    }

    const queryResult = await executeQuery(
      `SELECT id,type,user_id
         FROM posts
         WHERE id = ?`,
      [postId]
    );

    const post = (queryResult as any[])[0];
    Logger.log(COMPONENT, FUNCTION, "debug", "Fetched the post", {
      post,
    });
    // Store original content and initialize embed section
    let processedContent = content;
    processedContent = getLinksFromString(processedContent);
    processedContent = await convertMentionsIntoLinks(
      processedContent,
      userId,
      post.type
    );

    // Combine processed content with embeds
    const finalContent = `
      <div class="post-content">${processedContent}</div>
      `;

    try {
      const commentId = v4();
      await executeQuery(
        "INSERT INTO comments (id,user_id, post_id, content,original_content, parent_comment_id) VALUES (?,?,?, ?, ?, ?)",
        [
          commentId,
          userId,
          postId,
          finalContent,
          content,
          parentCommentId || null,
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
            "comment_mention",
            userId,
            postId
          );
        }
      }
      const commentResult = await executeQuery(
        `SELECT c.*, u.username
         FROM comments c
          JOIN users u on c.user_id = u.id
         WHERE c.id = ? `,
        [commentId]
      );

      const comment = (commentResult as any[])[0];

      if (post.user_id != userId) {
        await notificationService.createNotification(
          post.user_id,
          "comment",
          userId,
          postId
        );
      }

      Logger.log(COMPONENT, FUNCTION, "debug", "Fetched the comment", {
        comment,
      });
      Logger.log(COMPONENT, FUNCTION, "info", "New Comment Created");
      return {
        id: commentId,
        content: finalContent,
        originalContent: content,
        userId: userId,
        postId: post.Id,
        createdAt: comment.created_at,
        username: comment.username,
      };
    } catch (error: any) {
      throw new Error("Failed to create Comment: " + error.message);
    }
  }

  async getPublicOpinionComment(
    postId: string,
    cursorCreatedAt?: string | null,
    limit: number = 10
  ): Promise<Comment[]> {
    const FUNCTION = "getPublicOpinionComment";
    try {
      let query = `SELECT c.id, c.user_id,c.post_id,COALESCE(cm.reply_count, 0) AS reply_count,
         u.username,
         c.parent_comment_id,
         c.content,
         c.original_content,
         c.created_at
         FROM comments c
         LEFT JOIN (
          SELECT parent_comment_id, COUNT(*) AS reply_count
          FROM comments
          GROUP BY parent_comment_id
         ) cm ON c.id = c.parent_comment_id
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ? AND c.parent_comment_id IS NULL`;
      let params: string[] = [postId];
      if (cursorCreatedAt) {
        query += ` AND c.created_at < STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s')`;
        params.push(cursorCreatedAt);
      }

      query += ` ORDER BY c.created_at DESC LIMIT ? `;
      params.push(`${limit}`);
      const results = await executeQuery(query, params);

      Logger.log(
        COMPONENT,
        FUNCTION,
        "debug",
        "Comments Fetched for feed Successfully",
        {
          postId,
          results,
        }
      );

      return (results as any[]).map((comment) => ({
        id: comment.id,
        userId: comment.user_id,
        username: comment.username,
        originalContent: comment.original_content,
        content: comment.content,
        parentCommentId: comment.parent_comment_id,
        postId: comment.post_id,
        createdAt: new Date(comment.created_at),
        replyCount:comment.reply_count
      }));
    } catch (error: any) {
      throw new Error("Failed to fetch public opinions: " + error.message);
    }
  }
async getCommentReplies(
    commentId: string,
    cursorCreatedAt?: string | null,
    limit: number = 10
  ): Promise<Comment[]> {
    const FUNCTION = "getPublicOpinionComment";
    try {
      let query = `SELECT 
    c.id,
    c.user_id,
    c.post_id,
    u.username,
    c.parent_comment_id,
    c.content,
    c.original_content,
    c.created_at,
    COALESCE(cm.reply_count, 0) AS reply_count
FROM comments c
JOIN users u ON c.user_id = u.id
LEFT JOIN (
    SELECT parent_comment_id, COUNT(*) AS reply_count
    FROM comments
    WHERE parent_comment_id IS NOT NULL
    GROUP BY parent_comment_id
) cm ON c.id = cm.parent_comment_id
WHERE c.parent_comment_id = ?`;
      let params: string[] = [commentId];
      if (cursorCreatedAt) {
        query += ` AND c.created_at < STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s')`;
        params.push(cursorCreatedAt);
      }

      query += ` ORDER BY c.created_at DESC LIMIT ? `;
      params.push(`${limit}`);
      const results = await executeQuery(query, params);

      Logger.log(
        COMPONENT,
        FUNCTION,
        "debug",
        "Comments Fetched for feed Successfully",
        {
          commentId,
          results,
        }
      );

      return (results as any[]).map((comment) => ({
        id: comment.id,
        userId: comment.user_id,
        username: comment.username,
        originalContent: comment.original_content,
        content: comment.content,
        parentCommentId: comment.parent_comment_id,
        postId: comment.post_id,
        createdAt: new Date(comment.created_at),
        replyCount:comment.reply_count
      }));
    } catch (error: any) {
      throw new Error("Failed to fetch public opinions: " + error.message);
    }
  }

  async getFriendPostComment(
    currentUserId: string,
    postId: string,
    cursorCreatedAt?: string | null,
    limit: number=10
  ): Promise<Comment[]> {
    const FUNCTION = "getFriendPostComment";
    if (!postId || !currentUserId) {
      throw new Error("Post ID and current user ID are required");
    }

    const queryResult = await executeQuery(
      `SELECT id,type,user_id
         FROM posts
         WHERE id = ?`,
      [postId]
    );

    const post = (queryResult as any[])[0];

    if (post.user_id != currentUserId) {
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
        return []; // Return empty array if not friends
      }
    }
    try {
      let query = `SELECT 
      c.id,
      c.user_id,
      u.username,
      c.post_id,
      c.parent_comment_id,
      c.content,
      c.original_content,
      c.created_at,
      COALESCE(r.reply_count, 0) AS reply_count
   FROM comments c
   JOIN users u ON c.user_id = u.id
   LEFT JOIN (
       SELECT parent_comment_id, COUNT(*) AS reply_count
       FROM comments
       WHERE parent_comment_id IS NOT NULL
       GROUP BY parent_comment_id
   ) r ON c.id = r.parent_comment_id
   WHERE c.post_id = ? AND c.parent_comment_id IS NULL
   `;
      let params = [postId];
      if (cursorCreatedAt) {
        query += ` AND c.created_at < STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s')`;
        params.push(cursorCreatedAt);
      }

      query += ` ORDER BY c.created_at DESC LIMIT ? `;
      params.push(`${limit}`);
      const results = await executeQuery(query, params);

      Logger.log(
        COMPONENT,
        FUNCTION,
        "debug",
        "Comments Fetched for feed Successfully",
        {
          postId
        }
      );

      return (results as any[]).map((comment) => ({
        id: comment.id,
        userId: comment.user_id,
        username: comment.username,
        originalContent: comment.original_content,
        content: comment.content,
        parentCommentId: comment.parent_comment_id,
        postId: comment.post_id,
        createdAt: new Date(comment.created_at),
        replyCount: comment.reply_count,
      }));
    } catch (error: any) {
      throw new Error("Failed to fetch Comment: " + error.message);
    }
  }

  async deleteComment(userId: string, commentId: string): Promise<void> {
    const FUNCTION = "deleteComment";
    if (!userId || !commentId) {
      throw new Error("User ID and Comment ID are required");
    }
    try {
      const result = await executeQuery(
        "DELETE FROM comments WHERE id = ? AND user_id = ?",
        [commentId, userId]
      );
      if ((result as any).affectedRows === 0) {
        throw new Error(
          `[${COMPONENT}][${FUNCTION}]:Comment not found or not owned by user`
        );
      }
    } catch (error: any) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]:Failed to delete Comment: ` + error.message
      );
    }
  }
  async getPostLikeStatus(userId: string, postId: string): Promise<boolean> {
    const FUNCTION = "getPostLikeStatus";
    Logger.log(COMPONENT, FUNCTION, "debug", "get post like status", {
      userId,
      postId,
    });
    const queryResult = await executeQuery(
      "SELECT * FROM likes WHERE user_id=? AND post_id=?",
      [userId, postId]
    );
    const result = (queryResult as any[])[0];
    Logger.log(COMPONENT, FUNCTION, "debug", "Get Post Like Status", {
      result,
      found: !!result,
    });
    return !!result;
  }
  async toggleCommentLike(userId: string, commentId: string): Promise<void> {
    const FUNCTION = "togglePostLike";
    Logger.log(COMPONENT, FUNCTION, "debug", "toggle comment like status", {
      userId,
      commentId,
    });
    const result = await this.getPostLikeStatus(userId, commentId);
    const queryResult = await executeQuery(
      `SELECT id,type,user_id
         FROM comments
         WHERE id = ?`,
      [commentId]
    );

    const comment = (queryResult as any[])[0];
    Logger.log(COMPONENT, FUNCTION, "debug", "Fetched the comment", {
      comment,
    });
    if (result) {
      const notifications =
        await notificationService.getNotificationByUserIdAndType(
          comment.user_id,
          "comment_like",
          userId,
          comment.post_id
        );
      notifications.forEach(async (x) => {
        await notificationService.deleteNotification(x.id, x.userId);
      });
      Logger.log(COMPONENT, FUNCTION, "debug", "Post dis-liked");
      await executeQuery("DELETE FROM comment_likes WHERE comment_id=? AND user_id=?", [
        commentId,
        userId,
      ]);
    } else {
      Logger.log(COMPONENT, FUNCTION, "debug", "Post Liked");
      await executeQuery("INSERT INTO comment_likes (user_id,comment_id) VALUES(?,?)", [
        userId,
        commentId,
      ]);
      if (comment.user_id != userId) {
        await notificationService.createNotification(
          comment.user_id,
          "comment_like",
          userId,
          comment.post_id
        );
      }
    }
    Logger.log(COMPONENT, FUNCTION, "debug", "Like status toggled");
  }
  async togglePostLike(userId: string, postId: string): Promise<void> {
    const FUNCTION = "togglePostLike";
    Logger.log(COMPONENT, FUNCTION, "debug", "toggle post like status", {
      userId,
      postId,
    });
    const result = await this.getPostLikeStatus(userId, postId);
    const queryResult = await executeQuery(
      `SELECT id,type,user_id
         FROM posts
         WHERE id = ?`,
      [postId]
    );

    const post = (queryResult as any[])[0];
    Logger.log(COMPONENT, FUNCTION, "debug", "Fetched the post", {
      post,
    });
    if (result) {
      const notifications =
        await notificationService.getNotificationByUserIdAndType(
          post.user_id,
          "post_like",
          userId,
          post.id
        );
      notifications.forEach(async (x) => {
        await notificationService.deleteNotification(x.id, x.userId);
      });
      Logger.log(COMPONENT, FUNCTION, "debug", "Post dis-liked");
      await executeQuery("DELETE FROM likes WHERE post_id=? AND user_id=?", [
        postId,
        userId,
      ]);
    } else {
      Logger.log(COMPONENT, FUNCTION, "debug", "Post Liked");
      await executeQuery("INSERT INTO likes (user_id,post_id) VALUES(?,?)", [
        userId,
        postId,
      ]);
      if (post.user_id != userId) {
        await notificationService.createNotification(
          post.user_id,
          "post_like",
          userId,
          postId
        );
      }
    }
    Logger.log(COMPONENT, FUNCTION, "debug", "Like status toggled");
  }
}
export const engagementService = new EngagementService();
