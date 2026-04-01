import { useState } from "react"
import { useAuthStore } from "../store/authStore"
import { Link } from "react-router-dom" // ✨ 링크 이동을 위해 추가
import Login from "./auth/Login"
//import Join from "./auth/Join"
import Navigation from "./nav/MainNav"
// import Loading from "./Loading";

function Header() {
  // Zustand에서 상태와 액션 가져오기
  const { user, login: authLogin, logout, loading, error } = useAuthStore()

  // 로컬 상태 (폼 입력용)
  const [nickname, setNickname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // const [errMessage, setErrMessage] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault()
    const result = await authLogin(email, password)

    if (result?.success) {
      setNickname("")
      setEmail("")
      setPassword("")
      // fetchPosts();
    }
  }

  const handleLogout = () => {
    logout()
    // logoutList();
  }
  // useEffect(() => {
  //   setTimeout(() => {
  //     setErrMessage(false);
  //   }, 3000);
  // }, [error]);

  return (
    <header className="header">
      <div className="container header-content">
        <div className="header-left">
          <img className="logo" src="/assets/img/image2.png" width="200px" />
          <Navigation />
        </div>

        <div className="header-right">
          {/* 버튼들을 가로로 나란히 묶어주는 박스 추가 */}
          <div className="auth-button-group">
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
                <Link to="/join" className="authSelector">
                  회원가입
                </Link>
              </>
            ) : (
              <button onClick={handleLogout} className="btn-logout">
                로그아웃
              </button>
            )}
          </div>
          {error && <p className="login-error">{error}</p>}
        </div>
      </div>
    </header>
  )
}

export default Header
