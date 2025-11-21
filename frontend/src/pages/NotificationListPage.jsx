import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import notificationService from "../services/notificationService";

const NotificationListPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("false"); // false: 안 읽음, true: 읽음

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await notificationService.getMyNotifications(filter);
        setNotifications(response.data || []);
      } catch (err) {
        setError("알림을 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [filter]); // 필터가 바뀔 때마다 다시 로드

  const handleMarkAsRead = async (userNotificationId) => {
    // 알림을 클릭하면 읽음 처리
    try {
      await notificationService.markAsRead(userNotificationId);
      // UI에서 즉시 읽음 상태로 변경
      setNotifications((prevNotifs) =>
        prevNotifs.map((n) =>
          n.id === userNotificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error("알림 읽음 처리 실패:", err);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto bg-white p-6 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6">전체 알림</h1>

        {/* 필터 탭 */}
        <div className="flex space-x-2 mb-4 border-b">
          <button
            onClick={() => setFilter("false")}
            className={`py-2 px-4 ${
              filter === "false"
                ? "font-bold borber-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500"
            }`}
          >
            안 읽은 알림
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`py-2 px-4 ${
              filter === "all"
                ? "font-bold borber-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500"
            }`}
          >
            모든 알림
          </button>
        </div>

        {/* 알림 목록 */}
        <div className="space-y-3">
          {loading && <p>로딩 중...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && notifications.length === 0 && (
            <p className="text-gray-500 text-center p-4">
              {filter === "false"
                ? "새로운 알림이 없습니다."
                : "알림이 없습니다."}
            </p>
          )}

          {notifications.map((notif) => (
            <Link
              to={notif.link || "#"}
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
              className={`block p-4 border rounded-lg ${
                notif.isRead
                  ? "bg-gray-50 text-gray-500"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              <p className={!notif.isRead ? "font-semibold" : ""}>
                {notif.content}
              </p>
              <span className="text-xs text-gray-400">
                {new Date(notif.createdAt).toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationListPage;
