import api from "./api";

const myPageService = {
  getUserContents: async (userId) => {
    try {
      const response = await api.get(`/api/${userId}/contents`);
      return response.data;  
    } catch (error) {
      console.error(error);
      return {
        bookmarkedLives: [],
        followedArtists: [],
        myPosts: []
      };
    }
  },

  getUserProfile: async (userId) => {
        try {
            const response = await api.get(`/api/${userId}/profile`);
            return response.data; 
        } catch (error) {
            console.error("프로필 정보를 가져오는 데 실패했습니다:", error);
            throw error;
        }
    },


    updateProfile: async (userId, updatedData) => {
        const requestBody = {
            username: updatedData.username,
            bio: updatedData.bio,
            genreIds: updatedData.genrePreferences.map(genre => genre.genreId)
        };
        
        try {
            await api.put(`/api/${userId}/profile`,requestBody);
            
            return true; 

        } catch (error) {
            console.error("프로필 수정 요청 실패:", error);
            throw error;
        }
    },

    updateProfileImage: async (userId, profileImageUrl) => {
    try {
      await api.put(`/api/${userId}/profile/image`, { profileImageUrl });
      return true;
    } catch (error) {
      console.error("프로필 사진 수정 실패:", error);
      throw error;
    }
  },

   checkFollowStatus: async (targetUserId) => {
    try {
      const res = await api.get(`/api/users/${targetUserId}/is-following`);
      console.log(res);
      return res.data; 
    } catch (error) {
      console.error("팔로우 상태 확인 실패:", error);
      throw error;
    }
  },

  toggleFollow: async (targetUserId) => {
    try {
      const res = await api.post(`/api/users/${targetUserId}/follow`);
            console.log(res);

      return res.data;
    } catch (error) {
      console.error("팔로우/언팔로우 실패:", error);
      throw error;
    }
  },

  getFollowers: async (userId, pageNum = 0, pageSize = 20) => {
    try {
      const res = await api.get(`/api/users/${userId}/followers`, {
        params: { page: pageNum, size: pageSize }
      });
      return res.data; 
    } catch (error) {
      console.error("팔로워 목록 조회 실패:", error);
      return { content: [], totalPages: 0, totalElements: 0 };
    }
  },

  getFollowings: async (userId, pageNum = 0, pageSize = 20) => {
    try {
      const res = await api.get(`/api/users/${userId}/followings`, {
        params: { page: pageNum, size: pageSize }
      });
      return res.data;
    } catch (error) {
      console.error("팔로잉 목록 조회 실패:", error);
      return { content: [], totalPages: 0, totalElements: 0 };
    }
  }
};

export default myPageService;