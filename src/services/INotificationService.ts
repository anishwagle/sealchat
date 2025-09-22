import { NotificationType,Notification } from "@/types/notification";


export interface INotificationService {
  createNotification(
      userId: string,
      type: NotificationType,
      sourceUserId: string,
      postId?: string
    ): Promise<Notification> ;
    getUserNotifications(userId: string): Promise<Notification[]> ;
    markNotificationAsRead(
    notificationId: number,
    userId: string
  ): Promise<void> ;
  getNotificationByUserIdAndType(
    userId: string,
    type:NotificationType,
    sourceUserId:string
  ): Promise<Notification[]> ;
  deleteNotification(
    notificationId: number,
    userId: string
  ): Promise<void> 
}
