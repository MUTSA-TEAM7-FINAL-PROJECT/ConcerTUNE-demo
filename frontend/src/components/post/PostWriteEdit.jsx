import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import postService from '../../services/postService';
import fileService from '../../services/fileService'; // 파일 업로드 서비스

const getCategoryName = (param) => {
    // ... (PostList의 함수와 동일)
    switch (param) {
        case 'free': return '자유게시판';
        case 'review': return '공연 후기';
        case 'accompany': return '동행 구하기';
        default: return '커뮤니티';
    }
};

const PostWriteEdit = () => {
    const { category, postId } = useParams(); // postId가 있으면 수정 모드
    const navigate = useNavigate();
    const location = useLocation(); // 💡 쿼리 파라미터를 사용하기 위해 useLocation 사용

    const isEditMode = !!postId;
    
    const queryParams = new URLSearchParams(location.search);
    const concertId = queryParams.get('concertId');

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [currentImageUrls, setCurrentImageUrls] = useState([]); // 기존 이미지 URL
    const [newFiles, setNewFiles] = useState([]); // 새로 추가된 File 객체
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    
    // 수정 모드일 때 기존 데이터 불러오기
    useEffect(() => {
        if (!isEditMode) return;

        const loadPostData = async () => {
            try {
                const post = await postService.getPostDetail(category, postId);
                setTitle(post.title);
                setContent(post.content);
                setCurrentImageUrls(post.imageUrls || []);
            } catch (err) {
                alert(err.message || "게시글 정보를 불러오지 못했습니다.");
                navigate(`/community/${category}`, { replace: true });
            } finally {
                setInitialLoading(false);
            }
        };
        loadPostData();
    }, [isEditMode, category, postId, navigate]);

    // 파일 변경 핸들러
    const handleFileChange = (e) => {
        setNewFiles(Array.from(e.target.files));
    };

    // 기존 이미지 삭제 핸들러 (UI에서 임시 삭제)
    const handleRemoveCurrentImage = (urlToRemove) => {
        setCurrentImageUrls(prevUrls => prevUrls.filter(url => url !== urlToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            return alert('제목과 내용을 입력해 주세요.');
        }
        
        setIsSubmitting(true);

        try {
            // 1. 새로운 파일 업로드 및 URL 확보
            const uploadedUrls = await Promise.all(
                newFiles.map(file => fileService.uploadFile(file, `community/${category}`))
            );

            // 2. 최종 이미지 리스트 구성 (기존 + 새로 업로드)
            const finalImageUrls = [...currentImageUrls, ...uploadedUrls];

            // 3. 서버로 전송할 데이터 준비
            const postData = {
                title: title,
                content: content,
                imageUrls: finalImageUrls,
                fileUrls: [], // 필요하다면 여기에 파일 URL 추가
                ...(concertId && { liveId: concertId }),
            };

            let response;
            if (isEditMode) {
                // 수정 모드: PUT API 호출
                response = await postService.updatePost(postId, postData);
                alert('게시글이 성공적으로 수정되었습니다.');
            } else {
                // 작성 모드: POST API 호출
                response = await postService.createPost(category.toUpperCase(), postData);
                alert('게시글이 성공적으로 등록되었습니다.');
            }

            // 등록/수정된 게시글 상세 페이지로 이동
            navigate(`/post/${response.id}`, { replace: true });
            
        } catch (error) {
            alert(`게시글 ${isEditMode ? '수정' : '등록'} 실패: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (initialLoading) {
        return <div className="text-center py-20 text-indigo-600">게시글 정보를 불러오는 중입니다...</div>;
    }

    const pageTitle = isEditMode ? '게시글 수정' : '새 게시글 작성';

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-xl">
            <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-3">
                {pageTitle} <span className="text-indigo-600">({getCategoryName(category)})</span>
            </h2>
            
            <div className="mb-6">
                <label htmlFor="title" className="block text-gray-700 font-bold mb-2">제목</label>
                <input 
                    id="title" 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={isSubmitting}
                    placeholder="제목을 입력하세요."
                />
            </div>

            <div className="mb-6">
                <label htmlFor="content" className="block text-gray-700 font-bold mb-2">내용</label>
                <textarea 
                    id="content" 
                    rows="15" 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    disabled={isSubmitting}
                    placeholder="내용을 입력하세요."
                />
            </div>

            {/* 기존 이미지 미리보기 및 삭제 (수정 모드 전용) */}
            {isEditMode && currentImageUrls.length > 0 && (
                <div className="mb-6 border p-4 rounded-md bg-gray-50">
                    <p className="font-semibold text-gray-700 mb-2">현재 이미지 (클릭 시 삭제)</p>
                    <div className="flex flex-wrap gap-3">
                        {currentImageUrls.map((url, index) => (
                            <div key={index} className="relative w-20 h-20 group cursor-pointer" onClick={() => handleRemoveCurrentImage(url)}>
                                <img src={url} alt={`Current ${index + 1}`} className="w-full h-full object-cover rounded-md border border-gray-300" />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                    <span className="text-white text-xs font-bold">삭제</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* 새 파일 첨부 */}
            <div className="mb-8">
                <label htmlFor="new-files" className="block text-gray-700 font-bold mb-2">이미지/파일 첨부 (추가)</label>
                <input 
                    id="new-files" 
                    type="file" 
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFileChange} 
                    className="w-full text-gray-700"
                    disabled={isSubmitting}
                />
                {newFiles.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">{newFiles.length}개의 새로운 파일이 첨부되었습니다.</p>
                )}
            </div>

            <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-md hover:bg-indigo-700 transition duration-150 disabled:opacity-50"
                disabled={isSubmitting}
            >
                {isSubmitting ? '처리 중...' : pageTitle}
            </button>
        </form>
    );
};

export default PostWriteEdit;