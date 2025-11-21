// components/home/LatestConcerts.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import concertService from "../../services/concertService";

const LatestConcerts = () => {
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLatestConcerts = async () => {
            try {
                setLoading(true);
                const data = await concertService.getLatest4Concerts(); 
                setConcerts(data);
            } catch (err) {
                console.error("최신 공연 정보를 불러오는 데 실패했습니다:", err);
                setError("최신 공연 정보를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchLatestConcerts();
    }, []);

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
                최신 등록 공연
                <Link to="/concerts" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    더 보기 &rarr;
                </Link>
            </h2>
            {loading ? (
                <div className="text-center py-8 text-indigo-600">공연 정보 로딩 중...</div>
            ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {concerts.map((concert) => (
                        <Link
                            to={`/concerts/${concert.liveId}`}
                            key={concert.liveId}
                            className="border rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white transform hover:-translate-y-1"
                        >
                            <div className="w-full aspect-[3/4] overflow-hidden"> 
                                <img
                                    src={concert.posterUrl || "https://placehold.co/300x400?text=No+Poster"}
                                    alt={concert.title}
                                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold truncate text-gray-900">
                                    {concert.title}
                                </h3>
                                <p className="text-sm text-gray-500 truncate mt-1">
                                    {concert.venue}
                                </p>
                            </div>
                        </Link>
                    ))}
                    {concerts.length === 0 && <p className="col-span-4 text-center text-gray-500">최신 공연 정보가 없습니다.</p>}
                </div>
            )}
        </section>
    );
};

export default LatestConcerts;