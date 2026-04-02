import { useState } from "react";
import { useAuthStore } from "../../store/authStore"; // 경로 맞게 수정
import { useNavigate } from "react-router-dom"; // 가입 후 이동을 위해 추가
import styled from "styled-components";

// 기존 join-page-container 역할: 화면 전체 정렬
const JoinPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh; /* 화면 꽉 차게 해서 수직 중앙 정렬 */
  background-color: #f9f9f9;
`;
const Title = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
`;
// 기존 auth-form 역할: 입력창들을 감싸는 박스
const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px; /* 너무 넓어지지 않게 고정 */
  padding: 20px;
  gap: 10px; /* 입력창 사이 간격 */
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;

  &:disabled {
    background-color: #eee;
  }
`;

const SubmitButton = styled.button`
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;

  &:hover {
    background-color: #0056b3; /* 마우스 올렸을 때 색상 변화 */
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Join = () => {
  //Join 내부에서 직접 상태 관리
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Zustand에서 직접 join 함수와 loading 상태 가져오기
  const { join: authJoin, loading, error } = useAuthStore();
  const navigate = useNavigate();

  // 직접 회원가입 로직 처리
  const handleJoinSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 새로고침 방지
    const result = await authJoin(nickname, email, password);

    // 가입 성공 시 메인 화면으로 이동
    if (result?.success) {
      alert("회원가입 완료!");
      navigate("/");
    }
  };

  return (
    <JoinPageContainer>
      <Title>회원가입</Title>

      <AuthForm onSubmit={handleJoinSubmit}>
        <Input
          type="text"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <Input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          disabled={loading}
        />

        <SubmitButton type="submit" disabled={loading}>
          {loading ? "회원 가입 중..." : "가입하기"}
        </SubmitButton>
      </AuthForm>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </JoinPageContainer>
  );
};

export default Join;
