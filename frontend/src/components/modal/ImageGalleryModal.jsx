import React, { useState, useEffect } from 'react';
import { FiX, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const useScrollLock = (isLocked) => {
    useEffect(() => {
        let scrollY = 0;
        if (isLocked) {
            scrollY = window.scrollY;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.top = `-${scrollY}px`;
        }
        return () => {
            if (isLocked) {
                const scrollPosition = document.body.style.top;
                document.body.style.overflow = 'unset';
                document.body.style.position = 'unset';
                document.body.style.width = 'auto';
                document.body.style.top = '';
                window.scrollTo(0, parseInt(scrollPosition.replace('-', '')) * -1 || 0);
            }
        };
    }, [isLocked]);
};

const ImageGalleryModal = ({ isOpen, onClose, images = [], initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const totalImages = images.length;
    const hasImages = totalImages > 0;

    useScrollLock(isOpen);

    useEffect(() => {
        if (isOpen) setCurrentIndex(initialIndex);
    }, [isOpen, initialIndex]);

    const goToNext = () => {
        if (!hasImages) return;
        setCurrentIndex(prev => (prev + 1) % totalImages);
    };

    const goToPrev = () => {
        if (!hasImages) return;
        setCurrentIndex(prev => (prev - 1 + totalImages) % totalImages);
    };

    if (!isOpen) return null;

    const currentImageUrl = hasImages
        ? images[currentIndex]
        : "https://placehold.co/800x600/cccccc/000000?text=No+Image";

    return (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
            {/* 닫기 버튼 */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-700 hover:text-black transition z-50 p-2 bg-white/80 rounded-full shadow-md border border-gray-200"
                aria-label="닫기"
            >
                <FiX className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>

            {/* 모달 컨테이너 */}
            <div className="w-full h-full max-w-5xl max-h-[95vh] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                
                {/* 헤더 */}
                <header className="flex-shrink-0 flex justify-between items-center text-gray-700 p-3 sm:p-4 bg-gray-100 border-b border-gray-200">
                    <span className="text-sm sm:text-base font-semibold">사진</span>
                </header>

                {/* 이미지 영역 */}
                <div className="flex-grow min-h-0 flex items-center justify-center relative bg-gray-50">
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                        <img
                            src={currentImageUrl}
                            alt={`갤러리 이미지 ${currentIndex + 1}`}
                            onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src="https://placehold.co/800x600/eeeeee/000000?text=Image+Load+Error";
                            }}
                            className="max-h-full max-w-full object-contain transition duration-300 transform scale-100 hover:scale-[1.01]"
                        />
                    </div>

                    {/* 좌우 버튼 */}
                    <button 
                        onClick={goToPrev} 
                        className="absolute left-4 z-20 bg-white/70 text-gray-700 hover:bg-gray-200/80 transition disabled:opacity-30 disabled:cursor-not-allowed p-3 sm:p-4 rounded-full shadow-md border border-gray-300"
                        aria-label="이전 사진"
                        disabled={totalImages <= 1}
                    >
                        <FiChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
                    </button>

                    <button 
                        onClick={goToNext} 
                        className="absolute right-4 z-20 bg-white/70 text-gray-700 hover:bg-gray-200/80 transition disabled:opacity-30 disabled:cursor-not-allowed p-3 sm:p-4 rounded-full shadow-md border border-gray-300"
                        aria-label="다음 사진"
                        disabled={totalImages <= 1}
                    >
                        <FiChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
                    </button>
                </div>

                {/* 푸터 */}
                <footer className="flex-shrink-0 flex justify-between items-center text-gray-700 p-3 sm:p-4 bg-gray-50 border-t border-gray-200">
                    {hasImages && (
                        <span className="text-sm font-medium">
                            사진 {currentIndex + 1} / {totalImages}
                        </span>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default ImageGalleryModal;
