import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/auth";
import StorageService from "../services/storage";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 실행 시 localStorage에서 토큰/유저 정보 확인
  useEffect(() => {
    const token = StorageService.getAccessToken();
    const storedUser = StorageService.getUser();
    if (token && storedUser) {
      setUser(storedUser);
      // TODO: api.js로 /api/users/me 엔드포인트 호출해서 토큰이 진짜 유효한지 검증하는 로직 있으면 좋음
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({
      loginId: email,
      password: password,
    });
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const register = async (userData) => {
    // auth.js의 register 함수 호출
  };

  const value = {
    user,
    setUser,
    isLoggedIn: !!user,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook 생성
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다.");
  }
  return context;
};
