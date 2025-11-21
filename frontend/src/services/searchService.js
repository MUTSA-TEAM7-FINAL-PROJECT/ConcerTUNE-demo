import api from "./api" ;

const searchService = {
 
  searchAll: async (keyword, page = 0, size = 10) => {
    try {
        const response = await  api.get(`/api/search`, {
            params: { 
                q: keyword,
                page: page,
                size: size 
            }
        });
        return response.data; 
    } catch (error) {
        console.error("통합 검색 실패:", error);
        throw error;
    }
    }
};

export default searchService;