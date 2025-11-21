import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { mockConcertList } from "../data/mockData";

const ConcertListPage = () => {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [size] = useState(9);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState("전체");

  const availableGenres = useMemo(() => {
    const genres = [...new Set(mockConcertList.map(concert => concert.genre))];
    return genres.sort();
  }, []);

  useEffect(() => {
    const fetchConcerts = async () => {
      setLoading(true);

      setTimeout(() => {
        let filteredConcerts = mockConcertList;

        if (selectedGenre !== "전체") {
          filteredConcerts = mockConcertList.filter(
            (concert) => concert.genre === selectedGenre
          );
        }

        const totalItems = filteredConcerts.length;
        const calculatedTotalPages = Math.ceil(totalItems / size);
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedConcerts = filteredConcerts.slice(startIndex, endIndex);

        setConcerts(paginatedConcerts);
        setTotalPages(calculatedTotalPages);
        setLoading(false);
      }, 500);
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
      
      <div className="mb-6 flex justify-center mb-8">
        <select
          value={selectedGenre}
          onChange={(e) => {
            setSelectedGenre(e.target.value);
            setPage(0);
          }}
          className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
        >
          <option value="전체">전체 장르</option>
          {availableGenres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-xl text-indigo-600">로딩 중...</p>
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
      
      {concerts.length === 0 && !loading && (
        <p className="text-center text-xl text-gray-500 mt-10">
          조회된 공연이 없습니다.
        </p>
      )}
    </div>
  );
};

export default ConcertListPage;