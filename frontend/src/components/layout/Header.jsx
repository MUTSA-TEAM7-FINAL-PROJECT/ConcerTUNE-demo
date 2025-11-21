// src/components/layout/Header.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import NotificationDropdown from "./NotificatonDropdown";
import { useAuth } from "../../context/AuthContext";
// 💡 아이콘 추가
import { FaUserCircle } from 'react-icons/fa'; 

const Header = () => {
    const { isLoggedIn, user: currentUser, logout } = useAuth();
    
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchTerm.trim() !== "") {
                navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
                setSearchTerm("");
            }
        }
    };

    return (
        <header className="sticky top-0 z-10 w-full bg-white shadow-md">
            <nav className="container mx-auto flex items-center justify-between p-4">
                
                {/* 로고, 메인 네비게이션 */}
                <div className="flex items-center space-x-8">
                    <Link to="/" className="text-2xl font-bold text-gray-900">
                        ConcerTUNE
                    </Link>
                    
                    {/* 네비게이션 링크 */}
                    <ul className="hidden items-center space-x-6 md:flex">
                        <li>
                            <Link to="/concerts" className="text-gray-600 hover:text-gray-900">
                                공연 정보
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/community/free"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                커뮤니티
                            </Link>
                        </li>
                        
                        {(!isLoggedIn || (currentUser?.role !== "ADMIN" && currentUser?.role !== "ARTIST")) && (
                            <li>
                                <Link
                                    to="/concerts/request"
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    공연 등록 요청
                                </Link>
                            </li>
                        )}
                        
                        {(!isLoggedIn || (currentUser?.role !== "ADMIN" && currentUser?.role !== "ARTIST")) && (
                            <li>
                                <Link
                                    to="/artist-manager/requests"
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    아티스트 관리 요청
                                </Link>
                            </li>
                        )}

                        {/* 💡 아티스트(ARTIST)만 보이는 메뉴: 아티스트 공연 등록 */}
                        {currentUser?.role === "ARTIST" && (
                            <li>
                                <Link
                                    to="/artist/request"
                                    className="text-indigo-600 font-medium hover:text-indigo-800"
                                >
                                    아티스트 공연 등록
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>

                {/* 검색창 */}
               <div className="hidden sm:flex flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="아티스트, 공연 검색"
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={handleSearch} 
                    />
                </div>

                {/* 인증 버튼 및 사용자 정보 */}
                {isLoggedIn ? (
                    <div className="flex items-center space-x-3">
                        <NotificationDropdown />
                        
                        <span className="text-sm hidden sm:block">
                            환영합니다, {currentUser?.username}님
                        </span>
                        
                        {/* 💡 마이페이지 버튼을 아이콘으로 추가 */}
                        <Link
                            to={`/user/${currentUser?.id}`}
                            title="마이페이지"
                            className="text-2xl text-gray-600 hover:text-indigo-600 transition"
                        >
                            <FaUserCircle />
                        </Link>

                        <button
                            onClick={logout}
                            className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            로그아웃
                        </button>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                        <Link
                            to="/login"
                            className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            로그인
                        </Link>
                        <Link
                            to="/auth/select"
                            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            회원가입
                        </Link>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;