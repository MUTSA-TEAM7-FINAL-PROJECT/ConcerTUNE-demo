import React from "react";
import { Link } from "react-router-dom";
import authService from "../services/auth";
import PersonalizedHomeSections from "../components/home/PersonalizedHomeSections";
import LatestConcerts from "../components/post/LatestConcerts";
import TopWeeklyPosts from "../components/post/TopWeeklyPosts";


const Home = () => {

  const isLoggedIn = authService.isAuthenticated();

  return (
    <div className="space-y-12">
      
      <section className="text-center p-10 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          당신이 원하는 콘서트에 마음을 TUNE해보세요!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          놓치기 아까운 인디밴드/내한공연 정보를 한눈에
        </p>
        <Link
          to="/concerts"
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
        >
          공연 둘러보기
        </Link>
      </section>

  
      <LatestConcerts /> 
      
      <hr className="border-gray-200" />

      <TopWeeklyPosts /> 
      
      {isLoggedIn && (
          <>
        <hr className="border-gray-200 mt-12" />
        <PersonalizedHomeSections />
          </>
        )}

    </div>
  );
};

export default Home;