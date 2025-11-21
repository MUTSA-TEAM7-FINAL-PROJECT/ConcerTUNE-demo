import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import liveRequestService from '../services/liveRequestService'; 
import ConcertRequestDetailModal from '../components/modal/ConcertRequestDetailModal'; 

const PAGE_SIZE = 10; 

const RequestListPage = () => {
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

    const fetchRequests = useCallback(async () => {
        if (!isAuthorized) return; 

        setLoading(true);
        setError(null);

        try {
            const pageableParams = { 
                page: currentPage, 
                size: PAGE_SIZE, 
                sort: 'requestCreatedAt,desc' 
            };
            
            let pageData;

            if (isAdmin) {
                pageData = await liveRequestService.getAllLiveRequestsForAdmin(pageableParams);
            } else {
                pageData = await liveRequestService.getMyLiveRequests(pageableParams);
            }
            
            setRequests(pageData.content || []);
            setTotalPages(pageData.totalPages); 
            setCurrentPage(pageData.number); 
            
        } catch (err) {
            setError('요청 목록을 불러오는 데 실패했습니다.');
            console.error("Failed to fetch requests:", err);
        } finally {
            setLoading(false);
        }
    }, [isAdmin, isAuthorized, currentPage, currentUser?.userId]); // 의존성 추가

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
    const handleStatusUpdate = async (requestId, newStatus, rejectionReason = null) => {
        if (!isAdmin) return; // 관리자가 아니면 업데이트 불가

        try {
            await liveRequestService.updateRequestStatus(requestId, newStatus, rejectionReason);
            
            setRequests(prev => prev.map(req => 
                req.requestId === requestId ? { 
                    ...req, 
                    requestStatus: newStatus,
                    rejectionReason: rejectionReason 
                } : req
            ));
            
            setIsModalOpen(false);
            setSelectedRequest(null);

            // alert 대신 console.log로 대체하거나, 실제 Toast 알림 사용 권장
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
            // 로그인되어 있지 않으면 로그인 페이지로 이동
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        
        fetchRequests();

    }, [isAuthLoading, isAuthorized, navigate, fetchRequests]); 


    const pageTitle = isAdmin ? '관리자 등록 요청 현황' : '나의 공연 신청 현황';
    const requesterColumnHeader = isAdmin ? '요청자' : '공연 희망일'; 

    if (isAuthLoading) return <div className="text-center mt-10 text-indigo-600">인증 정보를 확인 중입니다...</div>;
    if (!isAuthorized) return null; // 위에서 이미 리디렉션 처리함
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{requesterColumnHeader}</th>
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
                                    {request.title}
                                </td>
                                {/* 💡 역할에 따라 다른 필드 표시 */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {isAdmin ? request.requester : (request.liveDate || 'N/A')}
                                </td> 
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        request.requestStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                        request.requestStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {statusMap[request.requestStatus] || request.requestStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(request.requestCreatedAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {requests.length === 0 && !loading && (
                <p className="text-center text-gray-500 mt-8">{isAdmin ? '현재 대기 중인 공연 요청이 없습니다.' : '신청하신 공연 요청 내역이 없습니다.'}</p>
            )}

            {/* 페이지네이션 컨트롤 */}
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

            {/* 💡 상세 모달 렌더링: 관리자/사용자 공통 모달 사용 (관리자만 onStatusUpdate 전달) */}
            {isModalOpen && selectedRequest && (
                <ConcertRequestDetailModal 
                    request={selectedRequest}
                    statusMap={statusMap}
                    onClose={() => setIsModalOpen(false)}
                    // 관리자에게만 상태 업데이트 기능 전달
                    onStatusUpdate={isAdmin ? handleStatusUpdate : undefined}
                    isAdmin={isAdmin} 
                />
            )}
        </div>
    );
};

export default RequestListPage;