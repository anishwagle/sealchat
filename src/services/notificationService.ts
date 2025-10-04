import { Logger } from "@/lib/logger";
import { INotificationService } from "./INotificationService";
import { NotificationType, Notification } from "@/types/notification";
import executeQuery from "../db";
const COMPONENT = "NotificationService";
export class NotificationService implements INotificationService {
  async createNotification(
    userId: string,
    type: NotificationType,
    sourceUserId: string,
    postId?: string
  ): Promise<Notification> {
    const FUNCTION = "createNotification";
    if (!userId || !type || !sourceUserId) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]User ID, type and source user ID are required`
      );
    }

    try {
      const result = await executeQuery(
        "INSERT INTO notifications (user_id, type, source_user_id, post_id, is_read) VALUES (?, ?, ?, ?, ?)",
        [userId, type, sourceUserId, postId || null, false]
      );
      const notificationId = (result as any).insertId;
      const notificationResults = await executeQuery(
        "SELECT n.*, u.username AS source_username FROM notifications n JOIN users u ON n.source_user_id = u.id WHERE n.id = ?",
        [notificationId]
      );
      const notification = (notificationResults as any[])[0];
      Logger.log(
        COMPONENT,
        FUNCTION,
        "debug",
        "Notification saved successfully",
        {
          userId,
          notification,
        }
      );
      return {
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        sourceUserId: notification.source_user_id,
        sourceUsername: notification.source_username,
        postId: notification.post_id,
        isRead: notification.is_read,
        createdAt: new Date(notification.created_at),
      };
    } catch (error: any) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]Failed to create notification: ` +
          error.message
      );
    }
  }
  async getUserNotifications(userId: string,cursorCreatedAt?: string|null,
    limit: number = 10): Promise<Notification[]> {
    const FUNCTION = "getUserNotifications";
    if (!userId) {
      throw new Error(`[${COMPONENT}][${FUNCTION}]User ID is required`);
    }

    try {
      let query =  `SELECT n.*, u.username AS source_username
         FROM notifications n
         JOIN users u ON n.source_user_id = u.id
         WHERE n.user_id = ?`;
        const params= [userId];

      if (cursorCreatedAt) {
        query += ` AND n.created_at < STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s')`;
        params.push(cursorCreatedAt);
      }

      query += ` ORDER BY n.created_at DESC LIMIT ? `;
      params.push(`${limit}`);
      const results = await executeQuery( query,params);
      Logger.log(
        COMPONENT,
        FUNCTION,
        "debug",
        "Notification pulled successfully",
        {
          userId,
          cursorCreatedAt
        }
      );
      return (results as any[]).map((notification) => ({
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        sourceUserId: notification.source_user_id,
        sourceUsername: notification.source_username,
        postId: notification.post_id,
        isRead: notification.is_read,
        createdAt: new Date(notification.created_at),
      }));
    } catch (error: any) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]:Failed to fetch notifications: ` +
          error.message
      );
    }
  }
  async markNotificationAsRead(
    notificationId: number,
    userId: string
  ): Promise<void> {
    const FUNCTION = "markNotificationAsRead";
    if (!notificationId || !userId) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]:Notification ID and user ID are required`
      );
    }

    try {
      const result = await executeQuery(
        "UPDATE notifications SET is_read = ? WHERE id = ? AND user_id = ?",
        [true, notificationId, userId]
      );
      if ((result as any).affectedRows === 0) {
        throw new Error(
          `[${COMPONENT}][${FUNCTION}]:Notification not found or not owned by user`
        );
      }
    } catch (error: any) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]:Failed to mark notification as read: ` +
          error.message
      );
    }
  }
async getNotificationByUserIdAndType(
    userId: string,
    type:NotificationType,
    sourceUserId:string,
    postId?:string
  ): Promise<Notification[]> {
    const FUNCTION = "getNotificationByUserIdAndType";
    if (!userId || !type || !sourceUserId) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]User ID, type and source user ID are required`
      );
    }

    try {

      let query = `SELECT n.*, u.username AS source_username
         FROM notifications n
         JOIN users u ON n.source_user_id = u.id
         WHERE n.user_id=? AND type=? AND n.source_user_id = ? `;
      const params = [ userId, type, sourceUserId];
      if(postId){
        query += `AND n.post_id=?`;
        params.push(postId);
      }
      const results = await executeQuery(query,params);
      Logger.log(COMPONENT, FUNCTION, "debug", "User check complete", {
            found: !!results,
          });
      return (results as any[]).map((notification) => ({
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        sourceUserId: notification.source_user_id,
        sourceUsername: notification.source_username,
        postId: notification.post_id,
        isRead: notification.is_read,
        createdAt: new Date(notification.created_at),
      }));
    } catch (error: any) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]:Failed to Select notification: ` +
          error.message
      );
    }
  }
  async deleteNotification(
    notificationId: number,
    userId: string
  ): Promise<void> {
    const FUNCTION = "deleteNotification";
    if (!notificationId || !userId) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]:Notification ID and user ID are required`
      );
    }

    try {
      const result = await executeQuery(
        "DELETE FROM notifications WHERE id = ? AND user_id = ?",
        [notificationId, userId]
      );
      if ((result as any).affectedRows === 0) {
        throw new Error(
          `[${COMPONENT}][${FUNCTION}]:Notification not found or not owned by user`
        );
      }
    } catch (error: any) {
      throw new Error(
        `[${COMPONENT}][${FUNCTION}]:Failed to delete notification: ` +
          error.message
      );
    }
  }
}
export const notificationService = new NotificationService();
