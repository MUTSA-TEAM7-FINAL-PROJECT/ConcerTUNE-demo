import api from "./api";

const authService = {
  async login(userData) {
    const response = await api.post("/api/auth/login", userData);
    const { access_token, refresh_token, user } = response.data;

    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  async register(userData) {
    const response = await api.post("/api/auth/register", userData);
    const { access_token, refresh_token, user } = response.data;

    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      await api.post("/api/auth/logout", null, {
        headers: {
          'X-Refresh-Token': refreshToken 
        }
      });
      
    } catch (error) {

      console.error("서버 로그아웃 요청 실패, 클라이언트 상태 초기화:", error);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem("accessToken");
  },

 async requestEmailVerification(email) {
    try {
      const response = await api.post("api/auth/email/verify/request", { email: email });
      
      return response.data;
      
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data || {};
        throw new Error(errorData.message || "인증번호 요청에 실패했습니다.");
      }
      throw new Error("인증번호 요청 서버 연결 오류");
    }
  },

  async confirmEmailVerification(email, token) {
    try {
      const response = await api.post("api/auth/email/verify/confirm", { email: email, token: token });
      
      return response.data;
      
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data || {};
        throw new Error(errorData.message || "인증번호 확인에 실패했습니다.");
      }
      throw new Error("인증번호 확인 서버 연결 오류");
    }
  },

   async requestPasswordReset(email) {
    try {
      const response = await api.post("/api/auth/password/forget", { email: email });
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data || {};
        throw new Error(errorData.message || "비밀번호 재설정 요청에 실패했습니다.");
      }
      throw new Error("서버 연결 오류");
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await api.post("/api/auth/password/reset", { token: token, newPassword: newPassword });
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data || {};
        throw new Error(errorData.message || "비밀번호 재설정에 실패했습니다.");
      }
      throw new Error("서버 연결 오류");
    }
  },
};
export default authService;