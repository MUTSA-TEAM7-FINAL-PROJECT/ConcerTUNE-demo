import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/home"; 
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthSelectPage from "./pages/AuthSelectPage";
import OAuth2Callback from "./pages/OAuth2Callback";
import ArtistDetailPage from "./pages/ArtistDetailPage";
import ConcertListPage from "./pages/ConcertListPage";
import CommunityPage from "./pages/CommunityPage";
import LiveRequestPage from "./pages/LiveRequestPage";
import PasswordResetPage from "./pages/PasswordResetPage";
import PostList from "./components/post/PostList";
import PostDetail from "./components/post/PostDetail";
import PostWriteEdit from "./components/post/PostWriteEdit";
import ConcertDetailPage from "./pages/ConcertDetailPage";
import ConcertRequestPage from "./pages/ConcertRequestPage";
import RequestListPage from "./pages/RequestListPage"; 
import ArtistManagerRequestListPage from "./pages/ArtistManagerRequestListPage";
import ArtistManagerRequestPage from "./pages/ArtistManagerRequestPage";
import SearchResultPage from "./pages/SearchResultPage";
import MyPage from "./pages/MyPage";

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/*" element={<MainLayout />}> 
          <Route path="search" element={<SearchResultPage />} />
          <Route path="user/:userId" element={<MyPage />} />
          <Route path="" element={<Home />} />
          <Route path="concerts" element={<ConcertListPage />} />
          <Route path="concerts/:id" element={<ConcertDetailPage />} />
          <Route path="concerts/request" element={<ConcertRequestPage />} />
          <Route path="artists/:artistId" element={<ArtistDetailPage />} />

          <Route path="concerts/request-list" element={<RequestListPage />} /> 
        <Route path="artist-manager/requests-list" element={<ArtistManagerRequestListPage />} />

          {/* 커뮤니티 목록 및 탭 레이아웃 */}
          <Route path="community" element={<CommunityPage />}>
                  <Route index element={<Navigate to="free" replace />} /> 
                  <Route path=":category" element={<PostList />} /> 
          </Route>

          {/* 💡 수정된 부분: 게시글 상세 경로를 post/:postId 로 변경 */}
          <Route path="post/:postId" element={<PostDetail />} /> 
          
          {/* 게시글 작성/수정 경로는 카테고리 유지가 필요함 */}
          <Route path="community/write/:category" element={<PostWriteEdit />} />
          <Route path="community/edit/:category/:postId" element={<PostWriteEdit />} />
          
          <Route path="artists/request" element={<LiveRequestPage />} />
          <Route path="artist-manager/requests" element={<ArtistManagerRequestPage />} />
        </Route>

        {/* MainLayout을 사용하지 않는 페이지 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/select" element={<AuthSelectPage />} />
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;