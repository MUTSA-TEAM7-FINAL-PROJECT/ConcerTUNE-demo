import React, { useState } from 'react';
import commentService from '../../services/commentService';
/**
 * 댓글 목록의 개별 항목을 렌더링하는 컴포넌트
 */
const CommentItem = ({ comment, onUpdate, isLoggedIn }) => { // 💡 isLoggedIn prop 수신
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const [currentComment, setCurrentComment] = useState(comment);
    const [loading, setLoading] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
        });
    };

    // 댓글 수정 처리 (로직은 기존과 동일)
    const handleEditSubmit = async () => {
        if (!editedContent.trim() || editedContent.trim() === currentComment.content.trim()) {
            setIsEditing(false);
            return;
        }

        setLoading(true);
        try {
            const updatedComment = await commentService.updateComment(currentComment.id, editedContent);
            setCurrentComment(updatedComment);
            setIsEditing(false);
            onUpdate();
        } catch (error) {
            alert(`댓글 수정 실패: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // 댓글 삭제 처리 (로직은 기존과 동일)
    const handleDelete = async () => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
        try {
            await commentService.deleteComment(currentComment.id);
            onUpdate(); 
        } catch (error) {
            alert(`댓글 삭제 실패: ${error.message}`);
        }
    };
    
    // 댓글 좋아요 토글 처리
    const handleLikeToggle = async () => {
        // 🚨 이미 onClick에서 체크하지만, 혹시 모를 경우를 대비해 핸들러 내부에서 한 번 더 체크 가능
        if (!isLoggedIn) {
            alert("좋아요는 로그인한 사용자만 가능합니다.");
            return;
        }

        setLoading(true);
        try {
            const isLiked = await commentService.toggleCommentLike(currentComment.id);
            
            setCurrentComment(prev => ({
                ...prev,
                likeCount: prev.likeCount + (isLiked ? 1 : -1),
                isLikedByUser: isLiked 
            }));
        } catch (error) {
             alert(error.message || "좋아요 처리 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="border-t p-4 first:border-t-0 hover:bg-gray-50 transition duration-100">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-800">{currentComment.writerUsername}</span>
                    <span className="text-xs text-gray-500">{formatDate(currentComment.createdAt)}</span>
                </div>
                
                {/* 액션 버튼 (작성자에게만 보임) */}
                {currentComment.isWriter && (
                    <div className="text-sm space-x-2">
                        {isEditing ? (
                            <div className="space-x-2">
                                <button onClick={handleEditSubmit} disabled={loading} className="text-indigo-600 hover:text-indigo-800 font-semibold disabled:opacity-50">{loading ? '저장 중...' : '저장'}</button>
                                <button onClick={() => { setIsEditing(false); setEditedContent(currentComment.content); }} className="text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled={loading}>취소</button>
                            </div>
                        ) : (
                            <div className="space-x-2">
                                <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-gray-700">수정</button>
                                <button onClick={handleDelete} className="text-red-500 hover:text-red-700">삭제</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 댓글 내용 */}
            {isEditing ? (
                <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows="3"
                    className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                    disabled={loading}
                />
            ) : (
                <p className="text-gray-700 whitespace-pre-wrap text-sm mb-2">
                    {currentComment.content}
                </p>
            )}

            {/* 좋아요 버튼: 로그인 상태일 때만 활성화 */}
            <div className="flex justify-end">
                <button
                    // 💡 비로그인 시 알림 표시 및 좋아요 기능 비활성화
                    onClick={isLoggedIn ? handleLikeToggle : () => alert("좋아요는 로그인한 사용자만 가능합니다.")}
                    disabled={loading || !isLoggedIn}
                    className={`flex items-center space-x-1 text-sm p-1 rounded transition disabled:opacity-50 ${
                        currentComment.isLikedByUser && isLoggedIn ? 'text-red-500 font-bold' : 'text-gray-500 hover:text-red-500'
                    }`}
                    title={isLoggedIn ? "좋아요 토글" : "로그인 필요"}
                >
                    {/* 하트 아이콘 */}
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                    <span>{currentComment.likeCount}</span>
                </button>
            </div>
        </div>
    );
};

export default CommentItem;