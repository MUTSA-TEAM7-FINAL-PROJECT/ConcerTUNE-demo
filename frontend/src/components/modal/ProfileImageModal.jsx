// ProfileImageModal.jsx
import React from "react";
import { FaTimes } from "react-icons/fa";

const ProfileImageModal = ({ isOpen, onClose, handleFileChange, currentImageUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-80 p-6 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>

        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">프로필 사진 변경</h3>

        {/* 현재 프로필 이미지 */}
        <div className="flex justify-center mb-4">
          <img
            src={currentImageUrl || "https://placehold.co/200x200/eeeeee/cccccc?text=Profile"}
            alt="Current Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-indigo-200"
          />
        </div>

        {/* 파일 입력 */}
        <div className="flex justify-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0 file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100
                      cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileImageModal;
