import React from "react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaSpotify, FaEnvelope } from "react-icons/fa";
import { API_URL } from "../services/api";

const AuthSelectPage = () => {
  const navigate = useNavigate();

   const handleSocialLogin = (provider) => {
      const baseUrl = provider === 'spotify' 
          ? "http://127.0.0.1:8080" // spotify일 경우 127.0.0.1
          : API_URL; 
  
      window.location.href = `${
          baseUrl 
      }/oauth2/authorization/${provider}`;
    }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-xl bg-white shadow-2xl rounded-3xl border border-gray-100 overflow-hidden flex flex-col p-12 space-y-8">
        
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight text-center mb-18"> 
          ConcerTUNE에 가입하세요
        </h2>

        <div className="flex flex-col space-y-8"> 
          
          <div className="flex flex-col w-full max-w-sm mx-auto gap-4">
            <button
              onClick={() => navigate("/register")} 
              className="relative w-full flex items-center justify-center gap-4 py-4 px-5 border border-gray-300 text-xl font-bold rounded-xl 
                         text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 
                         transition duration-200 transform hover:scale-[1.01] shadow-md"
            >
              <FaEnvelope className="w-6 h-6" />
              이메일로 가입하기
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center my-8">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="text-gray-400 text-lg font-semibold px-4">
                또는
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>
        
        <div className="flex flex-col w-full max-w-sm mx-auto gap-4">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="relative flex items-center justify-center gap-4 w-full py-4 border border-gray-300 rounded-xl 
                       text-gray-700 bg-white hover:bg-gray-100 transition duration-200 shadow-md text-xl font-medium transform hover:scale-[1.01]"
          >
            <FcGoogle className="w-6 h-6" />
            Google로 가입하기
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("spotify")}
            className="relative flex items-center justify-center gap-4 w-full py-4 border border-green-500 rounded-xl 
                       text-white bg-green-500 hover:bg-green-600 transition duration-200 shadow-md text-xl font-medium transform hover:scale-[1.01]"
          >
            <FaSpotify className="w-6 h-6" />
            Spotify로 가입하기
          </button>
        </div>
  
        <div className="text-center pt-6">
            <span className="text-base text-gray-600">
                이미 계정이 있다면,
            </span>
            <button
                onClick={() => navigate("/login")}
                className="text-base font-medium text-blue-600 hover:text-blue-700 hover:underline transition duration-150 ml-1"
            >
                로그인하기
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthSelectPage;