// src/components/modals/ProfileEditModal.jsx

import React, { useState, useEffect } from 'react';
import { FaTimes, FaPencilAlt, FaSave } from 'react-icons/fa';

// 전체 장르 목록
const ALL_GENRE_NAMES = [
    "팝", "록", "힙합", "알앤비", "재즈", "클래식", 
    "일렉트로닉", "포크", "컨트리", "블루스", "케이팝", 
    "인디", "발라드", "메탈", "레게", "앰비언트", 
    "하우스", "테크노", "트랜스", "가스펠", "OST/사운드트랙", 
    "오페라", "트로트", "댄스", "펑크", "어쿠스틱", 
    "소울", "디스코", "퓨전", "월드 뮤직"
];

// allGenres 배열 자동 생성
const allGenres = ALL_GENRE_NAMES.map((name, index) => ({
    id: index + 1, 
    name: name.toUpperCase(), // 대문자로 통일
}));

const ProfileEditModal = ({ isOpen, onClose, initialData, onSave }) => {
    if (!isOpen || !initialData) return null;

    const [username, setUsername] = useState(initialData.username || '');
    const [bio, setBio] = useState(initialData.bio || '');
    const [selectedGenres, setSelectedGenres] = useState(initialData.genrePreferences || []);
    
    useEffect(() => {
        setUsername(initialData.username || '');
        setBio(initialData.bio || '');
        setSelectedGenres(initialData.genrePreferences || []);
    }, [initialData, isOpen]);

    const handleGenreToggle = (genre) => {
        const isSelected = selectedGenres.some(g => g.genreId === genre.id);
        if (isSelected) {
            // 제거
            setSelectedGenres(selectedGenres.filter(g => g.genreId !== genre.id));
        } else if (selectedGenres.length < 5) {
            // 추가 (최대 5개)
            setSelectedGenres([...selectedGenres, { genreId: genre.id, genreName: genre.name, type: '선호' }]);
        } else {
            alert("장르 선호도는 최대 5개까지 선택할 수 있습니다.");
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const updatedData = {
            username,
            bio,
            genrePreferences: selectedGenres,
        };
        
        onSave(updatedData); 
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 my-8 transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 모달 헤더 */}
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                        <FaPencilAlt className="mr-2 text-indigo-600"/> 프로필 정보 수정
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-900 transition text-xl p-1"
                        aria-label="모달 닫기"
                    >
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 1. 사용자 이름 */}
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                            사용자 이름
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            required
                            maxLength={20}
                        />
                    </div>
                    
                    {/* 2. 소개 (Bio) */}
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                            소개 (Bio)
                        </label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            maxLength={100}
                        />
                        <p className="text-xs text-gray-500 text-right mt-1">
                            {bio.length} / 100자
                        </p>
                    </div>

                    {/* 3. 장르 선호도 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
                            선호 장르 선택 (최대 5개)
                            <span className="text-xs font-semibold text-indigo-600">
                                {selectedGenres.length} / 5
                            </span>
                        </label>
                        <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-gray-50">
                            {allGenres.map(genre => {
                                const isSelected = selectedGenres.some(g => g.genreId === genre.id);
                                return (
                                    <button
                                        key={genre.id}
                                        type="button"
                                        onClick={() => handleGenreToggle(genre)}
                                        className={`px-3 py-1 text-sm rounded-full transition duration-150 ${
                                            isSelected
                                                ? 'bg-indigo-600 text-white font-bold shadow-md'
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                                        }`}
                                    >
                                        #{genre.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* 저장 버튼 */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition duration-200 flex items-center justify-center shadow-lg"
                        >
                            <FaSave className="mr-2"/> 변경 사항 저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileEditModal;
