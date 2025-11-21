import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import artistService from "../services/artistService";

const ArtistListPage = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const response = await artistService.getArtists(searchTerm || null, {
          page: page,
          size: 20,
        });
        setArtists(response.data.content || []);
      } catch (err) {
        setError("아티스트 목록을 불러오는 데 실패했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, [page, searchTerm]);

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">아티스트</h1>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="아티스트 이름으로 검색"
          className="w-full p-3 mb-6 border rounded-lg"
        />
        {loading && <p className="text-center">로딩 중...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {!loading && artists.length === 0 && (
            <p className="col-span-full text-center text-gray-500">
              {searchTerm
                ? "검색 결과가 없습니다."
                : "등록된 아티스트가 없습니다."}
            </p>
          )}
          {artists.map((artist) => (
            <Link
              to={`/artists/${artist.artistId}`}
              key={artist.artistId}
              className="group border rounded-lg shadow-sm hover:shadow-xl transition-all overflow-hidden text-center"
            >
              <img
                src={
                  artist.artistImageUrl ||
                  "https:/placehold.co/200x200?text=Artist"
                }
                alt={artist.artistName}
                className="w-full h-48 object-cover transition-transform group-hover:scale-105"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold truncate">
                  {artist.artistName}
                </h3>
                <p className="text-sm text-gray-500">
                  팔로워 {artist.followerCount}명
                </p>
              </div>
            </Link>
          ))}
        </div>
        {/* TODO: 페이지네이션 UI */}
      </div>
    </MainLayout>
  );
};

export default ArtistListPage;
