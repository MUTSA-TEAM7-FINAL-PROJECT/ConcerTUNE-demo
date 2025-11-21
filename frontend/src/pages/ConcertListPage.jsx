import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import concertService from "../services/concertService";

// 백엔드에서 사용한 30가지 한국어 장르 목록
const ALL_GENRES = [
  "팝", "록", "힙합", "알앤비", "재즈", "클래식", 
  "일렉트로닉", "포크", "컨트리", "블루스", "케이팝", 
  "인디", "발라드", "메탈", "레게", "앰비언트", 
  "하우스", "테크노", "트랜스", "가스펠", "OST/사운드트랙", 
  "오페라", "트로트", "댄스", "펑크", "어쿠스틱", 
  "소울", "디스코", "퓨전", "월드 뮤직"
];

const ConcertListPage = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(0);
  const [size] = useState(9);
  const [totalPages, setTotalPages] = useState(0); 
  const [selectedGenre, setSelectedGenre] = useState("전체");

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
            page: page,
            size: size,
        };

        if (selectedGenre !== "전체") {
            params.genre = selectedGenre;
        }

        const pageResponse = await concertService.getConcerts(params);

        setConcerts(pageResponse.content); 
        setTotalPages(pageResponse.totalPages);

      } catch (err) {
        console.error("공연 정보를 불러오는 데 실패했습니다:", err);
        setError(err.message || "공연 정보를 불러오는 데 실패했습니다.");
        setConcerts([]); 
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };
    fetchConcerts();
    
  }, [selectedGenre, page, size]);


  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
        setPage(newPage);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">
        공연 전체 목록
      </h1>
      
      <div className="mb-6 flex justify-center mb -8">
        <select
          value={selectedGenre}
          onChange={(e) => {
            setSelectedGenre(e.target.value);
            setPage(0); 
          }}
          className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
        >
          <option value="전체">전체 장르</option>
          {ALL_GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-xl text-indigo-600">로딩 중...</p>
      ) : error ? (
        <p className="text-center text-xl text-red-600">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {concerts.map((concert) => (
              <Link
                to={`/concerts/${concert.liveId}`}
                key={concert.id}
                className="group border rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white transform hover:-translate-y-1"
              >
               <div className="w-full aspect-[3/4] overflow-hidden"> 
                <img
                  src={concert.posterUrl || "https://placehold.co/300x400?text=No+Poster"}
                  alt={concert.title}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                />
              </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold truncate text-gray-900">
                    {concert.title}
                  </h3>
                  <p className="text-base text-gray-500 truncate mt-1">
                    <span className="font-semibold">장소:</span> {concert.venue}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* 페이지네이션 UI */}
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 border rounded-lg bg-gray-100 disabled:opacity-50"
            >
              이전
            </button>
            <span className="text-lg font-semibold">
              {totalPages > 0 ? page + 1 : 0} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1 || totalPages === 0}
              className="px-4 py-2 border rounded-lg bg-gray-100 disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </>
      )}
      
      {concerts.length === 0 && !loading && !error && (
        <p className="text-center text-xl text-gray-500 mt-10">
          조회된 공연이 없습니다.
        </p>
      )}
    </div>
  );
};

export default ConcertListPage;