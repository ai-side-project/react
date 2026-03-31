import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import Login from "./auth/Login";
import Join from "./auth/Join";
import Navigation from "./nav/MainNav";

function Header() {
  const {
    user,
    login: authLogin,
    join: authJoin,
    logout,
    loading,
    error,
  } = useAuthStore();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLogin, setShowLogin] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await authLogin(email, password);

    if (result?.success) {
      setNickname("");
      setEmail("");
      setPassword("");
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    const result = await authJoin(nickname, email, password);

    if (result?.success) {
      setNickname("");
      setEmail("");
      setPassword("");
      setShowLogin(true);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <div className="site-brand-wrap">
          <div className="site-brand-text">AI 주식 분석 플랫폼</div>
        </div>

        <Navigation />

        <div className="site-auth-area">
          {user ? (
            <Login
              user={user}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
              loading={loading}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
            />
          ) : showLogin ? (
            <div className="site-auth-box">
              <Login
                user={user}
                handleLogin={handleLogin}
                handleLogout={handleLogout}
                loading={loading}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
              />
              <button
                type="button"
                className="auth-toggle-btn"
                onClick={() => setShowLogin(false)}
              >
                회원가입
              </button>
            </div>
          ) : (
            <div className="site-auth-box">
              <Join
                handleJoin={handleJoin}
                loading={loading}
                nickname={nickname}
                setNickname={setNickname}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
              />
              <button
                type="button"
                className="auth-toggle-btn"
                onClick={() => setShowLogin(true)}
              >
                로그인
              </button>
            </div>
          )}

          {error && <p className="login-error">{error}</p>}
        </div>
      </div>
    </header>
  );
}

export default Header;
