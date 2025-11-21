import React, { useState, useEffect } from "react";
// import communityService from '../../services/communityService';
import { Link } from "react-router-dom";

const PostList = ({ category }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        // const response = await communityService.getPosts(category, { page: page, size: 20});
        setPosts(Response.data.content || []);
      } catch (err) {
        setError("게시글을 불러오는 데 실패했습니다.");
        console.error(`[${category}] 게시판 로딩 실패:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [category, page]);

  if (loading) return <div className="text-center p-4">게시글 로딩 중...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
};
return (
  <div className="w-full">
    <div className="flex justify-end mb-4">임시 PostList</div>
  </div>
);

export default PostList;
