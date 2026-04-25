/* eslint-disable no-unused-vars */
import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./store/authStore"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Chatbot from "./components/Chatbot"
import DashBoard from "./pages/DashBoard"
import Board from "./pages/Board"
import Intro from "./pages/Intro"
import Home from "./pages/Home"
import Review from "./pages/Review"
import Admin from "./pages/Admin"
import Loading from "./components/Loading"
import Join from "./components/auth/Join"
import Detail from "./pages/Board/detail"

// 1. 스타일드 컴포넌트 및 전역 스타일 임포트
import GlobalStyle from "./styles/Globalstyle"
import { AppWrapper, MainContent } from "./styles/Layout.styles"
import styled from "styled-components"

// 2. 로딩 화면 전용 스타일 (임시 인라인 대신 사용)
const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  opacity: 0.2; /* 기존 opcity 오타 수정 */
`

function App() {
  const { user, isChecking, checkAuth, isadmin } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  if (isChecking) {
    return (
      <LoadingWrapper>
        <GlobalStyle /> {/* 로딩 중에도 전역 배경색 등을 유지하기 위해 추가 */}
        <Loading />
      </LoadingWrapper>
    )
  }

  return (
    <AppWrapper>
      {/* 3. 전역 스타일 적용 */}
      <GlobalStyle />

      <Header />

      {/* 4. 기존 <main>을 스타일이 적용된 MainContent로 변경 */}
      <MainContent>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/join" element={<Join />} />
          <Route path="/dash" element={<DashBoard />} />
          <Route path="/board" element={<Board />} />
          <Route path="/home" element={<Home />} />
          <Route path="/review" element={<Review />} />
          <Route path="/board/:id" element={<Detail />} />
          <Route
            path="/admin"
            element={user?.isadmin ? <Admin /> : <Navigate to="/" replace />}
          />
        </Routes>
      </MainContent>
      <Chatbot />
      <Footer />
    </AppWrapper>
  )
}

export default App
