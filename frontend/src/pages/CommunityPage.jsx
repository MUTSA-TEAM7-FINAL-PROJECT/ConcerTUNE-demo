import React from "react";
import { NavLink, Outlet } from "react-router-dom";

// 탭 메뉴 스타일
const getLinkClass = ({ isActive }) => {
  return isActive
    ? "w-1/3 text-center px-4 py-3 text-lg font-bold text-indigo-600 border-b-2 border-indigo-600 transition-colors duration-150"
    : "w-1/3 text-center px-4 py-3 text-lg font-medium text-gray-500 hover:text-gray-800 transition-colors duration-150";
};

const CommunityPage = () => {
  return (
    <div className="w-full">
      <nav className="flex justify-between border-b border-gray-200 mb-6">
        <NavLink to="free" className={getLinkClass}>
          자유게시판
        </NavLink>
        
        <NavLink to="review" className={getLinkClass}>
          공연 후기
        </NavLink>
        
        <NavLink to="accompany" className={getLinkClass}>
          동행 구하기
        </NavLink>
      </nav>

      <Outlet />
    </div>
  );
};

export default CommunityPage;