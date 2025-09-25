export type NotificationType = 'friend_request_sent'|'friend_request_accept' | 'post_mention' | 'post_like'|'comment_mention' | 'comment'|'profile_like'|'tipped'|'subscribed';

export interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  sourceUserId: string;
  sourceUsername: string;
  postId: string | null;
  isRead: boolean;
  createdAt: Date;
}