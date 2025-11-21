import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import artistService from "../services/artistService";
import fileService from "../services/fileService"; 
import { useAuth } from "../context/AuthContext"; 
import ScheduleCalendar from "../components/schedule/ScheduleCalendar"; 
import { FaHeart, FaRegHeart, FaCheckCircle, FaInstagram, FaTwitter, FaYoutube, FaGlobe, FaLink } from 'react-icons/fa';
import ArtistEditModal from "../components/modal/ArtistEditModal";
import ProfileImageModal from "../components/modal/ProfileImageModal";

const FollowIcon = ({ isFollowing }) => isFollowing 
    ? <FaHeart className="w-5 h-5 transition-colors" />
    : <FaRegHeart className="w-5 h-5 transition-colors" />;

const OfficialBadge = () => (
    <span className="ml-2 text-indigo-500" title="공식 아티스트 정보">
        <FaCheckCircle className="w-6 h-6" />
    </span>
);

const SnsLinkIcon = ({ url }) => {
    let icon, colorClass, name;
    if (url.includes('instagram.com')) { icon = <FaInstagram className="w-7 h-7" />; colorClass = "text-pink-600 hover:text-pink-700"; name = "Instagram"; }
    else if (url.includes('twitter.com') || url.includes('x.com')) { icon = <FaTwitter className="w-7 h-7" />; colorClass = "text-blue-500 hover:text-blue-600"; name = "Twitter / X"; }
    else if (url.includes('youtube.com')) { icon = <FaYoutube className="w-7 h-7" />; colorClass = "text-red-600 hover:text-red-700"; name = "YouTube"; }
    else { icon = <FaGlobe className="w-7 h-7" />; colorClass = "text-gray-600 hover:text-gray-700"; name = "Official Website"; }
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 font-medium transition-colors ${colorClass}`}>
            {icon}<span className="hidden sm:inline">{name} 바로가기</span><FaLink className="w-4 h-4"/>
        </a>
    );
};

const ArtistDetailPage = () => {
    const { artistId } = useParams(); 
    const { isLoggedIn, user: currentUser } = useAuth(); 

    const [artist, setArtist] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    const [isAdmin, setIsAdmin] = useState(false); 
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);

    const [editData, setEditData] = useState({
        artistName: '',
        artistImageUrl: '',
        snsUrl: '',
        genres: [],
    });

    const [schedules, setSchedules] = useState([]);
    const [scheduleLoading, setScheduleLoading] = useState(true);
    const [scheduleError, setScheduleError] = useState(null);

    const [infoMessage, setInfoMessage] = useState({ message: '', type: '' });
    const showMessage = (message, type = 'info') => {
        setInfoMessage({ message, type });
        setTimeout(() => setInfoMessage({ message: '', type: '' }), 3000);
    };

    useEffect(() => {
        const fetchArtistDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await artistService.getArtistById(artistId);
                setArtist(response.data);
            } catch (err) {
                setError(err.response?.data?.message || "아티스트 정보를 불러오는 데 실패했습니다.");
            } finally { setLoading(false); }
        };
        fetchArtistDetail();
    }, [artistId]);

    useEffect(() => {
        const fetchSchedules = async () => {
            if (!artistId) return;
            try {
                setScheduleLoading(true);
                const data = await artistService.getArtistSchedules(artistId);
                setSchedules(data);
            } catch (err) {
                setScheduleError(err.message || "스케줄 정보를 불러오는 데 실패했습니다.");
            } finally { setScheduleLoading(false); }
        };
        fetchSchedules();
    }, [artistId]);

    useEffect(() => {
        if (!isLoggedIn || !artist) return;
        const fetchFollowStatus = async () => {
            try {
                setIsFollowLoading(true);
                const res = await artistService.getFollowStatus(artistId);
                setIsFollowing(res.following);
            } catch { setIsFollowing(false); }
            finally { setIsFollowLoading(false); }
        };
        fetchFollowStatus();
    }, [artistId, isLoggedIn, artist]);

    useEffect(() => {
        if (!artist || !currentUser) return;
        setEditData({
            artistName: artist.artistName,
            artistImageUrl: artist.artistImageUrl,
            snsUrl: artist.snsUrl,
            genres: artist.genres || [],
        });

        const checkAdminStatus = async () => {
        try {
            const isAdmin = await artistService.checkIfAdmin(artist.managerId, currentUser.id);
            setIsAdmin(isAdmin);
        } catch (err) {
              console.error("관리자 여부 확인 실패:", err);
            setIsAdmin(false);
        }
      };

    checkAdminStatus();

    }, [artist, currentUser]);

    const handleToggleFollow = async () => {
        if (!isLoggedIn) return alert("로그인이 필요합니다.");
        try {
            setIsFollowLoading(true);
            const res = await artistService.toggleFollow(artistId);
            setIsFollowing(res.isFollowing);
            const refreshed = await artistService.getArtistById(artistId);
            setArtist(refreshed.data);
        } catch (err) { alert("팔로우 변경 실패: " + (err.message || '')); }
        finally { setIsFollowLoading(false); }
    };

    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const uploadedUrl = await fileService.uploadFile(file, "artist");
            await artistService.updateArtistImage(artistId, uploadedUrl);
            setArtist(prev => ({ ...prev, artistImageUrl: uploadedUrl }));
            setEditData(prev => ({ ...prev, artistImageUrl: uploadedUrl }));
            setImageModalOpen(false);
            showMessage("아티스트 이미지가 변경되었습니다!", "info");
        } catch (err) {
            console.error(err);
            alert("사진 업로드 실패");
        }
    };

    if (loading) return <div className="text-center mt-20 text-xl text-indigo-600">로딩 중...</div>;
    if (error) return <div className="text-center mt-20 text-xl text-red-600">{error}</div>;
    if (!artist) return <div className="text-center mt-20 text-xl text-gray-500">존재하지 않는 아티스트입니다.</div>;

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
            {infoMessage.message && (
                <div className={`p-4 mb-6 rounded-lg shadow-md font-medium ${infoMessage.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {infoMessage.message}
                </div>
            )}

            {/* 아티스트 정보 */}
            <div className="bg-white p-8 rounded-xl shadow-2xl mb-10 flex flex-col md:flex-row items-start gap-10 border-t-4 border-indigo-600">
                <div className="w-full md:w-1/3 flex-shrink-0 flex flex-col items-center p-4">
                    <div className="relative overflow-hidden rounded-full border-4 border-indigo-500 shadow-xl aspect-square w-48 h-48 md:w-56 md:h-56 mb-6">
                        <img
                            src={artist.artistImageUrl}
                            alt="artist"
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => isAdmin && setImageModalOpen(true)}
                        />
                    </div>
                    <div className="flex items-center justify-center mb-2">
                        <h2 className="text-3xl font-extrabold text-gray-900">{artist.artistName}</h2>
                        {artist.isOfficial && <OfficialBadge />}
                    </div>
                    {isLoggedIn ? (
                        <button onClick={handleToggleFollow} disabled={isFollowLoading} className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold mt-3 transition-colors duration-200
                            ${isFollowing ? "bg-red-50 text-red-600 border border-red-300 hover:bg-red-100" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                            <FollowIcon isFollowing={isFollowing}/>
                            {isFollowLoading ? "처리 중..." : (isFollowing ? "팔로우 해제" : "팔로우")}
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 px-5 py-2 text-md font-bold rounded-full border border-gray-300 text-gray-600 mt-3">
                            <FollowIcon isFollowing={false} />
                            <span>팔로우 수: {artist.followerCount?.toLocaleString()}</span>
                        </div>
                    )}
                    {isAdmin && (
                        <button onClick={() => setEditModalOpen(true)} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                            아티스트 정보 수정
                        </button>
                    )}
                </div>

                <div className="w-full md:w-2/3 space-y-4 pt-4">
                    <h3 className="text-2xl font-bold text-gray-800">아티스트 소개 및 정보</h3>
                    <div className="space-y-3">
                        <div className="font-medium text-gray-700 flex items-center">
                            <span className="w-20 font-bold text-indigo-700">장르:</span> 
                            <span>{artist.genres?.map(g => g.genreName).join(', ')}</span>
                        </div>
                        <div className="font-medium text-gray-700 flex items-center">
                            <span className="w-20 font-bold text-indigo-700">팔로워:</span> 
                            <span>{artist.followerCount?.toLocaleString()}명</span>
                        </div>
                    </div>
                    {artist.snsUrl && (
                        <div className="pt-4 border-t mt-6">
                            <h4 className="text-xl font-bold mb-3 text-gray-800">SNS</h4>
                            <SnsLinkIcon url={artist.snsUrl} />
                        </div>
                    )}
                </div>
            </div>

            {/* 캘린더 */}
            <div className="bg-white p-6 rounded-xl shadow-xl">
                <ScheduleCalendar schedules={schedules} isLoading={scheduleLoading} error={scheduleError} />
            </div>

            {/* ====== Artist Edit Modal ====== */}
            <ArtistEditModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                initialData={editData}
                onSave={async (updatedData) => {
                    try {
                        await artistService.updateArtist(artistId, updatedData);
                        const updated = await artistService.getArtistById(artistId);
                        setArtist(updated.data);
                        setEditModalOpen(false);
                        showMessage("아티스트 정보가 업데이트되었습니다!", "info");
                    } catch (err) {
                        alert("수정 실패: " + err.message);
                    }
                }}
            />

            {/* ====== Profile Image Modal ====== */}
            <ProfileImageModal
                isOpen={imageModalOpen}
                onClose={() => setImageModalOpen(false)}
                currentImageUrl={editData.artistImageUrl}
                handleFileChange={handleProfileImageChange}
            />
        </div>
    );
};

export default ArtistDetailPage;
