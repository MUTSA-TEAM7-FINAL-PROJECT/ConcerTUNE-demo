import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import postService from '../services/postService';
import PostItem from '../components/post/PostItem';
import { useAuth } from '../context/AuthContext';

// 게시판 카테고리 이름 매핑 (공연 상세 페이지용)
const getCategoryName = (param) => {
    switch (param) {
        case 'free': return '자유 게시판'; 
        case 'review': return '공연 후기';
        case 'accompany': return '동행 구하기';
        default: return '게시판';
    }
};

// 💡 Props로 concertId를 받습니다.
const InfiniteScrollPostList = ({ category, concertId }) => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    // --- 무한 스크롤 관련 상태 ---
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(0); 
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loaderRef = useRef(null); 

    const PAGE_SIZE = 10; 
    const SORT_BY = 'createdAt,desc';

    const fetchPosts = useCallback(async (pageNumber) => {
        if (!hasMore && pageNumber > 0) return;
        
        setLoading(true);
        setError(null);

        try {
            const responseData = await postService.getPostsByConcertAndCategory(
                concertId, 
                category,
                pageNumber,
                PAGE_SIZE,
                SORT_BY
            );
            
            setPosts(prevPosts => [...prevPosts, ...responseData.content]);
            
            setHasMore(!responseData.last);
            setCurrentPage(pageNumber); 

        } catch (err) {
            console.error("Failed to fetch posts:", err);
            setError(err.message || "게시글 목록을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }, [category, concertId, hasMore]);


    useEffect(() => {
        setPosts([]);
        setCurrentPage(0);
        setHasMore(true);
        setError(null);
        fetchPosts(0); 
    }, [category, concertId]);

    useEffect(() => {
    if (!loaderRef.current || currentPage === undefined) return;
    
    // 💡 초기 로딩 (currentPage=0)이 성공적으로 완료되고,
    //    posts.length가 0보다 클 때만 (즉, 초기 데이터가 로드된 후) Observer를 활성화합니다.
    if (posts.length === 0 && currentPage === 0 && !loading) {
        // 초기 데이터가 아직 없으면 Observer를 활성화하지 않습니다.
        return; 
    }

    const observer = new IntersectionObserver(
        (entries) => {
            const target = entries[0];
            // 💡 currentPage > 0 이거나, posts가 이미 로드된 상태인지 확인
            if (target.isIntersecting && !loading && hasMore) {
                // 다음 페이지를 로드합니다.
                fetchPosts(currentPage + 1);
            }
        },
        { threshold: 1.0 }
    );

    observer.observe(loaderRef.current);

    return () => {
        if (loaderRef.current) {
            observer.unobserve(loaderRef.current);
        }
    };
}, [loading, hasMore, currentPage, fetchPosts, posts.length]);


    return (
        <div className="bg-white p-6 rounded-b-xl border border-t-0 shadow-lg">
            
            {/* 📋 제목 및 글쓰기 버튼 섹션 */}
            <div className="flex items-center justify-between mb-8">
                <div className="w-1/3"></div> 
                <h2 className="text-3xl font-extrabold text-gray-800 flex-1 text-center">
                    {getCategoryName(category)}
                </h2>
                <div className="w-1/3 flex justify-end">
                    {isLoggedIn && (
                        <Link 
                            // 💡 글쓰기 경로에 concertId 추가
                            to={`/community/write/${category}?concertId=${concertId}`} 
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
            
            {/* 💡 무한 스크롤 로더 */}
            {hasMore && (
                <div ref={loaderRef} className="py-4 text-center">
                    {loading ? (
                        <span className="text-indigo-600 font-medium animate-pulse">
                            게시글 로딩 중...
                        </span>
                    ) : (
                        <span className="text-gray-500">스크롤하여 더 많은 글 보기</span>
                    )}
                </div>
            )}
            
            {/* 에러 메시지 표시 */}
            {error && <div className="text-center py-4 text-red-500">{error}</div>}

            {/* 데이터 끝 표시 */}
            {!hasMore && posts.length > 0 && (
                <div className="text-center py-4 text-gray-400">--- 더 이상 게시글이 없습니다 ---</div>
            )}
        </div>
    );
};

export default InfiniteScrollPostList;