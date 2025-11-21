import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageGalleryModal from '../modal/ImageGalleryModal'; // 경로 맞춰서 import
import { FiMessageSquare, FiHeart, FiEye } from "react-icons/fi";


const PostCardItem = ({ post }) => {
    const [isGalleryOpen, setGalleryOpen] = useState(false);
    const [initialIndex, setInitialIndex] = useState(0);
    const navigate = useNavigate();

    const images = post.images || [];
    const previewContent = post.content ? post.content.substring(0, 100) + (post.content.length > 100 ? '...' : '') : '내용 없음';

    const openGallery = (index, e) => {
        e.stopPropagation(); // ✅ 카드 클릭 이벤트 막기
        setInitialIndex(index);
        setGalleryOpen(true);
    };

    const goToDetail = () => {
        navigate(`/post/${post.id}`);
    };

    return (
        <div
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 flex flex-col cursor-pointer"
            onClick={goToDetail} // 카드 클릭 시 상세 페이지 이동
        >
            {/* 사진 섹션 */}
            {images.length > 0 && (
                <div className="p-2 border-b border-gray-200">
                    <div className="flex space-x-1 overflow-x-auto">
                        {images.slice(0, 4).map((imgUrl, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden relative cursor-pointer"
                                onClick={(e) => openGallery(index, e)} // 사진 클릭 시 모달 열기 + 이벤트 버블링 막기
                            >
                                <img
                                    src={imgUrl}
                                    alt={`게시글 이미지 ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                {index === 3 && images.length > 4 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-xs font-bold">
                                        +{images.length - 4}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 내용 섹션 */}
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">{previewContent}</p>
            </div>

            <div className="px-4 pb-4 flex items-center justify-between text-xs text-gray-500">

                {/* 왼쪽: 댓글 + 좋아요 */}
                <div className="flex space-x-4">
                    <span className="flex items-center space-x-1">
                        <FiMessageSquare className="w-4 h-4" />
                        <span>{post.commentCount || 0}</span>
                    </span>

                    <span className="flex items-center space-x-1">
                        <FiHeart className="w-4 h-4" />
                        <span>{post.likeCount || 0}</span>
                    </span>
                </div>

                {/* 오른쪽: 조회수 */}
                <div className="flex items-center space-x-1">
                    <FiEye className="w-4 h-4" />
                    <span>{post.viewCount || 0}</span>
                </div>

            </div>


            {/* 이미지 갤러리 모달 */}
            <ImageGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setGalleryOpen(false)}
                images={images}
                initialIndex={initialIndex}
            />
        </div>
    );
};

export default PostCardItem;
