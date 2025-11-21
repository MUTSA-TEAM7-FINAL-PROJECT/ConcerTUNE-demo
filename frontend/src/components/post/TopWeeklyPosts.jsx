// components/home/TopWeeklyPosts.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import postService from "../../services/postService";

// 카테고리 이름 및 색상 매핑 함수
const getCategoryInfo = (category) => {
    switch (category) {
        case "review": return { name: "후기", color: "text-blue-600", bgColor: "bg-blue-100" };
        case "accompany": return { name: "동행", color: "text-green-600", bgColor: "bg-green-100" };
        default: return { name: "자유", color: "text-gray-600", bgColor: "bg-gray-100" };
    }
};

const TopWeeklyPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTopPosts = async () => {
            try {
                setLoading(true);
                const data = await postService.getTop3WeeklyPosts();
                setPosts(data);
            } catch (err) {
                console.error("인기 게시글 정보를 불러오는 데 실패했습니다:", err);
                setError("인기 게시글 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchTopPosts();
    }, []);

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
                 주간 인기 게시글
                <Link to="/community/free" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    커뮤니티 &rarr;
                </Link>
            </h2>
            {loading ? (
                <div className="text-center py-8 text-indigo-600">게시글 정보 로딩 중...</div>
            ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
            ) : (
                <div className="space-y-4"> {/* 간격 조정 */}
                    {posts.map((post) => {
                        const categoryInfo = getCategoryInfo(post.category);
                        const hasImage = post.imageUrls && post.imageUrls.length > 0;
                        const thumbnailUrl = hasImage ? post.imageUrls[0] : null;

                        return (
                            <Link
                                to={`/post/${post.postId}`}
                                key={post.postId}
                                className="flex border rounded-lg shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 overflow-hidden bg-white"
                            >
                                {/* 💡 썸네일 섹션 (이미지가 있을 경우) */}
                                {hasImage && (
                                    <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-24 bg-gray-100">
                                        <img
                                            src={thumbnailUrl}
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="p-4 flex-grow flex items-center min-w-0">
                                    <div className="flex items-center justify-between w-full">
                                        {/* 텍스트 내용 */}
                                        <div className="flex items-center min-w-0 pr-4">
                                            <span className={`text-xs font-extrabold px-2 py-1 mr-2 rounded ${categoryInfo.color} ${categoryInfo.bgColor}`}>
                                                [{categoryInfo.name}]
                                            </span>
                                            <span className="text-lg font-semibold text-gray-900 truncate">
                                                {post.title}
                                            </span>
                                        </div>
                                        
                                        {/* 작성자 및 추천수 정보 */}
                                        <div className="flex-shrink-0 flex items-center space-x-4 text-sm text-gray-500 pl-4">
                                            <span className="font-semibold text-gray-700 hidden sm:inline"> {post.writer}</span> {/* 작은 화면에서 숨김 */}
                                            <span title="추천수" className="flex items-center text-red-500 font-bold">
                                                👍 {post.likeCount || 0}
                                            </span>
                                            <span title="댓글수" className="flex items-center hidden sm:inline">
                                                💬 {post.commentCount || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                    {posts.length === 0 && <p className="text-center py-8 text-gray-500">인기 게시글이 아직 없습니다.</p>}
                </div>
            )}
        </section>
    );
};

export default TopWeeklyPosts;