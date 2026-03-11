/* eslint-disable no-unused-vars */
import { useEffect } from "react"
import { useAuthStore } from "./store/authStore"
import Header from "./components/Header"
import Footer from "./components/Footer"
import Home from "./components/Board"
import { Routes, Route } from "react-router"
import DashBoard from "./pages/DashBoard"
import Board from "./pages/Board"
import Album from "./pages/Album"
import Theme from "./pages/Theme"
import Review from "./pages/Review"
import Loading from "./components/Loading"
import "./App.css"

function App() {
  const { user, isChecking, checkAuth } = useAuthStore()

  useEffect(() => {
    // 새로고침 하자마자 서버에 세션 유효성 확인
    checkAuth()
  }, [])
  if (isChecking) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          opcity: 0.2,
        }}
      >
        {/* <p>로그인 상태를 확인하고 있습니다...</p> */}
        <Loading />
      </div>
    )
  }
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dash" element={<DashBoard />} />
          <Route path="/board" element={<Board />} />
          <Route path="/album" element={<Album />} />
          <Route path="/theme" element={<Theme />} />
          <Route path="/review" element={<Review />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
