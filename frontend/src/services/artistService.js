import api from "./api";

const artistService = {
 getArtists: async (name, pageable) => {
        try {
            const params = new URLSearchParams();
            if (name) {
                params.append("name", name);
            }
            if (pageable) {
                params.append("page", pageable.page); 
                params.append("size", pageable.size);
            }
            const response = await api.get(`/api/artists?${params.toString()}`);
            
            console.log("Artists Search Response:", response);
            
            return response.data; 
        } catch (err) {
            console.error("아티스트 검색 실패:", err);
            throw new Error(err.response?.data?.message || "아티스트 목록을 불러오는 데 실패했습니다.");
        }
    },
 
    getFollowStatus: async (artistId) => {
        try {
            const response = await api.get(`/api/artists/${artistId}/follow/status`);
            
            return response.data; 
        } catch (err) {
            throw new Error(err.response?.data?.message || "팔로우 상태를 불러오는 데 실패했습니다.");
        }
    },

   toggleFollow: async (artistId) => {
        try {
            const response = await api.post(`/api/artists/${artistId}/follow`);
            return response.data; 
        } catch (err) {
            console.error("팔로우 토글 실패:", err);
            throw new Error(err.response?.data?.message || "팔로우 상태를 변경하는 데 실패했습니다.");
        }
    },

  getArtistById: async (artistId) => {
    return await api.get(`/api/artists/${artistId}`);
  },

  getArtistSchedules: async (artistId) => {
        try {
            const response = await api.get(`/api/schedules/artists/${artistId}`);
            console.log(`Artist ${artistId} Schedules Response:`, response);
            return response.data; 
        } catch (err) {
            console.error(`아티스트 ID ${artistId} 스케줄 조회 실패:`, err);
            if (err.response && err.response.status === 204) {
                return []; 
            }
            throw new Error(err.response?.data?.message || "아티스트 스케줄을 불러오는 데 실패했습니다.");
        }
    },

    updateArtistImage: async (artistId, imageUrl) => {
        try {
            const response = await api.put(`/api/artists/${artistId}/image`, { imageUrl });
            return response.data;
        } catch (err) {
            console.error("아티스트 이미지 변경 실패:", err);
            throw new Error(err.response?.data?.message || "아티스트 이미지 변경 실패");
        }
    },
    
    updateArtist: async (artistId, updatedData) => {
            try {
                const response = await api.put(`/api/artists/${artistId}`, updatedData);
                return response.data;
            } catch (err) {
                console.error("아티스트 정보 변경 실패:", err);
                throw new Error(err.response?.data?.message || "아티스트 정보 변경 실패");
            }
    },

    checkIfAdmin: async (artistId) => {
      try {
            const response = await api.get(`/api/artist-manager/${artistId}/is-admin`);
            return response.data;
        } catch (err) {
            console.error("관리자 여부 조회 실패:", err);
            return false;
        }
    },
};

export default artistService;
