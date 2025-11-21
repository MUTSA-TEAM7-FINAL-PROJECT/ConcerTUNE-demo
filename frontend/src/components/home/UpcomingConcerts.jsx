import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockUpcomingConcerts } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const UpcomingConcerts = () => {
    const { user } = useAuth();
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.id) {
            setLoading(false);
            setConcerts([]);
            return;
        }

        const fetchPersonalizedConcerts = async () => {
            setLoading(true);
            setTimeout(() => {
                setConcerts(mockUpcomingConcerts);
                setLoading(false);
            }, 500);
        };
        fetchPersonalizedConcerts();
    }, [user]);

    if (loading || concerts.length === 0) {
        if (loading) console.log('UpcomingConcerts: Loading');
        if (!loading && concerts.length === 0) console.log('UpcomingConcerts: No data');

        return null;
    }

    return (
        <section>
            <h3 className="text-2xl font-bold mb-4">⏰ 내 스케줄 & 선호 장르 추천 공연</h3>
            <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {concerts.map(concert => (
                        <Link to={`/concerts/${concert.liveId}`} key={concert.liveId} className="bg-white p-4 rounded-md shadow hover:shadow-lg transition">
                            <p className="text-xs text-indigo-500 font-semibold">{concert.genreName} | D-{concert.dDay}</p>
                            <h4 className="font-bold truncate">{concert.title}</h4>
                            <p className="text-sm text-gray-600 truncate">{concert.artistNames}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UpcomingConcerts;