import api from "./api";
import { mockCommunityPosts } from "../data/mockData";

const postService = {

  createPost: async (category, postData) => {
    try {
      const response = await api.post(`/api/posts/${category}`, postData);
      return response.data;
    } catch (err) {
      console.error("게시글 등록 실패:", err.response || err);
      throw new Error(err.response?.data?.message || "게시글 등록에 실패했습니다.");
    }
  },

  getPostsByCategory: async (category, page = 0, size = 10, sort = 'createdAt,desc') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockCommunityPosts.filter(post => post.category === category);
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / size);
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const content = filtered.slice(startIndex, endIndex);

        resolve({
          content,
          totalPages,
          totalElements: totalItems,
          number: page,
          size,
          last: page >= totalPages - 1
        });
      }, 300);
    });
  },

  getPostsByConcertAndCategory: async (concertId, category, page, size, sort) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = mockCommunityPosts.filter(
          post => post.concertId === parseInt(concertId) && post.category === category
        );
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / size);
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const content = filtered.slice(startIndex, endIndex);

        resolve({
          content,
          totalPages,
          totalElements: totalItems,
          number: page,
          size,
          last: page >= totalPages - 1
        });
      }, 300);
    });
  },

  getPostDetail: async (postId) => {
    try {
      console.log(postId)
      const response = await api.get(`/api/posts/${postId}`);
      return response.data;
    } catch (err) {
      console.error("게시글 상세 조회 실패:", err.response || err);
      throw new Error(err.response?.data?.message || "게시글을 찾을 수 없습니다.");
    }
  },


  updatePost: async (postId, updateData) => {
    try {
      const response = await api.put(`/api/posts/${postId}`, updateData);
      return response.data;
    } catch (err) {
      console.error("게시글 수정 실패:", err.response || err);
      throw new Error(err.response?.data?.message || "게시글 수정에 실패했습니다.");
    }
  },

 
  deletePost: async (postId) => {
    try {
      await api.delete(`/api/posts/${postId}`);
    } catch (err) {
      console.error("게시글 삭제 실패:", err.response || err);
      throw new Error(err.response?.data?.message || "게시글 삭제에 실패했습니다.");
    }
  },


  togglePostLike: async (postId) => {
    try {
      const response = await api.post(`/api/posts/${postId}/like`);
      return response.data;
    } catch (err) {
      console.error("좋아요 토글 실패:", err.response || err);
      throw new Error("좋아요 처리 중 오류가 발생했습니다.");
    }
  },

  isPostLiked: async (postId) => {
    try {
      const response = await api.get(`/api/posts/${postId}/like/status`);
      return response.data;
    } catch (err) {
      console.error("게시글 좋아요 상태 조회 실패:", err.response || err);
      throw new Error("게시글 좋아요 상태를 불러오는 데 실패했습니다.");
    }
  },

    getTop3WeeklyPosts: async () => {
      try {
          const response = await api.get(`/api/posts/top-weekly`); 
          return response.data;
      } catch (err) {
          console.error("주간 인기 게시글 3개 조회 실패:", err);
          throw new Error(err.response?.data?.message || "주간 인기 게시글을 불러오는 데 실패했습니다.");
      }
    },

    getBookmarkedConcertPosts: async () => { 
        try {
            const response = await api.get(`/api/posts/bookmarked`);
            console.log(response.data);
            return response.data;
        } catch (err) {
            console.error("북마크된 커뮤니티 글 조회 실패:", err);
            throw new Error(err.response?.data?.message || "북마크된 커뮤니티 글을 불러오는 데 실패했습니다.");
        }
    },
};

export default postService;