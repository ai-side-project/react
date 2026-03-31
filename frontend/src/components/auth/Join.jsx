import { useState } from "react"
import { useAuthStore } from "../../store/authStore" // 경로 맞게 수정
import { useNavigate } from "react-router-dom" // 가입 후 이동을 위해 추가

const Join = () => {
  //Join 내부에서 직접 상태 관리
  const [nickname, setNickname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Zustand에서 직접 join 함수와 loading 상태 가져오기
  const { join: authJoin, loading, error } = useAuthStore()
  const navigate = useNavigate()

  // 직접 회원가입 로직 처리
  const handleJoinSubmit = async (e) => {
    e.preventDefault() // 폼 제출 새로고침 방지
    const result = await authJoin(nickname, email, password)

    // 가입 성공 시 메인 화면으로 이동
    if (result?.success) {
      alert("회원가입 완료!")
      navigate("/")
    }
  }

  return (
    <div className="join-page-container">
      <h2>회원가입</h2>
      <form onSubmit={handleJoinSubmit} className="auth-form">
        <input
          type="text"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <input
          className="nickInput"
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "회원 가입 중..." : "가입하기"}
        </button>
      </form>
      {/* 에러가 있으면 화면에 표시 */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  )
}

export default Join
