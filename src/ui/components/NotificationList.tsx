import React, { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
  autoHide?: boolean;
}

interface NotificationListProps {
  notifications: Notification[];
  onRemoveNotification: (id: string) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onRemoveNotification
}) => {
  useEffect(() => {
    const timers: number[] = [];

    notifications.forEach(notification => {
      if (notification.autoHide !== false) {
        const timer = window.setTimeout(() => {
          onRemoveNotification(notification.id);
        }, 5000);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, onRemoveNotification]);

  if (notifications.length === 0) {
    return null;
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="notification-list">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <div className="notification-content">
            <span className="notification-icon">
              {getNotificationIcon(notification.type)}
            </span>
            <span className="notification-message">
              {notification.message}
            </span>
          </div>
          <button
            onClick={() => onRemoveNotification(notification.id)}
            className="notification-close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};
