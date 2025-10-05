import { NotificationType, Notification } from "@/types/notification";

export interface INotificationService {
  createNotification(
    userId: string,
    type: NotificationType,
    sourceUserId: string,
    postId?: string,
    commentId?:string
  ): Promise<Notification>;
  getUserNotifications(
    userId: string,
    cursorCreatedAt?: string|null,
    limit?: number
  ): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number, userId: string): Promise<void>;
  getNotificationByUserIdAndType(
    userId: string,
    type: NotificationType,
    sourceUserId: string,
    postId?: string,
    commentId?:string
  ): Promise<Notification[]>;
  deleteNotification(notificationId: number, userId: string): Promise<void>;
}
