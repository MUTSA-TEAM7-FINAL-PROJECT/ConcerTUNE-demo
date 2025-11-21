import api from "./api";

const liveRequestService = {
   getAllLiveRequestsForAdmin: async (pageableParams = {}) => {
        
        try {
            const response = await api.get(`/api/liveRequest/list`, { 
                params: pageableParams 
            });
            
            return response.data; 
        } catch (err) {
            console.error("관리자 공연 요청 목록 조회 실패:", err);
            throw new Error(err.response?.data?.message || "요청 목록을 불러오는 데 실패했습니다.");
        }
    },

    getMyLiveRequests: async (pageableParams = {}) => {
        try {
            const response = await api.get(`/api/liveRequest/my-list`, { 
                params: {
                    ...pageableParams,
                }
            });
            return response.data; 
        } catch (err) {
            console.error("사용자 요청 목록 조회 실패:", err);
            throw new Error(err.response?.data?.message || "요청 목록을 불러오는 데 실패했습니다.");
        }
    },

   updateRequestStatus: async (requestId, newStatus, rejectionReason = null) => {
        try {
            const payload = { 
                status: newStatus,
                rejectionReason: rejectionReason 
            };
            
            const response = await api.patch(`/api/liveRequest/${requestId}/response`, payload);
            return response.data;
        } catch (err) {
            console.error("요청 상태 업데이트 실패:", err);
            throw new Error(err.response?.data?.message || "상태 업데이트에 실패했습니다.");
        }
    },
};

export default liveRequestService;