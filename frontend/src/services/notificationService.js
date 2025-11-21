import api from "./api";

const notificationService = {
  // 내 알림 목록 조회
  getMyNotifications: (isReadParam = "false") => {
    return api.get(`/api/notifications/me?isRead=${isReadParam}`);
  },

  // 특정 알림 읽음 처리
  markAsRead: (userNotificationId) => {
    return api.patch(`/api/notification/${userNotificationId}/read`);
  },

  // 모든 알림 읽음 처리
  markAllAsRead: () => {
    return api.post("/api/notifications/me/read-all");
  },
};

export default notificationService;
