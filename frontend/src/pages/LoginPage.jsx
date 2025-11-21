import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../services/api";
import { FcGoogle } from "react-icons/fc";
import { FaSpotify } from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "로그인에 실패했습니다.");
    }
  };

  const handleSocialLogin = (provider) => {
    const baseUrl = provider === 'spotify' 
        ? "http://127.0.0.1:8080" // spotify일 경우 127.0.0.1
        : API_URL; 

    window.location.href = `${
        baseUrl 
    }/oauth2/authorization/${provider}`;
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-lg p-10 space-y-10 bg-white shadow-2xl rounded-2xl border border-gray-100 transform transition duration-500 hover:shadow-3xl">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 tracking-tight mb-12">
          계정에 로그인하세요.
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
              이메일 주소
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg transition duration-150"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg transition duration-150"
              placeholder="비밀번호"
              required
            />
          </div>

          {error && (
            <div className="text-base text-center bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-5 border border-transparent text-xl font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 transform hover:scale-105"
          >
            로그인
          </button>
        </form>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-md text-gray-600">
              <a href="/password-reset" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                비밀번호를 잊으셨나요?
              </a>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <span className="w-full border-t border-gray-300"></span>
            <span className="px-4 text-sm text-gray-500 whitespace-nowrap">또는</span>
            <span className="w-full border-t border-gray-300"></span>
          </div>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="flex items-center justify-center gap-3 w-full py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition duration-150 shadow-sm text-lg font-medium"
              >
                <FcGoogle className="w-6 h-6" />
                Google로 로그인
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin("spotify")}
                className="flex items-center justify-center gap-3 w-full py-3 border border-green-500 rounded-xl text-white bg-green-500 hover:bg-green-600 transition duration-150 shadow-sm text-lg font-medium"
              >
                <FaSpotify className="w-6 h-6" />
                Spotify로 로그인
              </button>
            </div>
          </div>
        <p className="text-lg text-center text-gray-600 pt-4">
          계정이 없으신가요?{" "}
          <Link
            to="/auth/select"
            className="font-semibold text-indigo-600 hover:text-indigo-500 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;