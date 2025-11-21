import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import artistManagerRequestService from '../services/artistManagerRequestService';
import artistService from '../services/artistService';

// 검색어 입력 후 일정 시간(디바운스)을 기다려 API 호출을 최적화하는 훅 (옵션)
// 여기서는 간단하게 debounce 없이 구현했습니다.
// 실제 운영 환경에서는 useDebounce 훅 사용을 고려하는 것이 좋습니다.

const ArtistManagerRequestPage = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // 검색 결과를 저장할 상태
    const [artists, setArtists] = useState([]); 
    // 아티스트 검색어
    const [searchTerm, setSearchTerm] = useState('');
    // 검색 결과를 보여줄지 여부 (선택 완료 시 숨김)
    const [showResults, setShowResults] = useState(false);
    
    const [requestData, setRequestData] = useState({
        selectedArtist: null, // 단일 아티스트만 선택: { artistId, artistName }
        reason: '',          // 관리자 권한을 요청하는 이유/계기
        isOfficial: false,   // 공식 관계자 여부 (boolean)
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false); // 검색 로딩 상태 추가

    // 아티스트 목록을 불러오는 함수 (API 변경 반영)
    // searchTerm이 있을 때만 API를 호출하도록 변경
    const fetchArtists = useCallback(async (name) => {
        if (!name) {
            setArtists([]);
            return;
        }

        setSearchLoading(true);
        setError(null);
        try {
            // API: artistService.getArtists(name, pageable) 사용
            // 검색 결과를 즉시 보여주기 위해 size=5 또는 적절한 크기를 설정 (예: 5)
            // 페이지네이션 정보는 현재 페이지에서는 필요 없으므로, name만 넘김
            const response = await artistService.getArtists(name, { page: 0, size: 5 }); 
            // 응답이 Page 객체이므로 content 필드에서 실제 목록을 가져옴
            setArtists(response.content || []); 
        } catch (error) {
            console.error("Failed to fetch artists:", error);
            // 아티스트 목록 로드 실패 에러는 별도로 처리하지 않고 검색 결과가 없음을 표시
            setArtists([]);
        } finally {
            setSearchLoading(false);
        }
    }, []);

    // 1. 로그인 여부 확인
    useEffect(() => {
        if (!isLoggedIn) {
            alert("로그인 후 아티스트 관리자 요청을 할 수 있습니다.");
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    // 2. 검색어 변경 시 아티스트 목록 로드
    // 디바운스를 적용하여 검색 횟수를 줄이는 것을 권장합니다. (현재는 즉시 호출)
    useEffect(() => {
        if (requestData.selectedArtist) {
            setShowResults(false);
            return;
        }

        if (searchTerm.trim().length > 0) {
            fetchArtists(searchTerm.trim());
            setShowResults(true);
        } else {
            setArtists([]);
            setShowResults(false);
        }
    }, [searchTerm, fetchArtists, requestData.selectedArtist]);


    // 폼 입력값 변경 핸들러
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const inputValue = type === 'checkbox' ? checked : value; 
        setRequestData(prev => ({ ...prev, [name]: inputValue }));
    };

    // 검색어 입력 핸들러
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // 아티스트 선택 핸들러 (검색 결과 클릭 시)
    const handleArtistSelection = (artist) => {
        if (artist) {
            setRequestData(prev => ({
                ...prev,
                selectedArtist: { artistId: artist.artistId, artistName: artist.artistName }
            }));
            setSearchTerm(''); // 검색어 초기화
            setShowResults(false); // 검색 결과 숨기기
            setArtists([]); // 목록 초기화
        }
    };

    // 선택된 아티스트 제거
    const removeArtist = () => {
        setRequestData(prev => ({
            ...prev,
            selectedArtist: null
        }));
        // 아티스트 제거 시 바로 검색 필드로 포커스를 맞추거나 검색 창을 보여줄 수 있음
        setShowResults(false); 
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. 필수 유효성 검사
        if (!requestData.selectedArtist) {
            alert("요청 대상 아티스트를 반드시 선택해야 합니다.");
            return;
        }
        if (!requestData.reason.trim()) {
            alert("관리자 권한 요청 이유를 입력해야 합니다.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 2. DTO 객체 생성
            const requestDto = {
                artistId: requestData.selectedArtist.artistId,
                reason: requestData.reason,
                isOfficial: requestData.isOfficial, 
            };
            
            console.log("Sending Artist Manager Request DTO:", requestDto);

            // 3. 서비스 호출
            await artistManagerRequestService.submitManagerRequest(requestDto); 

            alert(`'${requestData.selectedArtist.artistName}' 아티스트의 관리자 요청이 성공적으로 등록되었습니다. 운영진의 검토를 기다려주세요.`);
            navigate('/artist-manager/requests-list'); 
        } catch (err) {
            console.error("Manager request submission failed:", err);
            const message = err.response?.data?.message || "관리자 요청 등록에 실패했습니다. 입력 정보를 확인해주세요.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) return null;
    // 아티스트 목록 로드 실패 에러는 현재 검색 로직에서는 표시하지 않음 (검색 결과에 반영)

    return (
        <div className="w-full max-w-xl mx-auto p-6 md:p-10 bg-white shadow-2xl rounded-xl my-10">
            <h1 className="text-3xl font-bold mb-8 text-purple-700">✍️ 아티스트 관리 권한 요청</h1>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. 요청 대상 아티스트 선택 */}
                <div className="p-4 border border-purple-200 rounded-lg bg-purple-50 relative">
                    <label className="block text-xl font-bold text-gray-800 mb-3">
                        요청 대상 아티스트 <span className="text-red-500">*</span>
                    </label>

                    {requestData.selectedArtist ? (
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 rounded-full px-4 py-2 text-md font-semibold bg-purple-100 text-purple-700">
                                {requestData.selectedArtist.artistName} (선택 완료)
                            </span>
                            <button type="button" onClick={removeArtist} className="text-red-500 hover:text-red-700 text-2xl font-bold p-1">
                                &times;
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="관리 권한을 요청할 아티스트 이름 검색..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500"
                            />
                            
                            {/* 검색 결과 목록 */}
                            {showResults && (searchTerm.length > 0) && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {searchLoading ? (
                                        <div className="p-3 text-sm text-gray-500 text-center">검색 중...</div>
                                    ) : (
                                        artists.length > 0 ? (
                                            artists.map(artist => (
                                                <div 
                                                    key={artist.artistId} 
                                                    className="p-3 cursor-pointer hover:bg-purple-50 border-b last:border-b-0 text-gray-800"
                                                    onClick={() => handleArtistSelection(artist)}
                                                >
                                                    {artist.artistName} <span className="text-xs text-purple-500 ml-2">[선택]</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 text-sm text-gray-500">
                                                일치하는 아티스트가 없습니다.
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                            {/* 검색 결과가 없을 때 API 호출 실패 메시지는 여기서 따로 표시하지 않음 */}
                        </div>
                    )}
                </div>
                
                <hr className="border-gray-200" />
                
                {/* 2. 요청 상세 정보 */}
                <div className="space-y-6">
                   <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div>
                        <label htmlFor="reason" className="block text-lg font-bold text-gray-700 mb-2">
                            관리자 권한 요청 이유 <span className="text-red-500 text-xl ml-0.5">*</span>
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            rows="5"
                            value={requestData.reason}
                            onChange={handleInputChange}
                            required
                            placeholder="아티스트 소속사, 관계자임을 증명할 수 있는 정보 및 요청 상세 이유를 입력해주세요. (증빙 자료 제출을 요청할 수 있습니다.)"
                            className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 resize-none"
                        />
                    </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isOfficial"
                                name="isOfficial"
                                checked={requestData.isOfficial}
                                onChange={handleInputChange}
                                className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                            />
                            <label htmlFor="isOfficial" className="ml-3 block text-base font-bold text-gray-800 cursor-pointer">
                                저는 해당 아티스트의 <span className="text-purple-700">공식 관계자(소속사, 매니저 등)입니다.</span>
                            </label>
                        </div>
                        
                        {/* 부가 설명: 위아래로 분리하여 명확하게 강조 */}
                        <div className="p-3 bg-white border-l-4 border-red-500 text-sm text-gray-600 shadow-sm">
                            <p className="font-semibold text-red-600">
                                🚨 공식 증빙 자료 제출 필수
                            </p>
                            <p className="mt-1">
                                해당 항목 체크 시, 운영진의 검토 과정에서 <span className="font-medium">공식적인 증빙 자료(재직 증명서 등) 제출이 반드시 필요</span>합니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 제출 버튼 */}
                <button
                    type="submit"
                    disabled={loading || !requestData.selectedArtist || !requestData.reason.trim()}
                    className="w-full bg-purple-700 text-white font-bold py-4 rounded-xl hover:bg-purple-800 transition-colors text-xl disabled:bg-gray-400"
                >
                    {loading ? '요청 등록 중...' : '✅ 관리자 권한 요청 제출하기'}
                </button>
                
                {error && <p className="text-red-500 text-center mt-4 font-medium">{error}</p>}
                
            </form>
        </div>
    );
};

export default ArtistManagerRequestPage;