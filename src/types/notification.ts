export type NotificationType = 'friend_request_sent'|
'friend_request_accept' | 'post_mention' | 
'post_like'|'post_share'|'comment_mention'|'comment_like'|
'comment_reply' | 'comment'|'profile_like'|'tipped'|'subscribed';

export interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  sourceUserId: string;
  sourceUsername: string;
  postId: string | null;
  commentId: string | null;
  isRead: boolean;
  createdAt: Date;
}