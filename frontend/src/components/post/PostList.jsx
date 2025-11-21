import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import postService from '../../services/postService';
import PostItem from './PostItem';
import { useAuth } from '../../context/AuthContext';

const getCategoryName = (param) => {
    switch (param) {
        case 'free': return '자유게시판';
        case 'review': return '공연 후기';
        case 'accompany': return '동행 구하기';
        default: return '커뮤니티';
    }
};

const PostList = () => {
    const { category } = useParams();
    const navigate = useNavigate();

    const { isLoggedIn } = useAuth();

    // --- 페이지네이션 관련 상태 ---
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 (0부터 시작)
    const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const PAGE_SIZE = 12; // 카드 형식에 맞게 PAGE_SIZE를 10에서 12로 변경했습니다.
    const SORT_BY = 'createdAt,desc';

    // 💡 페이지 번호를 인수로 받는 데이터 패칭 함수 (페이지네이션용)
    const fetchPosts = useCallback(async (pageNumber) => {
        setLoading(true);
        setError(null);

        try {
            const responseData = await postService.getPostsByCategory(
                category,
                pageNumber,
                PAGE_SIZE,
                SORT_BY
            );
            
            setPosts(responseData.content);
            setCurrentPage(responseData.number); // API 응답의 현재 페이지 번호 저장
            setTotalPages(responseData.totalPages); // API 응답의 전체 페이지 수 저장

        } catch (err) {
            console.error("Failed to fetch posts:", err);
            setError(err.message || "게시글 목록을 불러오지 못했습니다.");
            setPosts([]);
            setTotalPages(1); // 에러 발생 시 전체 페이지 수를 1로 설정
        } finally {
            setLoading(false);
        }
    }, [category]); // 의존성 배열에 카테고리만 포함

    // 1. 카테고리 변경 또는 URL 페이지 쿼리 변경 시 첫 페이지 로드
    useEffect(() => {
        if (!['free', 'review', 'accompany'].includes(category)) {
            navigate('/community/free', { replace: true });
            return;
        }

        // URL 쿼리 파라미터에서 페이지 번호 추출 (1부터 시작하는 페이지 번호로 가정)
        const urlParams = new URLSearchParams(window.location.search);
        const pageFromUrl = parseInt(urlParams.get('page')) || 1;
        
        // 🚨 페이지네이션은 0부터 시작하므로 1을 빼서 API 요청
        const initialPage = pageFromUrl > 0 ? pageFromUrl - 1 : 0;
        
        // 상태 초기화
        setPosts([]);
        setTotalPages(1);
        setError(null);

        fetchPosts(initialPage);
    }, [category, navigate, fetchPosts]);

    // 2. 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            // URL을 변경하여 상태를 업데이트합니다. (Page URL 쿼리 파라미터는 1부터 시작)
            navigate(`?page=${newPage + 1}`, { replace: true });
        }
    };
    
    // 로딩 및 에러 상태 처리
    if (loading && posts.length === 0) {
        return <div className="text-center py-10 text-gray-500">게시글을 불러오는 중...</div>;
    }

    if (error && posts.length === 0) {
        return <div className="text-center py-10 text-red-500">{error}</div>;
    }

    const renderPageNumbers = () => {
        const pages = [];
        const startPage = Math.max(0, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 3);

        for (let i = startPage; i < endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    disabled={i === currentPage}
                    className={`px-3 py-1 mx-1 rounded-md transition duration-150 ${
                        i === currentPage
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    {i + 1}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            
            {/* 📋 제목 및 글쓰기 버튼 섹션 */}
            <div className="flex items-center justify-between mb-8">
                <div className="w-1/3"></div> 
                <h2 className="text-3xl font-extrabold text-gray-800 flex-1 text-center">
                    {getCategoryName(category)}
                </h2>
                <div className="w-1/3 flex justify-end">
                    {isLoggedIn && (
                        <Link 
                            to={`/community/write/${category}`} 
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 font-semibold"
                        >
                            글쓰기
                        </Link>
                    )}
                </div>
            </div>

            {/* 🖼️ 게시글 카드 그리드 목록 */}
            <div className="grid grid-cols-1 gap-6 mb-8">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <PostItem key={post.id} post={post} />
                        ))
                    ) : (
                        !loading && !error && (
                            <div className="col-span-full py-10 text-center text-gray-500 border border-dashed border-gray-200 rounded-lg">
                                등록된 게시글이 없습니다.
                            </div>
                        )
                    )}
                </div>
            
            {/* 🔢 페이지네이션 컨트롤 */}
            <div className="flex justify-center items-center space-x-2 mt-6">
                
                {/* << 이전 페이지 버튼 */}
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="px-3 py-1 rounded-md text-gray-600 bg-gray-50 border hover:bg-gray-100 disabled:opacity-50 transition"
                >
                    &lt; 이전
                </button>

                {/* 페이지 번호 버튼들 */}
                {renderPageNumbers()}

                {/* >> 다음 페이지 버튼 */}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1 || totalPages === 0}
                    className="px-3 py-1 rounded-md text-gray-600 bg-gray-50 border hover:bg-gray-100 disabled:opacity-50 transition"
                >
                    다음 &gt;
                </button>
            </div>
            
            {/* 로딩 표시 (페이지 전환 시) */}
            {loading && posts.length > 0 && (
                <div className="py-4 text-center text-indigo-600 font-medium animate-pulse">
                    새 페이지를 불러오는 중...
                </div>
            )}
        </div>
    );
};

export default PostList;