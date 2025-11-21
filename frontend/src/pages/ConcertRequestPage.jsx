import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import artistService from '../services/artistService'; 
import fileService from '../services/fileService'; 
import concertService from '../services/concertService';

// 아티스트 객체의 기본 구조를 정의 (신규 아티스트 입력 시 사용)
const createNewArtist = (name, isDomestic) => {
    // 임시 ID는 음수로 설정하여 기존 ID와 충돌 방지
    const newId = Date.now() * -1;
    return { 
        artistId: newId, 
        artistName: name, 
        isNew: true, 
        isDomesticHint: isDomestic 
    };
};

// API 응답 구조가 Pageable 객체일 경우, content 배열만 추출합니다.
const extractArtistContent = (data) => {
    if (data && data.content) {
        return data.content;
    }
    return data || []; // content가 없으면 원본 데이터 또는 빈 배열 반환
};

const ConcertRequestPage = () => {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // 검색된 아티스트 목록 (API로부터 가져옴)
    const [artists, setArtists] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    
    // 신규 아티스트 입력 상태를 객체로 관리하여 필드 추가
    const [newArtistInput, setNewArtistInput] = useState({
        name: '',
        isDomestic: true, // 기본값: 국내
    });
    
    const [requestData, setRequestData] = useState({
        title: '',
        description: '',
        venue: '',
        ticketUrl: '',
        schedules: [{ liveDate: '', liveTime: '' }],
        selectedArtists: [], 
        seatPrices: [{ seatType: 'VIP석', price: 120000 }]
    });
    
    const [posterFile, setPosterFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [artistLoading, setArtistLoading] = useState(false); // 아티스트 검색 로딩 상태 추가
    const [error, setError] = useState(null);

    // --- 아티스트 목록을 불러오는 함수 (수정: 검색어 기반) ---
    // useCallback을 사용하여 디바운싱이나 최적화 준비
    const fetchArtists = useCallback(async (name) => {
        if (!name) {
            setArtists([]);
            return;
        }

        setArtistLoading(true);
        setError(null);
        try {
            // artistService.getArtists 함수를 사용하고, name으로 검색어를 전달합니다.
            // 페이징은 일단 첫 페이지, 10개만 가져오도록 설정
            const data = await artistService.getArtists(name, { page: 0, size: 10 });
            
            // API 응답이 Pageable 구조일 경우, content를 추출
            const extractedArtists = extractArtistContent(data);

            setArtists(extractedArtists);
        } catch (error) {
            console.error("Failed to fetch artists:", error);
            setError("아티스트 검색에 실패했습니다.");
            setArtists([]);
        } finally {
            setArtistLoading(false);
        }
    }, []);

    // --- 검색어 변경 시 API 호출 (Effect) ---
    useEffect(() => {
        // Debounce 로직이 필요하다면 여기에 추가할 수 있지만, 일단은 바로 호출
        const handler = setTimeout(() => {
            if (searchTerm.trim().length > 0) {
                fetchArtists(searchTerm.trim());
            } else {
                setArtists([]);
            }
        }, 300); // 300ms 디바운스

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, fetchArtists]);

    // --- 로그인 확인 로직 (기존 유지) ---
    useEffect(() => {
        if (!isLoggedIn) {
            alert("로그인 후 공연 요청을 할 수 있습니다.");
            navigate('/login');
        } 
        // 초기에는 아티스트 전체 목록을 가져오지 않습니다. (검색 기반으로 변경)
    }, [isLoggedIn, navigate]);

    // --- 공통 핸들러 (기존 유지) ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRequestData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setPosterFile(e.target.files[0]);
    };

    // --- 아티스트 로직 (수정: 클라이언트 필터링 제거) ---
    // API로부터 가져온 artists에서 이미 선택된 아티스트만 제외
    const filteredArtists = (artists ?? []).filter(artist =>
        !requestData.selectedArtists.some(selected => 
            selected.artistId === artist.artistId && !selected.isNew
        )
    );
    
    const handleArtistSelection = (artist) => {
        if (artist && !requestData.selectedArtists.some(a => a.artistId === artist.artistId && !a.isNew)) {
            setRequestData(prev => ({
                ...prev,
                selectedArtists: [...prev.selectedArtists, { ...artist, isNew: false, isDomesticHint: null }]
            }));
            // 선택 후 검색어와 검색 결과 초기화
            setSearchTerm(''); 
            setArtists([]);
        }
    };

    const addNewArtist = () => {
        const trimmedName = newArtistInput.name.trim();
        if (trimmedName && !requestData.selectedArtists.some(a => a.artistName === trimmedName)) {
            const newArtist = createNewArtist(trimmedName, newArtistInput.isDomestic);
            
            setRequestData(prev => ({
                ...prev,
                selectedArtists: [...prev.selectedArtists, newArtist]
            }));
            
            setNewArtistInput({ name: '', isDomestic: true });
        }
    };
    
    const removeArtist = (artistId, isNew) => {
        setRequestData(prev => ({
            ...prev,
            selectedArtists: prev.selectedArtists.filter(a => !(a.artistId === artistId && a.isNew === isNew))
        }));
    };

    // --- 기타 핸들러 (기존 유지) ---
    const handleScheduleChange = (index, field, value) => {
        const newSchedules = [...requestData.schedules];
        newSchedules[index] = { ...newSchedules[index], [field]: value };
        setRequestData(prev => ({ ...prev, schedules: newSchedules }));
    };

    const addSchedule = () => {
        setRequestData(prev => ({
            ...prev,
            schedules: [...prev.schedules, { liveDate: '', liveTime: '' }]
        }));
    };

    const removeSchedule = (index) => {
        if (requestData.schedules.length > 1) {
            setRequestData(prev => ({
                ...prev,
                schedules: prev.schedules.filter((_, i) => i !== index)
            }));
        } else {
            alert("최소한 하나의 공연 일정이 필요합니다.");
        }
    };
    
    const handlePriceChange = (index, field, value) => {
        const newSeatPrices = [...requestData.seatPrices];
        const parsedValue = field === 'price' ? (value === '' ? '' : parseInt(value)) : value;
        
        newSeatPrices[index] = { 
            ...newSeatPrices[index], 
            [field]: parsedValue
        };
        setRequestData(prev => ({ ...prev, seatPrices: newSeatPrices }));
    };

    const addSeatPrice = () => {
        setRequestData(prev => ({
            ...prev,
            seatPrices: [...prev.seatPrices, { seatType: '', price: '' }]
        }));
    };

    const removeSeatPrice = (index) => {
        setRequestData(prev => ({
            ...prev,
            seatPrices: prev.seatPrices.filter((_, i) => i !== index)
        }));
    };
    
    // --- 유효성 검사 및 제출 로직 (기존 유지) ---
    const validateForm = (data, file) => {
        const errors = [];

        if (!data.title) {
            errors.push("공연 제목은 필수 입력 사항입니다.");
        }
        if (!file) {
            errors.push("공연 포스터 이미지는 필수입니다.");
        }
        if (data.selectedArtists.length === 0) {
            errors.push("요청 대상 아티스트를 최소 1명 선택하거나 직접 입력해야 합니다.");
        }

        const validSchedules = data.schedules.filter(s => s.liveDate && s.liveTime);
        if (validSchedules.length === 0) {
            errors.push("유효한 공연 일자 및 시간을 최소 1개 입력해야 합니다.");
        }

        const pricesMap = data.seatPrices.reduce((acc, item) => {
            const price = parseInt(item.price);
            if (item.seatType && price > 0 && !isNaN(price)) {
                acc[item.seatType] = price;
            }
            return acc;
        }, {});
        
        if (Object.keys(pricesMap).length === 0) {
            errors.push("최소한 하나의 유효한 좌석 가격(0원 초과)을 입력해야 합니다.");
        }
        
        return { isValid: errors.length === 0, errors, pricesMap, validSchedules };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const { isValid, errors, pricesMap, validSchedules } = validateForm(requestData, posterFile);

        if (!isValid) {
            alert("⚠️ 유효성 검사 오류\n\n" + errors.join('\n'));
            return;
        }

        setLoading(true);
        setError(null);
        let posterImageUrl = ''; 

        try {
            posterImageUrl = await fileService.uploadFile(posterFile, 'liveRequest');

            const existingArtistIds = requestData.selectedArtists
                .filter(a => !a.isNew)
                .map(a => a.artistId);
                
            const newArtistRequests = requestData.selectedArtists
                .filter(a => a.isNew)
                .map(a => ({ 
                    name: a.artistName, 
                    isDomestic: a.isDomesticHint,
                }));

            const requestDto = {
                title: requestData.title,
                description: requestData.description,
                posterUrl: posterImageUrl, 
                ticketUrl: requestData.ticketUrl, 
                venue: requestData.venue,
                seatPrices: pricesMap, 
                schedules: validSchedules,

                existingArtistIds: existingArtistIds,
                newArtistRequests: newArtistRequests,
            };
            
            await concertService.submitLiveRequest(requestDto); 

            alert("공연 요청이 성공적으로 등록되었습니다. 아티스트/운영진의 검토를 기다려주세요.");
            navigate('/concerts');
        } catch (err) {
            console.error("Request submission failed:", err);
            setError("공연 요청 등록에 실패했습니다. 서버 오류 또는 입력 정보를 확인해주세요.");
        } finally {
            setLoading(false);
        }
    };

    if (!isLoggedIn) return null;
    if (error && !loading) return <div className="text-center mt-10 text-red-600">{error}</div>;

    return (
        <>
            <style>{`
                /* 기본 스타일 (Tailwind CSS가 아닌 추가 스타일) */
                .artist-chip:hover {
                    box-shadow: 0 0 5px rgba(100, 116, 139, 0.5); /* slate-500 equivalent shadow */
                    transform: translateY(-1px);
                    transition: all 0.2s;
                }
                .section-container {
                    animation: fadeIn 0.5s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
            <div className="w-full max-w-4xl mx-auto p-6 md:p-10 bg-white shadow-2xl rounded-xl my-10 section-container">
                <h1 className="text-4xl font-extrabold mb-8 text-indigo-800 border-b pb-3"> 신규 공연 요청 등록</h1>
                
                <form onSubmit={handleSubmit} className="space-y-10">
                    
                    {/* 1. 요청 대상 아티스트 (검색/추가 기능 강화) */}
                    <div className="p-6 border border-indigo-300 rounded-xl bg-indigo-50 relative shadow-md">
                        <label className="block text-2xl font-extrabold text-gray-800 mb-4">
                            요청 대상 아티스트 <span className="text-red-500 text-lg">*</span>
                        </label>

                        {/* 기존 아티스트 검색 필드 및 자동 완성 목록 */}
                        <div className="relative mb-6">
                            <input
                                type="text"
                                placeholder="🔍 아티스트 이름 검색 후 클릭하여 추가"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border-2 border-gray-300 rounded-lg p-3 text-gray-900 focus:border-indigo-600 focus:ring-indigo-600 transition-colors"
                            />
                            
                            {/* 검색 결과 목록 (드롭다운 스타일) */}
                            {searchTerm.trim().length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                    {artistLoading ? (
                                        <div className="p-3 text-center text-indigo-600">아티스트 검색 중...</div>
                                    ) : filteredArtists.length > 0 ? (
                                        filteredArtists.map(artist => (
                                            <div 
                                                key={artist.artistId} 
                                                className="p-3 cursor-pointer hover:bg-indigo-100 border-b last:border-b-0 text-gray-800 flex justify-between items-center transition-colors"
                                                onClick={() => handleArtistSelection(artist)}
                                            >
                                                <span className="font-semibold">{artist.artistName}</span>
                                                <span className="text-xs text-indigo-500 ml-2 py-0.5 px-2 rounded-full bg-indigo-50 border border-indigo-300">선택</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-sm text-gray-500">일치하는 기존 아티스트가 없습니다. 아래에서 직접 추가해 주세요.</div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* 신규 아티스트 직접 입력 섹션 (UI 개선) */}
                        <div className="mt-6 pt-4 border-t border-indigo-200 space-y-3">
                            <h4 className="text-lg font-semibold text-gray-700">신규 아티스트 요청</h4>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="text"
                                    placeholder="아티스트명 직접 입력"
                                    value={newArtistInput.name}
                                    onChange={(e) => setNewArtistInput(prev => ({ ...prev, name: e.target.value }))}
                                    className="flex-1 border border-gray-300 rounded-lg p-3 focus:border-purple-500 focus:ring-purple-500 transition-colors"
                                />
                                {/* 국내/해외 선택 (Radio Button으로 변경) */}
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2 text-gray-700">
                                        <input
                                            type="radio"
                                            name="isDomestic"
                                            checked={newArtistInput.isDomestic === true}
                                            onChange={() => setNewArtistInput(prev => ({ ...prev, isDomestic: true }))}
                                            className="form-radio text-purple-600 h-4 w-4"
                                        />
                                        <span>국내</span>
                                    </label>
                                    <label className="flex items-center space-x-2 text-gray-700">
                                        <input
                                            type="radio"
                                            name="isDomestic"
                                            checked={newArtistInput.isDomestic === false}
                                            onChange={() => setNewArtistInput(prev => ({ ...prev, isDomestic: false }))}
                                            className="form-radio text-purple-600 h-4 w-4"
                                        />
                                        <span>해외</span>
                                    </label>
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={addNewArtist}
                                    disabled={!newArtistInput.name.trim()}
                                    className="bg-purple-600 text-white px-5 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors whitespace-nowrap text-sm font-bold shadow-md hover:shadow-lg"
                                >
                                    + 신규 요청
                                </button>
                            </div>
                        </div>

                        {/* 선택된 아티스트 목록 (Chip 스타일 개선) */}
                        <div className="mt-6 pt-4 border-t border-indigo-200">
                            <span className="text-base font-semibold text-gray-700 w-full mb-2 block">✅ 현재 선택된 아티스트:</span>
                            <div className="flex flex-wrap gap-3">
                                {requestData.selectedArtists.length > 0 ? (
                                    requestData.selectedArtists.map((artist) => (
                                        <span 
                                            key={`${artist.artistId}-${artist.isNew ? 'new' : 'existing'}`} 
                                            className={`artist-chip flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold cursor-default ${artist.isNew ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-green-100 text-green-700 border border-green-300'}`}
                                        >
                                            {artist.artistName} 
                                            {artist.isNew && <span className="text-xs ml-1 font-normal">({artist.isDomesticHint ? '국내 신규' : '해외 신규'})</span>}
                                            <button 
                                                type="button" 
                                                onClick={() => removeArtist(artist.artistId, artist.isNew)} 
                                                className="ml-2 text-lg text-gray-500 hover:text-red-600 font-bold transition-colors"
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">아티스트를 검색하거나 직접 입력해 주세요. (필수)</p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* 2. 공연 기본 정보 */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">기본 정보 입력</h2>
                        
                        <div>
                            <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">공연 제목 <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={requestData.title}
                                onChange={handleInputChange}
                                required
                                className="w-full border border-gray-300 rounded-lg p-3 text-lg text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">공연 상세 내용</label>
                            <textarea
                                id="description"
                                name="description"
                                rows="4"
                                value={requestData.description}
                                onChange={handleInputChange}
                                className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="venue" className="block text-lg font-medium text-gray-700 mb-2">공연 장소/지역</label>
                                <input
                                    type="text"
                                    id="venue"
                                    name="venue"
                                    value={requestData.venue}
                                    onChange={handleInputChange}
                                    placeholder="예: 서울 올림픽공원, 부산 벡스코"
                                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="ticketUrl" className="block text-lg font-medium text-gray-700 mb-2">티켓 예매 링크 (선택 사항)</label>
                                <input
                                    type="url"
                                    id="ticketUrl"
                                    name="ticketUrl"
                                    value={requestData.ticketUrl}
                                    onChange={handleInputChange}
                                    placeholder="예: https://ticket.melon.com/..."
                                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* 3. 포스터 파일 입력 */}
                        <div>
                            <label htmlFor="posterFile" className="block text-lg font-medium text-gray-700 mb-2">공연 포스터 이미지 <span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                id="posterFile"
                                name="posterFile"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                                className="w-full border border-gray-300 rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-colors"
                            />
                            {posterFile && (
                                <p className="mt-2 text-sm text-gray-600">선택된 파일: **{posterFile.name}**</p>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 4. 공연 일정 (다중 입력) */}
                    <div className="p-6 border border-indigo-300 rounded-xl bg-indigo-50">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">공연 일정 <span className="text-red-500 text-lg">*</span></h3>
                        {requestData.schedules.map((schedule, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-3 mb-3 items-center p-3 border border-indigo-200 rounded-lg bg-white">
                                <span className="text-md font-semibold text-indigo-700 sm:w-10">#{index + 1}</span>
                                <input
                                    type="date"
                                    value={schedule.liveDate}
                                    onChange={(e) => handleScheduleChange(index, 'liveDate', e.target.value)}
                                    required
                                    className="flex-1 border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <input
                                    type="time"
                                    value={schedule.liveTime}
                                    onChange={(e) => handleScheduleChange(index, 'liveTime', e.target.value)}
                                    required
                                    className="flex-1 border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                {requestData.schedules.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSchedule(index)}
                                        className="text-red-500 hover:text-red-700 text-3xl font-bold p-1 transition-colors"
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addSchedule}
                            className="mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-bold text-base shadow-md"
                        >
                            + 일정 추가
                        </button>
                    </div>

                    <hr className="border-gray-200" />

                    {/* 5. 좌석 가격 정보 (다중 입력) */}
                    <div className="p-6 border border-green-300 rounded-xl bg-green-50">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">좌석 종류 및 가격 <span className="text-red-500 text-lg">*</span></h3>
                        {requestData.seatPrices.map((priceItem, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-3 mb-3 items-center p-3 border border-green-200 rounded-lg bg-white">
                                <input
                                    type="text"
                                    placeholder="좌석 종류 (예: VIP석, R석)"
                                    value={priceItem.seatType}
                                    onChange={(e) => handlePriceChange(index, 'seatType', e.target.value)}
                                    required
                                    className="flex-1 border border-gray-300 rounded-lg p-3 text-gray-900 focus:border-green-500 focus:ring-green-500"
                                />
                                <div className='flex-1 relative'>
                                    <input
                                        type="number"
                                        placeholder="가격 (원)"
                                        value={priceItem.price}
                                        onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                                        required
                                        min="1"
                                        className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 pr-12 focus:border-green-500 focus:ring-green-500"
                                    />
                                    <span className="absolute right-0 top-0 mt-3 mr-3 text-gray-500 font-semibold">원</span>
                                </div>
                                
                                {requestData.seatPrices.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSeatPrice(index)}
                                        className="text-red-500 hover:text-red-700 text-3xl font-bold p-1 transition-colors"
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addSeatPrice}
                            className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors font-bold text-base shadow-md"
                        >
                            + 좌석 가격 추가
                        </button>
                    </div>


                    {/* 제출 버튼 */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-700 text-white font-bold py-5 rounded-xl hover:bg-indigo-800 transition-colors text-2xl disabled:bg-gray-400 shadow-2xl mt-10"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                요청 등록 중...
                            </div>
                        ) : '✅ 공연 요청 등록하기'}
                    </button>
                    
                    {error && <p className="text-red-600 text-center mt-4 font-bold text-base">{error}</p>}
                    
                </form>
            </div>
        </>
    );
};

export default ConcertRequestPage;