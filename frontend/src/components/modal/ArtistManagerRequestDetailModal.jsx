import React, { useState } from 'react';

// 컴포넌트 이름 그대로 유지
const ArtistManagerRequestDetailModal = ({ request, statusMap, onClose, onStatusUpdate, isAdmin = false }) => {
    // ⚠️ request가 null이면 렌더링하지 않음
    if (!request) return null;

    // --- [새로운 상태 관리: 반려 사유 입력] ---
    const [showRejectInput, setShowRejectInput] = useState(false);
    // localAdminNote 상태 유지 (DTO의 adminNote 필드에 저장될 내용)
    const [localAdminNote, setLocalAdminNote] = useState(''); 
    // ---------------------------------------------

    const currentStatus = request.status;
    const isPending = currentStatus === 'PENDING';
    const isRejected = currentStatus === 'REJECTED';

    // JSON/Map 데이터를 보기 좋게 렌더링하는 헬퍼 함수
    const renderDataBlock = (title, data) => {
        const isEmpty = !data || 
                         (Array.isArray(data) && data.length === 0) || 
                         (typeof data === 'object' && Object.keys(data).length === 0);

        if (isEmpty) {
            return (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    {title} 정보 없음
                </div>
            );
        }

        const formattedData = JSON.stringify(data, null, 2);

        return (
            <div className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-48 font-mono whitespace-pre-wrap">
                {formattedData}
            </div>
        );
    };
    
    // 키-값 쌍을 깔끔하게 렌더링하는 컴포넌트
    const DetailItem = ({ label, value }) => (
        <div className="flex justify-between border-b border-gray-200 py-2">
            <span className="text-gray-500 font-medium">{label}</span>
            <span className="text-gray-900 text-right max-w-[60%] truncate">
                {value || 'N/A'}
            </span>
        </div>
    );
    
    // --- [수정된 핸들러] ---
    const handleUpdate = (newStatus) => {
        // 입력창 상태 초기화
        if (showRejectInput) {
            setShowRejectInput(false);
            setLocalAdminNote('');
        }
        
        if (newStatus === 'APPROVED') {
            // 승인 시, adminNote는 '승인 완료' 등으로 기본값 설정
            const defaultNote = "요청이 관리자에 의해 승인되었습니다.";
            // request.requestId 사용
            onStatusUpdate(request.requestId, newStatus, defaultNote); 
        } else if (newStatus === 'REJECTED') {
            // 반려 시 입력창 표시
            setShowRejectInput(true);
        }
    };
    
    // --- [반려 확정 핸들러] ---
    const handleRejectConfirmation = () => {
        if (!localAdminNote.trim()) {
            console.warn("반려 사유를 입력해주세요.");
            return;
        }

        // 반려 확정 시, 사유(adminNote)와 함께 상위 컴포넌트의 onStatusUpdate 호출
        onStatusUpdate(request.requestId, 'REJECTED', localAdminNote.trim());
        setShowRejectInput(false);
        setLocalAdminNote('');
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
            <div className="relative p-6 border w-full md:w-3/5 lg:w-2/5 shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto transition-all duration-300 transform scale-100">
                
                {/* 모달 헤더 */}
                <div className="flex justify-between items-start pb-4 border-b border-gray-100 mb-4">
                    <h3 className="text-2xl font-extrabold text-gray-900">
                        {/* DTO 필드: artistName */}
                        {request.artistName}
                        {/* 요청 ID는 표시하지 않음 (요청에 따라 제거) */}
                        <span className="block text-sm font-normal text-gray-400 mt-1">요청 상태 상세</span>
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 text-3xl leading-none font-semibold transition-colors"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                <div className="space-y-6">
                    {/* 요청 기본 정보 섹션 */}
                    <div className="p-4 bg-indigo-50 rounded-lg shadow-inner">
                        <h4 className="text-lg font-bold text-indigo-700 mb-3">요청 및 상태</h4>
                        {/* DTO 필드: username */}
                        <DetailItem label="요청자 (닉네임)" value={request.username} /> 
                        {/* DTO 필드: userId */}
                        {/* DTO 필드: artistName */}
                        <DetailItem label="요청 아티스트 이름" value={request.artistName} />
                        <DetailItem 
                            label="요청 구분" 
                            // DTO 필드: isOfficial
                            value={request.isOfficial ? '공식 관리자 요청' : '일반 관리자 요청'}
                        />
                        <DetailItem 
                            label="상태" 
                            // DTO 필드: status
                            value={
                                <span className={`font-bold ${
                                    isPending ? 'text-yellow-600' : 
                                    currentStatus === 'APPROVED' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {statusMap[currentStatus]}
                                </span>
                            } 
                        />
                        {/* DTO 필드: requestedAt */}
                        <DetailItem label="요청일" value={new Date(request.requestedAt).toLocaleString()} />
                        
                        {/* DTO 필드: adminNote (관리자 처리 메모) */}
                        {request.adminNote && (
                            <div className={`mt-3 p-3 border-l-4 rounded ${
                                currentStatus === 'APPROVED' ? 'bg-green-100 border-green-500' : 
                                'bg-red-100 border-red-500'
                            }`}>
                                <strong className={`block ${
                                    currentStatus === 'APPROVED' ? 'text-green-700' : 'text-red-700'
                                }`}>
                                    관리자 처리 메모 ({currentStatus === 'APPROVED' ? '승인 메모' : '반려 사유'}):
                                </strong> 
                                <span className="whitespace-pre-wrap">{request.adminNote}</span>
                            </div>
                        )}
                    </div>

                    {/* DTO 필드: reason (요청자가 제출한 메모/사유) */}
                    <div className="space-y-4">
                        <h4 className="text-xl font-bold border-b pb-2 text-gray-800">요청 상세 메모</h4>
                        <p className="text-md text-gray-700 mb-4">
                            <strong className="block text-gray-600 mb-1">요청 메시지 :</strong> 
                            {/* DTO 필드: reason */}
                            <span className="whitespace-pre-wrap">{request.reason || '요청 메시지 없음'}</span>
                        </p>
                    </div>

                    {/* DTO에 additionalData 필드가 없지만, 이전 코드 구조 유지를 위해 임시적으로 남김. 
                        실제 백엔드 DTO에 이 필드가 있다면 그대로 사용하거나, 없다면 이 섹션을 제거해야 합니다. */}
                    {request.additionalData && (
                        <div className="py-4 border-t border-gray-200">
                            <h4 className="text-lg font-semibold mb-2 text-gray-800">추가 데이터 (JSON)</h4>
                            {renderDataBlock("추가 데이터", request.additionalData)}
                        </div>
                    )}
                </div>
                
                {/* --- [반려 사유 입력 섹션] --- */}
                {isAdmin && showRejectInput && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-bold text-red-700 mb-2">🚨 요청 반려 사유 입력</h4>
                        <textarea
                            className="w-full p-2 border border-red-300 rounded-lg text-sm focus:ring-red-500 focus:border-red-500"
                            rows="3"
                            placeholder="요청이 반려된 구체적인 사유를 입력하세요. (필수)"
                            value={localAdminNote}
                            onChange={(e) => setLocalAdminNote(e.target.value)}
                        />
                        <div className="flex justify-end space-x-3 mt-3">
                             <button
                                  onClick={() => {
                                      setShowRejectInput(false);
                                      setLocalAdminNote(''); 
                                   }}
                                  className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-400 transition"
                             >
                                 취소
                             </button>
                             <button
                                  onClick={handleRejectConfirmation}
                                  className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition shadow-md"
                             >
                                 반려 확정
                             </button>
                        </div>
                    </div>
                )}


                {/* 모달 푸터 / 관리 버튼 */}
                <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    {isAdmin && (
                        <>
                            {isPending && !showRejectInput && (
                                <>
                                    <button
                                        onClick={() => handleUpdate('APPROVED')}
                                        className="px-5 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition shadow-md"
                                    >
                                        요청 승인
                                    </button>
                                    <button
                                        onClick={() => handleUpdate('REJECTED')}
                                        className="px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition shadow-md"
                                    >
                                        요청 반려
                                    </button>
                                </>
                            )}
                            {!isPending && !showRejectInput && (
                                <span className="text-sm text-gray-500 self-center italic">이미 처리된 요청입니다.</span>
                            )}
                        </>
                    )}
                    
                    {/* 닫기 버튼은 항상 표시 */}
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300 transition"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArtistManagerRequestDetailModal;