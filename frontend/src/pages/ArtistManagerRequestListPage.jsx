import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import artistManagerRequestService from '../services/artistManagerRequestService'; 
import ArtistManagerRequestDetailModal from '../components/modal/ArtistManagerRequestDetailModal'; 

const PAGE_SIZE = 10; 

// 컴포넌트 이름도 도메인에 맞게 변경
const ArtistManagerRequestListPage = () => {
    // NOTE: user 객체 구조가 { id, role, username } 형태라고 가정합니다.
    const { user: currentUser, isLoggedIn, isLoading: isAuthLoading } = useAuth(); 
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0); 
    const [totalPages, setTotalPages] = useState(0);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null); 
    
    const isAdmin = currentUser?.role === 'ADMIN';
    const isAuthorized = currentUser; 
    
    const statusMap = {
        PENDING: '대기 중 🟡',
        APPROVED: '승인 완료 🟢',
        REJECTED: '반려됨 🔴',
    };
    
    const STATUS_FIELD = 'status'; 
    const REQUESTED_AT_FIELD = 'requestedAt'; 
    const IS_OFFICIAL_FIELD = 'official'; 

    const fetchRequests = useCallback(async () => {
        if (!isAuthorized) return; 

        setLoading(true);
        setError(null);

        try {
            const pageableParams = { 
                page: currentPage, 
                size: PAGE_SIZE, 
                // 백엔드 요청 필드명에 맞게 sort key 변경: requestCreatedAt -> requestedAt
                sort: `createdAt,desc` 
            };
            
            let pageData;

            // 💡 서비스 함수 호출 변경
            if (isAdmin) {
      
                pageData = await artistManagerRequestService.getAllManagerRequestsForAdmin(pageableParams);
            } else {
                // 사용자용 내 요청 목록 조회
                pageData = await artistManagerRequestService.getMyManagerRequests(pageableParams);
            }
            console.log(pageData)
            setRequests(pageData.content || []);
            setTotalPages(pageData.totalPages || 0); 
            setCurrentPage(pageData.number || 0); 
            
        } catch (err) {
            setError('요청 목록을 불러오는 데 실패했습니다.');
            console.error("Failed to fetch requests:", err);
        } finally {
            setLoading(false);
        }
    }, [isAdmin, isAuthorized, currentPage]);

    // 💡 페이지 변경 핸들러
    const handlePageChange = (pageIndex) => {
        if (pageIndex >= 0 && pageIndex < totalPages) {
            setCurrentPage(pageIndex);
        }
    };

    const handleOpenModal = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    // 💡 상태 업데이트 핸들러 (관리자 전용)
    const handleStatusUpdate = async (requestId, newStatus, adminNote) => { 
        if (!isAdmin) return; 

        try {
            // 💡 서비스 함수 호출 (백엔드 로직에 맞게)
            await artistManagerRequestService.respondToManagerRequest(requestId, newStatus, adminNote);
            
            // UI를 즉시 업데이트
            setRequests(prev => prev.map(req => 
                req.requestId === requestId ? { 
                    ...req, 
                    // 상태 필드명 사용
                    [STATUS_FIELD]: newStatus,
                    adminNote: newStatus === 'REJECTED' ? adminNote : req.adminNote 
                } : req
            ));
            
            setIsModalOpen(false);
            setSelectedRequest(null);
            console.log(`상태가 ${newStatus === 'APPROVED' ? '승인' : '반려'} 처리되었습니다.`); 
            fetchRequests(); // 최신 데이터 갱신
            
        } catch (err) {
            console.error('상태 업데이트에 실패했습니다.', err);
            // alert('상태 업데이트에 실패했습니다.'); 
        }
    };

    // 💡 권한 검사 및 데이터 로딩 로직
    useEffect(() => {
        if (isAuthLoading) {
            return; 
        }

        if (!isLoggedIn) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        
        // currentPage가 변경될 때마다 fetchRequests 호출
        fetchRequests();

    }, [isAuthLoading, isLoggedIn, navigate, fetchRequests]); 


    const pageTitle = isAdmin ? '관리자 요청 현황' : '나의 아티스트 관리 요청 현황';
    // 💡 칼럼 헤더 변경
    const requesterColumnHeader = isAdmin ? '요청자 (유저 ID / 이름)' : '요청 아티스트'; 

    if (isAuthLoading) return <div className="text-center mt-10 text-indigo-600">인증 정보를 확인 중입니다...</div>;
    if (!isAuthorized) return null; 
    if (loading) return <div className="text-center mt-10">요청 목록을 불러오는 중...</div>;
    if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-indigo-700">{pageTitle} ({requests.length}건)</h1>

            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            {/* 아티스트 이름은 항상 표시 */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">아티스트 이름</th>
                            {/* 역할에 따라 헤더 변경 */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{requesterColumnHeader}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">공식 여부</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">요청일</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((request) => (
                            <tr 
                                key={request.requestId} 
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleOpenModal(request)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.requestId}</td>
                                
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">
                                    {request.artistName} 
                                </td>
                                
                                {/* 💡 수정된 부분: 역할에 따라 다른 필드 표시 */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {isAdmin ? `${request.username} (${request.userId})` : request.artistName} 
                                </td> 
                                
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        // 응답 필드인 official 사용
                                        request[IS_OFFICIAL_FIELD] ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {request[IS_OFFICIAL_FIELD] ? '공식 요청' : '일반 요청'}
                                    </span>
                                </td>
                                
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        // 응답 필드인 status 사용
                                        request[STATUS_FIELD] === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                        request[STATUS_FIELD] === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {/* status 필드 사용 */}
                                        {statusMap[request[STATUS_FIELD]] || request[STATUS_FIELD]}
                                    </span>
                                </td>
                                {/* requestedAt 필드 사용 및 날짜 형식 지정 */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(request[REQUESTED_AT_FIELD]).toLocaleDateString('ko-KR', {
                                        year: '2-digit',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {requests.length === 0 && !loading && (
                <p className="text-center text-gray-500 mt-8">{isAdmin ? '현재 아티스트 관리 요청이 없습니다.' : '신청하신 아티스트 관리 요청 내역이 없습니다.'}</p>
            )}

            {/* 페이지네이션 (기존 로직 유지) */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="px-3 py-1 text-sm font-medium border rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >이전</button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handlePageChange(index)}
                            className={`px-3 py-1 text-sm font-medium rounded-md ${
                                currentPage === index ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                            }`}
                        >{index + 1}</button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="px-3 py-1 text-sm font-medium border rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >다음</button>
                </div>
            )}

            {/* 💡 상세 모달 렌더링: 이름 변경된 모달 사용 */}
            {isModalOpen && selectedRequest && (
                <ArtistManagerRequestDetailModal 
                    request={selectedRequest}
                    statusMap={statusMap}
                    onClose={() => setIsModalOpen(false)}
                    // 상태 업데이트 로직이 adminNote를 사용하도록 변경했으므로, props 전달 시에도 주의가 필요
                    onStatusUpdate={isAdmin ? handleStatusUpdate : undefined}
                    isAdmin={isAdmin} 
                />
            )}
        </div>
    );
};

export default ArtistManagerRequestListPage;