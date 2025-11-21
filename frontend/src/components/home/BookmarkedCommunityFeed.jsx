// BookmarkedCommunityFeed.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import postService from '../../services/postService'; 
import { useAuth } from '../../context/AuthContext'; 

const BookmarkedCommunityFeed = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || !user.id) {
            setLoading(false);
            setPosts([]);
            setError("로그인이 필요한 서비스입니다."); 
            return; 
        }

        const fetchBookmarkedPosts = async () => {
            try {
                setLoading(true);
                // postService가 Live Title 정보를 포함한 데이터를 반환한다고 가정
                const data = await postService.getBookmarkedConcertPosts();
                setPosts(data);
                setError(null);
            } catch (err) {
                console.error("북마크 커뮤니티 피드 정보를 불러오는 데 실패했습니다:", err);
                setError("커뮤니티 글을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchBookmarkedPosts();
    }, [user]);

    // 로딩, 에러, 게시글 없음 상태 처리 (생략 없이 유지)
    
    if (loading) {
        return (
            <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold mb-4">💬 북마크 커뮤니티 피드</h3>
                <div className="bg-gray-50 p-6 rounded-lg h-96 border animate-pulse">
                    <div className="space-y-3">
                        <div className="h-10 bg-gray-200 rounded-md"></div>
                        <div className="h-10 bg-gray-200 rounded-md w-11/12"></div>
                        <div className="h-10 bg-gray-200 rounded-md w-10/12"></div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (error && (user && user.id)) {
        return (
            <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold mb-4">나의 커뮤니티 피드</h3>
                <div className="bg-red-50 p-6 rounded-lg h-96 overflow-y-auto border border-red-200 flex items-center justify-center">
                    <p className="text-red-500 font-semibold text-center">{error}</p>
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        const message = !user || !user.id 
            ? "로그인이 필요합니다. 로그인 후 북마크된 글을 확인하세요."
            : "북마크된 커뮤니티 게시글이 없습니다.";

        return (
            <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold mb-4">나의 커뮤니티 피드</h3>
                <div className="bg-gray-100 p-6 rounded-lg h-96 overflow-y-auto border flex items-center justify-center">
                    <p className="text-gray-500 font-medium text-center">{message}</p>
                </div>
            </div>
        );
    }
    
    // 정상 렌더링 부분
    return (
        <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4">나의 커뮤니티 피드</h3>
            <div className="bg-gray-50 p-6 rounded-lg h-96 overflow-y-auto border">
                <div className="space-y-3">
                    {posts.map(post => (
                        <Link 
                            to={`/post/${post.postId}`} 
                            key={post.postId} 
                            className="block p-3 bg-white hover:bg-gray-100 rounded-md transition duration-150"
                        >
                            {/* 게시글 제목 */}
                            <p className="font-semibold text-gray-800 truncate mb-1">
                                {post.title}
                            </p>
                            
                            {/* 💡 공연 제목 및 작성자 정보 추가 */}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-indigo-600 font-medium truncate max-w-[60%]">
                                    {post.concertTitle || post.liveTitle || "공연 정보 없음"}
                                </span>
                                <span className="text-gray-500 flex-shrink-0 ml-4">
                                    by {post.writer} ({post.likeCount}👍)
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BookmarkedCommunityFeed;