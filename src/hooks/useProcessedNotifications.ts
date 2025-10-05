"use client";
import { Notification, NotificationType } from "@/types/notification";
import { useMemo } from "react";
import { ProcessedNotification } from "@/components/NotificationItem";

export const useProcessedNotifications = (notifications: Notification[]) => {
  return useMemo(() => {
    const groupNotifications = (
      notifications: Notification[],
      type: NotificationType,
      keySelector: (n: Notification) => string | null
    ): ProcessedNotification[] => {
      const groups = new Map<string, Notification[]>();

      const filteredNotifications = notifications.filter(n => n.type === type);

      filteredNotifications.forEach(n => {
        const key = keySelector(n);
        if (key) {
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push(n);
        }
      });

      const result: ProcessedNotification[] = [];
      groups.forEach(group => {
        const [first, ...others] = group;
        if (others.length > 0) {
          result.push({ ...first, otherUsers: others });
        } else {
          result.push(first);
        }
      });
      return result;
    };
    return notifications ? notifications : [];
  }, [notifications]);
};