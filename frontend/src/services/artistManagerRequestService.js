import api from "./api"; 


const artistManagerRequestService = {
    
    submitManagerRequest: async (requestDto) => {
        try {
            const response = await api.post("/api/artist-manager-requests", requestDto);
            return response.data; 
        } catch (error) {
            console.error("Error submitting manager request:", error.response?.data || error.message);
            throw error;
        }
    },

    getAllManagerRequestsForAdmin: async (pageableParams = {}) => {
        try {
            const response = await api.get("/api/artist-manager-requests", { 
                params: pageableParams 
            });
            
            return response.data; 
        } catch (err) {
            console.error("관리자 요청 목록 조회 실패:", err);
            throw new Error(err.response?.data?.message || "요청 목록을 불러오는 데 실패했습니다.");
        }
    },

    getMyManagerRequests: async (pageableParams = {}) => {
        try {
            const response = await api.get(`/api/artist-manager-requests/my`, { 
                params: pageableParams 
            });
            return response.data; 
        } catch (err) {
            console.error("사용자 요청 목록 조회 실패:", err);
            throw new Error(err.response?.data?.message || "사용자 요청 목록을 불러오는 데 실패했습니다.");
        }
    },

    respondToManagerRequest: async (requestId, status, adminNote) => {
        try {
            const payload = { 
                status: status,
                adminNote: adminNote || (status === 'REJECTED' ? '사유 미기재' : '승인 완료') 
            };
            
            const response = await api.patch(`/api/artist-manager-requests/${requestId}/response`, payload);
            return response;
        } catch (err) {
            console.error("관리 요청 상태 업데이트 실패:", err);
            throw new Error(err.response?.data?.message || "요청 처리에 실패했습니다.");
        }
    },
};

export default artistManagerRequestService;