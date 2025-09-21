export type NotificationType = 'friend_request' | 'mention' | 'like' | 'comment'|'tipped'|'subscribed';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  sourceUserId: number;
  sourceUsername: string;
  postId: number | null;
  content: string;
  isRead: boolean;
  createdAt: Date;
}