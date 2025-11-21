// MyPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate  } from 'react-router-dom';
import PersonalizedScheduleSection from '../components/home/PersonalizedScheduleSection';
import { useAuth } from '../context/AuthContext';
import ProfileEditModal from '../components/modal/ProfileEditModal';
import ProfileImageModal from '../components/modal/ProfileImageModal';
import myPageService from '../services/myPageService';
import fileService from '../services/fileService';
import authService from '../services/auth';
import FollowModal from '../components/modal/FollowModal';

import { 
    FaPencilAlt, FaStar, FaBookmark, FaCog, FaListAlt,
    FaChevronLeft, FaChevronRight, FaMapMarkerAlt
} from 'react-icons/fa';

// 초기 상태
const initialLoadingState = {
    username: "프로필 로딩 중...",
    role: "USER", 
    bio: "",
    profileImageUrl: "https://placehold.co/400x400/eeeeee/cccccc?text=Loading",
    genrePreferences: [],
    followersCount: 0,
    followingCount: 0,
};

const requestLinks = [
    { path: "/concerts/request-list", label: "공연 등록 요청 현황" },
    { path: "/artist-manager/requests-list", label: "아티스트 관리 요청 현황" },
];

/** 캐러셀 컴포넌트 */
const GenericCarousel = ({ data, itemsToShow = 3, vertical = false }) => {
    const navigate = useNavigate(); 
    const [currentIndex, setCurrentIndex] = useState(0);
    const maxIndex = Math.max(0, data.length - itemsToShow);

    useEffect(() => {
        if (currentIndex > maxIndex) setCurrentIndex(maxIndex);
    }, [data.length, maxIndex, currentIndex]);

    const handlePrev = () => setCurrentIndex(prev => Math.max(0, prev - 1));
    const handleNext = () => setCurrentIndex(prev => Math.min(maxIndex, prev + 1));

    if (!data || data.length === 0) 
        return <p className="text-gray-500 text-center py-4">정보가 없습니다.</p>;

    const transformValue = vertical
        ? `translateY(-${currentIndex * (100 / itemsToShow)}%)`
        : `translateX(-${currentIndex * (100 / itemsToShow)}%)`;

    return (
        <div className="relative p-2">
            <div className={`overflow-hidden rounded-lg shadow-inner ${vertical ? `h-[${itemsToShow * 70}px]` : ''}`}>
                <div
                    className={`flex ${vertical ? 'flex-col' : ''} transition-transform duration-300 ease-in-out`}
                    style={{ transform: transformValue }}
                >
                    {data.map(item => (
                        <div
                        key={item.id}
                        style={{ width: vertical ? '100%' : `${100 / itemsToShow}%` }}
                        className={`px-2 flex-shrink-0 cursor-pointer ${vertical ? 'mb-2' : ''}`}
                        onClick={() => {
                            if (item.title && item.content) {
                                navigate(`/post/${item.id}`);
                            } else if (item.title && !item.name) {
                                navigate(`/concerts/${item.id}`);
                            } else if (item.name) {
                                navigate(`/artists/${item.id}`);
                            }
                        }}
                    >
                        {item.title ? (
                            <div className={`border rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition bg-white h-full p-4`}>
                                {item.posterUrl && <img src={item.posterUrl} alt={item.title} className="w-full h-56 object-cover mb-2"/>}
                                <h5 className="font-bold text-lg">{item.title}</h5>
                                {item.description && <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>}
                                {item.venue && (
                                    <p className="text-xs text-indigo-500 mt-2 font-medium flex items-center">
                                        <FaMapMarkerAlt className="w-3 h-3 mr-1"/> {item.venue}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-2 border rounded-lg shadow hover:shadow-lg transition cursor-pointer">
                                <img src={item.profileImageUrl} alt={item.name} className="w-12 h-12 rounded-full object-cover"/>
                                <span className="font-medium text-gray-800">{item.name}</span>
                            </div>
                        )}
                    </div>
                ))}
                </div>
            </div>
            {data.length > itemsToShow && (
                <>
                    <button onClick={handlePrev} disabled={currentIndex === 0} className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white border p-2 rounded-full shadow hover:bg-indigo-600 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed z-10 ml-2">
                        <FaChevronLeft/>
                    </button>
                    <button onClick={handleNext} disabled={currentIndex >= maxIndex} className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white border p-2 rounded-full shadow hover:bg-indigo-600 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed z-10 mr-2">
                        <FaChevronRight/>
                    </button>
                </>
            )}
        </div>
    );
};

const TabContentSection = ({ title, carouselProps }) => (
    <div className="p-4">
        <h4 className="sr-only">{title} 목록</h4>
        <GenericCarousel {...carouselProps} />
    </div>
);

const MyPage = () => {
    const { userId: urlUserId } = useParams();
    const currentUserId = urlUserId ? Number(urlUserId) : null;
    const { user } = useAuth();
    const isLoggedIn = authService.isAuthenticated();
    const isOwner = currentUserId === user?.id;

    const [profileData, setProfileData] = useState({ ...initialLoadingState, id: currentUserId });
    const [tabContents, setTabContents] = useState({ bookmarkedLives: [], followedArtists: [], myPosts: [] });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('bookmarks');
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false); 

    const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
    const [followType, setFollowType] = useState("followers"); 

    /** 유저 정보 로딩 */
    const fetchUserData = async (userId) => {
        setIsLoading(true);
        try {
            const profile = await myPageService.getUserProfile(userId);
            setProfileData(profile);

            const contents = await myPageService.getUserContents(userId);
            setTabContents({
                bookmarkedLives: contents.bookmarkedLives || [],
                followedArtists: contents.followedArtists || [],
                myPosts: contents.myPosts || []
            });
            console.log("isOwner :", isOwner);
            console.log("isLogg :", isLoggedIn);

                if (!isOwner && isLoggedIn) {
                    const followStatus = await myPageService.checkFollowStatus(userId);
                    setIsFollowing(followStatus.isFollowing);
                }

        } catch (error) {
            console.error("마이페이지 데이터 로딩 실패:", error);
            setProfileData({...initialLoadingState, id: userId, username: "데이터 로드 실패"});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUserId) fetchUserData(currentUserId);
    }, [currentUserId]);

    /** 🔥 팔로우 버튼 처리 */
    const handleFollowToggle = async () => {
        try {
            const nowFollowing = await myPageService.toggleFollow(currentUserId);
            setIsFollowing(nowFollowing.isFollowing);
            console.log(nowFollowing)
            setProfileData(prev => ({
                ...prev,
                followersCount: prev.followersCount + (nowFollowing.isFollowing ? 1 : -1)
            }));
        } catch (e) {
            console.error(e);
        }
    };

    /** 프로필 수정 저장 */
    const handleProfileSave = async (updatedData) => {
        if (!currentUserId) return;
        try {
            await myPageService.updateProfile(currentUserId, updatedData);
            setProfileData(prev => ({
                ...prev,
                username: updatedData.username,
                bio: updatedData.bio,
                genrePreferences: updatedData.genrePreferences,
            }));
            setIsEditModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleProfileImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const uploadedUrl = await fileService.uploadFile(file, "profile");
            await myPageService.updateProfileImage(currentUserId, uploadedUrl);
            setProfileData(prev => ({ ...prev, profileImageUrl: uploadedUrl }));
            setIsImageModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("사진 업로드에 실패했습니다.");
        }
    };

    if (!currentUserId) return <div className="p-10 text-center text-xl text-red-500">❌ 유효한 사용자 ID가 경로에 포함되어 있지 않습니다.</div>;
    if (isLoading) return (
        <div className="container mx-auto p-8 text-center text-indigo-600">
            <FaCog className="animate-spin text-4xl mx-auto my-10"/>
            <p>프로필 정보를 불러오는 중입니다...</p>
        </div>
    );

    const tabItems = [
        { key: 'bookmarks', label: "북마크한 공연", icon: <FaBookmark />, carouselProps: { data: tabContents.bookmarkedLives, itemsToShow: 2 } },
        { key: 'artists', label: "팔로우 아티스트", icon: <FaStar />, carouselProps: { data: tabContents.followedArtists, itemsToShow: 3 } },
        { key: 'posts', label: "작성한 게시글", icon: <FaPencilAlt />, carouselProps: { data: tabContents.myPosts, itemsToShow: 10, vertical: true } },
    ];

    return (
        <div className="container mx-auto p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 프로필 섹션 */}
                <div className="col-span-1 bg-white p-8 rounded-xl shadow-lg border h-fit">
                    <div className="flex flex-col items-center mb-6">
                        <img 
                            src={profileData.profileImageUrl}
                            alt={`${profileData.username}님의 프로필 이미지`}
                            className={`w-24 h-24 rounded-full object-cover border-4 border-indigo-200 mb-3 shadow-md cursor-pointer ${isOwner ? 'hover:opacity-80 transition' : ''}`}
                            onClick={() => isOwner && setIsImageModalOpen(true)}
                        />
                        <h2 className="text-2xl font-bold text-gray-900">{profileData.username}</h2>
                        <p className="text-sm text-gray-600 mt-2 text-center max-w-xs">{profileData.bio || '자기소개가 없습니다.'}</p>
                    </div>

                    {/* 팔로우 버튼 (내 페이지 제외) */}
                    {!isOwner && user && (
                        <button
                            onClick={handleFollowToggle}
                            className={`w-full my-3 py-2 rounded-full font-semibold transition ${
                                isFollowing
                                    ? "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                        >
                            {isFollowing ? "언팔로우" : "팔로우"}
                        </button>
                    )}

                    <div className="flex justify-center space-x-6 text-center mb-6 border-t pt-4">
                        <div>
                            <p
                                className="text-xl font-bold text-gray-800 cursor-pointer"
                                onClick={() => { setFollowType("followers"); setIsFollowModalOpen(true); }}
                            >
                                {profileData.followersCount || 0}
                            </p>
                            <p className="text-xs text-gray-500">팔로워</p>
                        </div>
                        <div>
                            <p
                                className="text-xl font-bold text-gray-800 cursor-pointer"
                                onClick={() => { setFollowType("followings"); setIsFollowModalOpen(true); }}
                            >
                                {profileData.followingCount || 0}
                            </p>
                            <p className="text-xs text-gray-500">팔로잉</p>
                        </div>
                    </div>

                    <div className="w-full text-center mb-6">
                        <h4 className="text-sm font-semibold mb-2 text-gray-700">선호 장르</h4>
                        <div className="flex flex-wrap justify-center gap-2">
                            {profileData.genrePreferences?.map(genre => (
                                <span key={genre.genreId} className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                                    #{genre.genreName}
                                </span>
                            ))}
                            {profileData.genrePreferences?.length === 0 && <span className="text-sm text-gray-500">선호 장르를 설정해 주세요.</span>}
                        </div>
                    </div>

                    {isOwner && (
                        <div className='mt-2 space-y-3 w-full border-t pt-4'>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="w-full block text-center py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition text-sm font-medium"
                            >
                                <FaPencilAlt className='inline mr-2'/> 프로필 정보 수정
                            </button>

                            {requestLinks.map((link, index) => (
                                <Link key={index} to={link.path} className="w-full block text-center py-2 border border-indigo-300 rounded-full text-indigo-600 hover:bg-indigo-50 transition text-sm font-medium">
                                    <FaListAlt className="inline mr-2"/> {link.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* 맞춤 스케줄 섹션 */}
                <div className="col-span-1 lg:col-span-2">
                    <PersonalizedScheduleSection userId={currentUserId} />
                </div>

                {/* 기존 콘텐츠 탭 */}
                <div className='col-span-full mt-10'>
                    <div className="flex border-b mb-6 bg-white rounded-t-xl shadow-md overflow-x-auto">
                        {tabItems.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex-1 text-center py-3 text-lg font-medium transition duration-150 flex items-center justify-center whitespace-nowrap ${
                                    activeTab === tab.key 
                                        ? 'border-b-4 border-indigo-600 text-indigo-600 bg-gray-50' 
                                        : 'text-gray-600 hover:text-indigo-600'
                                }`}
                            >
                                {tab.icon} <span className='ml-2'>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="bg-white p-6 rounded-b-xl shadow-lg border -mt-6 pt-6">
                        <TabContentSection
                            title={tabItems.find(tab => tab.key === activeTab)?.label || ''}
                            carouselProps={tabItems.find(tab => tab.key === activeTab)?.carouselProps}
                        />
                    </div>
                </div>
            </div>

            {/* 모달 */}
            <ProfileEditModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                initialData={profileData} 
                onSave={handleProfileSave} 
            />

            <ProfileImageModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                handleFileChange={handleProfileImageChange}
                currentImageUrl={profileData.profileImageUrl}
            />

            <FollowModal
                isOpen={isFollowModalOpen}
                onClose={() => setIsFollowModalOpen(false)}
                userId={currentUserId}
                type={followType}
            />

        </div>
    );
};

export default MyPage;
