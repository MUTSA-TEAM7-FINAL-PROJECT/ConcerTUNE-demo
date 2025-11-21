import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import InfiniteScrollPostList from './InfiniteScrollPostList';
import { mockConcertDetails } from "../data/mockData";
import ChatWidget from "../components/modal/ChatWidget";
import { useAuth } from "../context/AuthContext";

const ConcertDetailPage = () => {
    const { id: concertId } = useParams();
    const { isLoggedIn } = useAuth();
    const TABS = ["아티스트", "일정/가격", "자유게시판", "동행 게시판", "후기"];
    const [activeTab, setActiveTab] = useState(TABS[0]);

    const [concert, setConcert] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isHearted, setIsHearted] = useState(false);
    const [isHeartLoading, setIsHeartLoading] = useState(false);

    const handleToggleBookmark = async () => {
        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            return;
        }

        setIsHeartLoading(true);
        setTimeout(() => {
            setIsHearted(!isHearted);
            setIsHeartLoading(false);
        }, 300);
    };

    useEffect(() => {
        const fetchConcertDetail = async () => {
            if (!concertId || isNaN(concertId)) {
                setLoading(false);
                return;
            }

            setLoading(true);

            setTimeout(() => {
                const concertData = mockConcertDetails[concertId];
                setConcert(concertData || null);
                setLoading(false);
            }, 500);
        };

        fetchConcertDetail();
    }, [concertId, isLoggedIn]); 

    const renderArtistContent = () => {
        if (!concert.artists || concert.artists.length === 0) {
            return <div className="p-6 text-gray-500">등록된 아티스트 정보가 없습니다.</div>;
        }
        
        return (
            <div className="p-6 bg-white border border-t-0 rounded-b-xl shadow-lg">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">참여 아티스트</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {concert.artists.map((artist) => (
                         <Link 
                            key={artist.artistId} 
                            to={`/artists/${artist.artistId}`} 
                            className="flex flex-col items-center text-center group transition-transform duration-200 hover:scale-105 hover:shadow-lg rounded-xl p-2"
                        >
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-300 group-hover:border-indigo-500 shadow-md mb-2">
                                <img
                                    src={artist.artistImageUrl || "https://placehold.co/80x80/eeeeee/cccccc?text=NO+IMG"}
                                    alt={artist.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/80x80/eeeeee/cccccc?text=NO+IMG" }}
                                />
                            </div>
                            <span className="font-semibold text-gray-800 text-base group-hover:text-indigo-600">{artist.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        );
    }
    
    // 💡 일정/가격 정보 렌더링 함수
    const renderScheduleAndPriceContent = () => {
        const hasSchedules = concert.schedules && concert.schedules.length > 0;
        const hasPrices = concert.seatPrices && Object.keys(concert.seatPrices).length > 0;

        return (
            <div className="p-6 bg-white border border-t-0 rounded-b-xl shadow-lg space-y-8">
                {/* 일정 정보 */}
                <div className="border-b pb-4">
                    <h3 className="text-2xl font-bold mb-4 text-indigo-700">🗓️ 전체 공연 일정</h3>
                    {!hasSchedules ? (
                        <p className="text-gray-500">등록된 공연 일정이 없습니다.</p>
                    ) : (
                        <ul className="space-y-2 text-lg text-gray-800">
                            {concert.schedules.map((schedule, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <span className="font-bold text-gray-600">날짜:</span> 
                                    {schedule.liveDate ? 
                                        schedule.liveDate : '날짜 미정'}
                                    <span className="font-bold text-gray-600">/ 시간:</span> 
                                    {schedule.liveTime ? 
                                        schedule.liveTime : '시간 미정'}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* 가격 정보 */}
                <div>
                    <h3 className="text-2xl font-bold mb-4 text-indigo-700">💰 가격 정보</h3>
                    {!hasPrices ? (
                        <p className="text-gray-500">등록된 좌석 가격 정보가 없습니다.</p>
                    ) : (
                         <ul className="space-y-1 text-lg">
                            {Object.entries(concert.seatPrices).map(([seatType, price]) => (
                                <li key={seatType} className="text-gray-800 font-medium">
                                    <span className="text-gray-600">{seatType}석:</span> 
                                    <span className="font-bold text-red-600 ml-2">{price.toLocaleString()}원</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    }

    // 탭 콘텐츠 렌더링 (수정)
    const renderTabContent = () => {
        if (!concert) return null;

        let categoryParam = '';
        switch (activeTab) {
            case "자유게시판":
                categoryParam = 'free'; 
                break;
            case "동행 게시판":
                categoryParam = 'accompany';
                break;
            case "후기":
                categoryParam = 'review';
                break;
            case "아티스트":
                return renderArtistContent();
            case "일정/가격":
                return renderScheduleAndPriceContent();
            default:
                return null;
        }

        return (
            <InfiniteScrollPostList 
                category={categoryParam} 
                concertId={concertId} 
            />
        );
    };

    const TabButton = ({ name }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`flex-1 py-3 text-base md:text-lg font-semibold transition-all duration-200 
                ${activeTab === name 
                    ? "text-indigo-600 bg-white border-b-4 border-indigo-600 shadow-t" 
                    : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                }
            `}
        >
            {name}
        </button>
    );
    
    if (loading) return <div className="text-center mt-20 text-xl text-indigo-600">공연 정보를 로딩 중입니다...</div>;
    if (!concert) return <div className="text-center mt-20 text-xl text-gray-500">존재하지 않는 공연입니다.</div>;

    // 초기 일정 정보 (메인 섹션에 표시할 첫 날짜와 시간)
    const firstSchedule = concert.schedules && concert.schedules.length > 0 ? concert.schedules[0] : null;

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-8 text-gray-800">
                공연 정보
            </h1>
            
            <div className="bg-white p-6 rounded-xl shadow-2xl mb-8 flex flex-col md:flex-row gap-8">
             {/* 1. 포스터 영역 */}
                <div className="w-full md:w-1/3 flex-shrink-0">
                    <div className="relative overflow-hidden rounded-lg shadow-xl aspect-[3/4]">
                           <img
                                src={concert.posterUrl}
                                alt={`${concert.title} 포스터`}
                                className="absolute top-0 left-0 w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4">
                                {/* 💡 하트 버튼 수정 및 로직 연결 */}
                                <button 
                                    onClick={handleToggleBookmark}
                                    disabled={isHeartLoading}
                                    className={`p-3 rounded-full shadow-md transition ${
                                        isHearted 
                                            ? "bg-red-500 text-white hover:bg-red-600" 
                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                         fill={isHearted ? "currentColor" : "none"} 
                                         viewBox="0 0 24 24" 
                                         strokeWidth={1.5} 
                                         stroke="currentColor" 
                                         className={`w-6 h-6 ${isHeartLoading ? 'animate-pulse' : ''}`}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                    </svg>
                                </button>
                            </div>
                    </div>
                </div>

                {/* 2. 상세 정보 영역 */}
                <div className="w-full md:w-2/3 space-y-4">
                    <h2 className="text-4xl font-extrabold text-gray-900">{concert.title}</h2>
                    
                    <div className="text-xl font-semibold text-gray-800 border-b pb-4">
                        <p className="text-indigo-700">공연 장소: <span className="text-gray-800">{concert.venue || '정보 없음'}</span></p>
                        
                        {/* 💡 첫 번째 일정 표시 */}
                        {firstSchedule && (
                            <p className="text-indigo-700 mt-2">
                                첫 공연일: 
                                <span className="text-gray-800 ml-2">
                                    {new Date(firstSchedule.liveDate).toLocaleDateString('ko-KR')} 
                                    / {new Date(firstSchedule.liveTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </p>
                        )}
                        
                        {concert.seatPrices && Object.keys(concert.seatPrices).length > 0 && (
                             <p className="text-indigo-700 mt-2">
                                가격: 
                                <span className="text-red-600 font-bold ml-2">
                                    {Math.min(...Object.values(concert.seatPrices)).toLocaleString()}원~
                                </span>
                            </p>
                        )}
                    </div>
                    
                    <div className="py-4 border-t border-b border-gray-200">
                        <h3 className="text-xl font-bold mb-2 text-gray-800">소개글</h3>
                        <p className="text-gray-600 whitespace-pre-line">
                            {concert.description}
                        </p>
                    </div>
                    
                    <div className="pt-4">
                        <a 
                            href={concert.ticketUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block px-8 py-3 bg-red-600 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-red-700 transition duration-300 transform hover:scale-[1.02]"
                        >
                            예매 링크 (티켓 구매)
                        </a>
                    </div>
                </div>
            </div>

            {/* 2. 하단 탭 메뉴 영역 */}
            <div className="w-full">
                <nav className="flex bg-gray-100 rounded-t-xl overflow-hidden shadow-md">
                    {TABS.map(tabName => (
                        <TabButton key={tabName} name={tabName} />
                    ))}
                </nav>
                {renderTabContent()}
            </div>

            <ChatWidget roomId={concertId} liveName={concert.name} />
        </div>
    );
};

export default ConcertDetailPage;