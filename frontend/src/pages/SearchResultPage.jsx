// src/pages/SearchResultPage.jsx (수정)

import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import searchService from '../services/searchService';
import { FaMusic, FaUser, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const SearchResultPage = () => {
    const query = useQuery();
    const searchTerm = query.get('q');
    
    const [page, setPage] = useState(0); 
    const [pageSize, setPageSize] = useState(10); 

    const [pageResult, setPageResult] = useState({
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: 10,
        empty: true,
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!searchTerm) {
            setPageResult({ content: [], totalPages: 0, totalElements: 0, number: 0, size: 10, empty: true });
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await searchService.searchAll(searchTerm, page, pageSize);
                setPageResult(data);
            } catch (err) {
                console.error("검색 결과 로드 실패:", err);
                setError("검색 결과를 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [searchTerm, page, pageSize]);

    // 페이지 변경 핸들러 (기존과 동일)
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pageResult.totalPages) {
            setPage(newPage);
        }
    };
    
    // 페이지네이션 UI 렌더링 함수 (기존과 동일)
    const renderPagination = () => {
        const { totalPages, number: currentPage } = pageResult;
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        const startPage = Math.max(0, currentPage - 2);
        const endPage = Math.min(totalPages - 1, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex justify-center mt-8 space-x-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="p-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                    <FaChevronLeft />
                </button>
                
                {pageNumbers.map(p => (
                    <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`px-4 py-2 rounded-lg font-medium transition duration-150 ${
                            p === currentPage 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-white text-gray-700 hover:bg-indigo-50 border'
                        }`}
                    >
                        {p + 1}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className="p-2 border rounded-lg bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                    <FaChevronRight />
                </button>
            </div>
        );
    };

    // 검색 결과 카드 렌더링 함수 (기존과 동일)
    const renderResultCard = (item) => {
        const isLive = item.type === 'LIVE';
        const linkTo = isLive ? `/concerts/${item.id}` : `/artists/${item.id}`;
        
        // Tailwind CSS 클래스 구분
        const typeBadgeClass = isLive 
            ? 'bg-indigo-100 text-indigo-700' 
            : 'bg-green-100 text-green-700';
        const icon = isLive 
            ? <FaMapMarkerAlt className="text-xs" /> 
            : <FaUser className="text-xs" />;
        const defaultIcon = isLive 
            ? <FaMusic className="text-3xl text-indigo-500" /> 
            : <FaUser className="text-3xl text-gray-500" />;

        return (
            <Link 
                to={linkTo} 
                key={`${item.type}-${item.id}`} 
                className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-150 space-x-4"
            >
                {/* 이미지/아이콘 */}
                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                        defaultIcon
                    )}
                </div>

                {/* 정보 */}
                <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">{item.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center space-x-1">
                        {icon}
                        <span className="truncate">{item.subInfo}</span>
                    </p>
                </div>
            </Link>
        );
    };
    
    // 💡 LIVE와 ARTIST 결과를 분리
    const liveResults = pageResult.content.filter(item => item.type === 'LIVE');
    const artistResults = pageResult.content.filter(item => item.type === 'ARTIST');
    
    // 💡 섹션 렌더링을 위한 헬퍼 함수
    const renderSection = (title, results) => {
        if (results.length === 0) return null; // 결과가 없으면 섹션 숨김

        return (
            <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4 flex items-center">
                    <span className="ml-2">{title} ({results.length}건)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map(renderResultCard)}
                </div>
            </div>
        );
    };


    return (
        <div className="container mx-auto p-8">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                '{searchTerm}' 통합 검색 결과 
            </h2>
            <hr className="mb-8"/>

            {loading && (
                <div className="text-center py-10 text-indigo-600 font-medium">검색 중...</div>
            )}

            {error && (
                <div className="text-center py-10 text-red-500 font-medium">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <>
                    <p className="text-gray-600 mb-6">
                        총 {pageResult.totalElements}개의 결과를 찾았습니다.
                    </p>
                    
                    {pageResult.totalElements > 0 ? (
                        <>
                            {/* 💡 공연 결과 섹션 */}
                            {renderSection(
                                "공연 결과", 
                                liveResults
                            )}
                            
                            {/* 💡 아티스트 결과 섹션 */}
                            {renderSection(
                                "아티스트 결과", 
                                artistResults
                            )}
                            
                            {/* 페이지네이션 UI는 모든 섹션 아래에 한 번만 표시 */}
                            {renderPagination()}
                        </>
                    ) : (
                        <div className="bg-gray-50 p-10 rounded-lg text-center border-dashed border-2 border-gray-300">
                            <p className="text-gray-500 text-lg font-medium">
                                검색어 **'{searchTerm}'**에 해당하는 결과가 없습니다.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResultPage;