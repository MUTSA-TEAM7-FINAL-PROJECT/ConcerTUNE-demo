import api from "./api";

const commentService = {
    /**
     * 특정 게시글의 댓글 목록 조회 (GET /api/posts/{postId}/comments)
     */
    getCommentsByPost: async (postId) => {
        try {
            const response = await api.get(`/api/posts/${postId}/comments`);
            return response.data; // List<CommentResponse>
        } catch (err) {
            console.error("댓글 목록 조회 실패:", err);
            throw new Error("댓글 목록을 불러오는 데 실패했습니다.");
        }
    },

    /**
     * 새 댓글 등록 (POST /api/posts/{postId}/comments)
     */
    createComment: async (postId, content) => {
        try {
            const response = await api.post(`/api/posts/${postId}/comments`, { content });
            return response.data; // CommentResponse
        } catch (err) {
            console.error("댓글 등록 실패:", err);
            throw new Error(err.response?.data?.message || "댓글 등록에 실패했습니다.");
        }
    },

    /**
     * 댓글 수정 (PUT /api/comments/{commentId})
     */
    updateComment: async (commentId, content) => {
        try {
            const response = await api.put(`/api/comments/${commentId}`, { content });
            return response.data; // CommentResponse
        } catch (err) {
            console.error("댓글 수정 실패:", err);
            throw new Error(err.response?.data?.message || "댓글 수정에 실패했습니다.");
        }
    },

    /**
     * 댓글 삭제 (DELETE /api/comments/{commentId})
     */
    deleteComment: async (commentId) => {
        try {
            await api.delete(`/api/comments/${commentId}`);
        } catch (err) {
            console.error("댓글 삭제 실패:", err);
            throw new Error("댓글 삭제에 실패했습니다.");
        }
    },
};

export default commentService;