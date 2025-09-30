"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { Notification } from "@/types/notification";
import { getTimeSince } from "@/utils/dateConveter";
import UserListModal from "./modals/UserListModal";

export type ProcessedNotification = Notification & {
  otherUsers?: Notification[];
};

type NotificationItemProps = {
  notification: ProcessedNotification;
  /**
   * Optional: A callback that is fired when the notification item is clicked.
   * Useful for closing a dropdown, for example.
   */
  onItemClick?: (notification: ProcessedNotification) => void;
};

const renderNotificationMessage = (notif: ProcessedNotification) => {
  switch (notif.type) {
    case "friend_request_sent":
      return (
        <span>
          <span className="font-medium">{notif.sourceUsername}</span> sent you a
          friend request
        </span>
      );
    case "friend_request_accept":
      return (
        <span>
          <span className="font-medium">{notif.sourceUsername}</span> accepted
          your friend request
        </span>
      );
    case "profile_like":
      const totalProfileLikes = 1 + (notif.otherUsers?.length || 0);
      return (
        <span>
          <span className="font-medium">{notif.sourceUsername}</span>
          {totalProfileLikes > 1 && ` and ${totalProfileLikes - 1} others`} liked your profile.
        </span>
      );
    case "post_like":
      const totalPostLikes = 1 + (notif.otherUsers?.length || 0);
      return (
        <span>
          <span className="font-medium">{notif.sourceUsername}</span>
          {totalPostLikes > 1 && ` and ${totalPostLikes - 1} others`} liked your post.
        </span>
      );
    case "comment":
      return (
        <span>
          <span className="font-medium">{notif.sourceUsername}</span> commented on your post.
        </span>
      );
    case "post_mention":
      return (
        <span>
          <span className="font-medium">{notif.sourceUsername}</span> mentioned you in a post.
        </span>
      );
    case "comment_mention":
      return (
        <span>
          <span className="font-medium">{notif.sourceUsername}</span> mentioned you in a comment.
        </span>
      );
    default:
      return null;
  }
};

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
    if (type === "friend_request_sent") return <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
    if (type === "friend_request_accept") return <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    if (type === "post_like" || type === "profile_like") return <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;
    if (type === "comment") return <svg className="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
    if (type === "post_mention" || type === "comment_mention") return <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>;
    return null;
};

export default function NotificationItem({ notification, onItemClick }: NotificationItemProps) {
  const router = useRouter();
  const [isUserListModalOpen, setIsUserListModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; users: Notification[] } | null>(null);

  const openUserListModal = (title: string, users: Notification[]) => {
    setModalContent({ title, users });
    setIsUserListModalOpen(true);
  };

  const handleNotificationClick = (notif: ProcessedNotification) => {
    // Call the optional callback, e.g., to close the dropdown
    onItemClick?.(notif);

    const postUrl = `/posts/${notif.postId}`;
    const profileUrl = `/profile/${notif.sourceUsername}`;

    switch (notif.type) {
      case "post_mention":
      case "comment_mention":
      case "comment":
        if (notif.postId) router.push(postUrl);
        break;
      case "friend_request_sent":
      case "friend_request_accept":
        router.push(profileUrl);
        break;
      case "post_like":
        if (notif.postId) {
          const allLikers = [notif, ...(notif.otherUsers || [])];
          openUserListModal("Liked your post", allLikers);
        }
        break;
      case "profile_like":
        const allLikers = [notif, ...(notif.otherUsers || [])];
        openUserListModal("Liked your profile", allLikers);
        break;
      default:
        break;
    }
  };

  return (
    <Fragment>
      <div
        onClick={() => handleNotificationClick(notification)}
        className={`
          flex items-start gap-3 p-3 rounded-lg cursor-pointer
          ${!notification.isRead ? "bg-blue-50" : "hover:bg-gray-50"}
        `}
      >
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center
            ${!notification.isRead ? "bg-blue-100" : "bg-gray-100"}
          `}
        >
          <NotificationIcon type={notification.type} />
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-800">
            {renderNotificationMessage(notification)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              {getTimeSince(new Date(notification.createdAt))}
            </span>
            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            )}
          </div>
        </div>
      </div>
      {isUserListModalOpen && modalContent && (
        <UserListModal
          isOpen={isUserListModalOpen}
          onClose={() => setIsUserListModalOpen(false)}
          title={modalContent.title}
          users={modalContent.users.map(u => ({ username: u.sourceUsername }))}
          actionButtonText={modalContent.title === "Liked your post" ? "View Post" : "View Profile"}
          actionButtonLink={modalContent.title === "Liked your post" ? `/posts/${modalContent.users[0].postId}` : '/profile'}
          emptyMessage="No one has liked this yet."
        />
      )}
    </Fragment>
  );
}