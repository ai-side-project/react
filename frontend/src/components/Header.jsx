import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import Login from "./auth/Login";
import Navigation from "./nav/MainNav";
import "./header.css";

function Header() {
  // 전역 인증 상태
  const { user, login: authLogin, logout, loading } = useAuthStore();

  // 로컬 상태 (로그인 폼 입력값)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 로그인 처리
  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await authLogin(email, password);

    if (result?.success) {
      setEmail("");
      setPassword("");
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="site-header-v3">
      <div className="container site-header-v3__inner">
        {/* 왼쪽 영역: 브랜드 + 네비게이션 */}
        <div className="site-header-v3__left">
          <Link to="/" className="site-header-v3__brand">
            AI 주식 분석 플랫폼
          </Link>

          <Navigation />
        </div>

        {/* 오른쪽 영역: 로그인/회원가입 또는 환영문구/로그아웃 */}
        <div className="site-header-v3__right">
          <div className="site-header-v3__auth">
            <div className="site-header-v3__login-wrap">
              {!user ? (
                <>
                  <Login
                    user={user}
                    handleLogin={handleLogin}
                    loading={loading}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                  />

                  <Link to="/join" className="site-header-v3__join">
                    회원가입
                  </Link>
                </>
              ) : (
                <>
                  <span className="site-header-v3__welcome">
                    {user.nickname || user.email || "사용자"} 님 환영합니다!
                  </span>

                  <button
                    type="button"
                    className="site-header-v3__logout"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
