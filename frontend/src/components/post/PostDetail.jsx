import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import postService from '../../services/postService';
import commentService from '../../services/commentService'; 
import CommentList from '../comment/CommentList'; 
import CommentWrite from '../comment/CommentWrite'; 

// 실제 앱에서는 인증 컨텍스트/Redux 등에서 가져와야 합니다.
// 여기서는 테스트를 위해 '로그인된 상태'를 임시로 설정합니다.
const useAuth = () => ({ 
    isLoggedIn: true // 💡 이 값을 false로 변경하여 비로그인 상태 테스트 가능
});

const getCategoryName = (param) => {
    switch (param) {
        case 'free': return '자유게시판';
        case 'review': return '공연 후기';
        case 'accompany': return '동행 구하기';
        default: return '커뮤니티';
    }
};

const PostDetail = (category) => {
    const {postId } = useParams();
    const navigate = useNavigate();
    
    // 💡 로그인 상태 가져오기
    const { isLoggedIn } = useAuth(); 
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);

    // 게시글 상세 정보 및 댓글 목록 불러오기
    const fetchPostAndComments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const postDetail = await postService.getPostDetail(postId);
            const isLiked = await postService.isPostLiked(postId);

        setPost({
            ...postDetail,
            isLikedByUser: isLiked 
        });            
            const commentsList = await commentService.getCommentsByPost(postId);
            setComments(commentsList);
            
        } catch (err) {
            console.error("데이터 로드 실패:", err);
            setError(err.message || "게시글 정보를 불러오는 데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    }, [category, postId]);

    useEffect(() => {
        fetchPostAndComments();
    }, [fetchPostAndComments]);

    // 게시글 좋아요 토글 핸들러
    const handleLikeToggle = async () => {
        if (!post) return;
        
        // 🚨 로그인 체크
        if (!isLoggedIn) {
            alert("게시글 좋아요는 로그인한 사용자만 가능합니다.");
            return;
        }

        try {
            const isLiked = await postService.togglePostLike(post.id);
            
            setPost(prevPost => ({
                ...prevPost,
                likeCount: prevPost.likeCount + (isLiked ? 1 : -1),
                isLikedByUser: isLiked 
            }));
        } catch (err) {
            alert(err.message || "좋아요 처리 중 오류가 발생했습니다.");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("정말로 게시글을 삭제하시겠습니까?")) return;
        
        try {
            await postService.deletePost(postId);
            alert("게시글이 삭제되었습니다.");
            navigate(`/community/${category}`, { replace: true });
        } catch (err) {
            alert(err.message || "게시글 삭제에 실패했습니다.");
        }
    };
    
    const handleCommentCreated = () => {
        commentService.getCommentsByPost(postId)
            .then(setComments)
            .catch(err => console.error("댓글 갱신 실패:", err));
        fetchPostAndComments(); 
    };

    if (loading) {
        return <div className="text-center py-20 text-indigo-600">상세 정보를 불러오는 중입니다...</div>;
    }

    if (error || !post) {
        return <div className="text-center py-20 text-red-500">{error || "게시글을 찾을 수 없습니다."}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl">
            {/* 게시글 헤더 및 본문 (기존과 동일) */}
            <div className="border-b pb-4 mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{post.title}</h1>
                <p className="text-sm text-gray-500">
                    <span className="font-semibold text-indigo-600">[{getCategoryName(category)}]</span>
                    <span className="mx-2">|</span>
                    작성자: **{post.writerUsername}**
                    <span className="mx-2">|</span>
                    조회수: {post.viewCount}
                    <span className="mx-2">|</span>
                    작성일: {new Date(post.createdAt).toLocaleDateString()}
                </p>
            </div>
            <div className="prose max-w-none mb-8">
                {post.imageUrls && post.imageUrls.map((url, index) => (
                    <img key={index} src={url} alt={`첨부 이미지 ${index + 1}`} className="my-4 rounded-lg shadow-md max-w-full h-auto" />
                ))}
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* 좋아요 및 액션 버튼 */}
            <div className="flex justify-between items-center border-t pt-4">
                <button
                    onClick={handleLikeToggle}
                    // 💡 비로그인 시 버튼 비활성화 및 스타일 적용
                    disabled={!isLoggedIn} 
                    className={`flex items-center space-x-2 p-3 rounded-full transition duration-200 
                        ${post.isLikedByUser && isLoggedIn ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    title={isLoggedIn ? "좋아요 토글" : "로그인이 필요합니다"}
                >
                    {/* 좋아요 아이콘 (예시) */}
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                    <span className="font-bold">{post.likeCount}</span>
                </button>
                
                {/* 작성자만 보이는 수정/삭제 버튼 (기존과 동일) */}
                {post.isWriter && ( 
                    <div className="space-x-2">
                        <Link 
                            to={`/community/edit/${category}/${postId}`}
                            className="px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
                        >
                            수정
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>

            {/* 댓글 섹션 */}
            <div className="mt-10">
                <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
                    댓글 <span className="text-indigo-600">({post.commentCount})</span>
                </h3>
                
                {/* 댓글 작성 폼 */}
                <CommentWrite 
                    postId={post.id} 
                    onCommentCreated={handleCommentCreated}
                    isLoggedIn={isLoggedIn} // 💡 isLoggedIn 전달
                />

                {/* 댓글 목록 */}
                <CommentList 
                    comments={comments} 
                    onCommentUpdated={handleCommentCreated} 
                    isLoggedIn={isLoggedIn} // 💡 isLoggedIn 전달
                />
            </div>
        </div>
    );
};

export default PostDetail;