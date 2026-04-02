/* eslint-disable no-unused-vars */
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import Header from "./components/Header";
import Footer from "./components/Footer";
//import { Routes, Route } from "react-router"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashBoard from "./pages/DashBoard";
import Board from "./pages/Board";
import Detail from "./pages/Board/Detail";
import Intro from "./pages/Intro";
import Home from "./pages/Home";
import Review from "./pages/Review";
import Loading from "./components/Loading";
import Join from "./components/auth/Join";
import "./App.css";

function App() {
  const { user, isChecking, checkAuth } = useAuthStore();

  useEffect(() => {
    // 새로고침 하자마자 서버에 세션 유효성 확인
    checkAuth();
  }, []);
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
    );
  }
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/join" element={<Join />} />
          <Route path="/dash" element={<DashBoard />} />
          <Route path="/board" element={<Board />} />
          <Route path="/home" element={<Home />} />
          <Route path="/review" element={<Review />} />
          <Route path="/board/detail" element={<Detail />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
