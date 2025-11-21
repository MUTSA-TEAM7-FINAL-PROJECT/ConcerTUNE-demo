    import React, { useEffect, useState } from "react";
    import { FaTimes } from "react-icons/fa";
    import { useNavigate } from "react-router-dom";
    import myPageService from "../../services/myPageService";

    const FollowModal = ({ isOpen, onClose, type = "followers", userId }) => {
        const [users, setUsers] = useState([]);
        const [page, setPage] = useState(0);
        const pageSize = 10;
        const navigate = useNavigate();

        useEffect(() => {
            if (isOpen && userId) fetchUsers(0);
        }, [isOpen, type, userId]);

        const fetchUsers = async (pageNum = 0) => {
            try {
                let res;
                if (type === "followers") {
                    res = await myPageService.getFollowers(userId, pageNum, pageSize);
                } else {
                    res = await myPageService.getFollowings(userId, pageNum, pageSize);
                }
                setUsers(res.content);
                setPage(pageNum);
            } catch (err) {
                console.error(`${type} 불러오기 실패:`, err);
            }
        };

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl w-96 max-h-[80vh] overflow-y-auto relative p-6">
                    <button
                        className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                        onClick={onClose}
                    >
                        <FaTimes />
                    </button>
                    <h3 className="text-xl font-bold mb-4">{type === "followers" ? "팔로워" : "팔로잉"}</h3>

                    {users.length === 0 && <p className="text-gray-500 text-center">정보가 없습니다.</p>}

                    <div className="flex flex-col gap-3">
                        {users.map(user => (
                            <div key={user.id} className="flex items-center justify-between border-b pb-2">
                                <div
                                    className="flex items-center gap-3 cursor-pointer"
                                     onClick={() => {
                                        navigate(`/user/${user.id}`);
                                        onClose(); // 이동 시 모달 닫기
                                    }}
                                >
                                    <img
                                        src={user.profileImageUrl}
                                        alt={user.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <span className="font-medium">{user.username}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 페이지 네비게이션 */}
                    <div className="flex justify-between mt-4">
                        <button
                            disabled={page === 0}
                            className="px-3 py-1 border rounded disabled:opacity-40"
                            onClick={() => fetchUsers(page - 1)}
                        >
                            이전
                        </button>
                        <button
                            className="px-3 py-1 border rounded"
                            onClick={() => fetchUsers(page + 1)}
                        >
                            다음
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    export default FollowModal;
