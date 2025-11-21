import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout"; //
import artistService from "../services/artistService";
import authService from "../services/auth"; //

const LiveRequestPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    posterUrl: "",
    ticketUrl: "",
    venue: "",
    price: 0,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentUser = authService.getCurrentUser();

  // 아티스트 권한이 없으면 페이지 접근 차단
  useEffect(() => {
    // UserDto에 role이 없으므로, authService.login 응답에 role도 포함시켜야 함
    // 지금은 임시로 User DTO에 role이 있다고 가정.
    if (currentUser?.role !== "ARTIST") {
      alert("공연 등록 권한이 없습니다.");
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    try {
      await artistService.requestLiveConcert(formData);
      alert("공연 등록 요청이 완료되었습니다. 관리자 승인을 기다려주세요.");
      navigate("/"); // 성공 시 홈으로
    } catch (err) {
      setError(err.response?.data?.message || "요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (currentUser?.role !== "ARTIST") {
    return (
      <MainLayout>
        <div className="text-center">권한 없음</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6">새 공연 등록 요청</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              공연 제목
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              공연 설명
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          {/* ... posterUrl, ticketUrl, venue, price 입력 필드들 ... */}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? "요청 중..." : "등록 요청하기"}
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default LiveRequestPage;
