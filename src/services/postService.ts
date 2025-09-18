import { Logger } from "@/lib/logger";
import pool from "../db";
import { FeedResult, Post, PostType } from "../types/post";
import { IPostService } from "./IPostService";
import { v4 } from "uuid";
const COMPONENT = "PostService";
export class PostService implements IPostService {
  async createPost(
    userId: string,
    content: string,
    type: PostType,
    durationDays?: number
  ): Promise<Post> {
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

    // Basic URL parsing for embeds (YouTube, TikTok, Facebook)
    let parsedContent = content;
    const youtubeRegex =
      /https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/;
    const tiktokRegex =
      /https?:\/\/(www\.)?tiktok\.com\/@[\w\.]+\/video\/(\d+)/;
    const facebookRegex = /https?:\/\/(www\.)?facebook\.com\/.*\/videos\/(\d+)/;
    parsedContent = parsedContent
      .replace(
        youtubeRegex,
        '<iframe src="https://www.youtube.com/embed/$2" frameborder="0" allowfullscreen></iframe>'
      )
      .replace(
        tiktokRegex,
        '<iframe src="https://www.tiktok.com/embed/v2/$2" frameborder="0" allowfullscreen></iframe>'
      )
      .replace(
        facebookRegex,
        '<iframe src="https://www.facebook.com/plugins/video.php?href=$&" frameborder="0" allowfullscreen></iframe>'
      );

      Logger.log(COMPONENT,FUNCTION,'debug',"Links are now parsed and embeded",{parsedContent});

    // Basic mention parsing (@username to profile links) - synchronous placeholder replacement
    const mentionRegex = /@(\w+)/g;
    const mentions = Array.from(parsedContent.matchAll(mentionRegex));
    const uniqueUsernames = Array.from(new Set(mentions.map((m) => m[1])));

    // Fetch user ids for usernames
    const usernameToId: { [key: string]: number } = {};
    if (uniqueUsernames.length > 0) {
      const placeholders = uniqueUsernames.map(() => "?").join(",");
      const [results] = await pool.query(
        `SELECT id, username FROM users WHERE username IN (${placeholders})`,
        uniqueUsernames
      );
      (results as any[]).forEach((user) => {
        usernameToId[user.username] = user.id;
      });
    }

    // Replace mentions with anchor tags if valid and friend if needed
    for (const mention of mentions) {
      const fullMatch = mention[0];
      const username = mention[1];
      const userIdMentioned = usernameToId[username];
      if (!userIdMentioned) continue; // no user, skip

      if (type === "friend_post") {
        const [friendResults] = await pool.query(
          "SELECT id FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)",
          [userId, userIdMentioned, userIdMentioned, userId]
        );
        if (!(friendResults as any[])[0]) continue; // not a friend, skip
      }

      const anchorTag = `<a href="/profile/${username}">@${username}</a>`;
      parsedContent = parsedContent.split(fullMatch).join(anchorTag);
    }
    Logger.log(COMPONENT,FUNCTION,'debug',"username on mentions are now parsed and embeded",{parsedContent});
    try {
      const expiresAt =
        type === "public_opinion"
          ? new Date(Date.now() + durationDays! * 24 * 60 * 60 * 1000)
          : null;
          const postId = v4();
      const [result] = await pool.query(
        "INSERT INTO posts (id,user_id, type, content, duration_days, expires_at, is_archived) VALUES (?,?, ?, ?, ?, ?, ?)",
        [
          postId,
          userId,
          type,
          parsedContent,
          durationDays || null,
          expiresAt,
          false,
        ]
      );
    Logger.log(COMPONENT, FUNCTION, "info", "New Post Created");
      
      const [postResults] = await pool.query(
        "SELECT * FROM posts WHERE id = ?",
        [postId]
      );

      const post = (postResults as any[])[0];
      Logger.log(COMPONENT, FUNCTION, "info", "get new post by id", {
        post
      });
      return {
        id: post.id,
        userId: post.user_id,
        type: post.type,
        content: post.content,
        durationDays: post.duration_days,
        expiresAt: post.expires_at ?? new Date(post.expires_at),
        isArchived: post.is_archived,
        createdAt: new Date(post.created_at),
      };
    } catch (error: any) {
      throw new Error("Failed to create post: " + error.message);
    }
  }

  
}
export const postService = new PostService();
