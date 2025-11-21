import React, { useState, useEffect } from "react";
import notificationService from "../../services/notificationService";
import authService from "../../services/auth";
import { Link } from "react-router-dom";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = authService.isAuthenticated();

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      fetchNotifications();
    }
  }, [isOpen, isLoggedIn]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getMyNotifications("false");
      setNotifications(response.data);
    } catch (error) {
      console.error("알림 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (userNotificationId) => {
    try {
      await notificationService.markAsRead(userNotificationId);
      setNotifications((prev) =>
        prev.filter((n) => n.id !== userNotificationId)
      );
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  };

  if (!isLoggedIn) return null; // 로그인하지 않았으면 아무것도 보여주지 않음

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        🔔{" "}
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <div className="p-3 font-bold border-b">알림</div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">로딩 중...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                새 알림이 없습니다.
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="border-b hover:bg-gray-50">
                  <Link
                    to={notif.link || "#"}
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="block p-3 text-sm"
                  >
                    {notif.content}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
