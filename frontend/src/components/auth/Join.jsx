import { useState } from "react";
import { useAuthStore } from "../../store/authStore"; // Zustand 로그인/회원가입 상태 관리
import { useNavigate } from "react-router-dom"; // 회원가입 성공 후 페이지 이동
import styled from "styled-components";

// 회원가입 페이지 전체 영역
// 기존 프로젝트 배경색과 맞추기 위해 전역 변수 --bg 사용
const JoinPageContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 72px 20px;
  background: var(--bg);
  box-sizing: border-box;
`;

// 회원가입 폼을 감싸는 카드 박스
// 다른 페이지 카드 UI와 맞추기 위해 border, shadow, radius 적용
const JoinCard = styled.div`
  width: 100%;
  max-width: 430px;
  padding: 38px 34px;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--card);
  box-shadow: var(--shadow);
  box-sizing: border-box;
`;

// 상단 브랜드/제목/설명 영역
const JoinHeader = styled.div`
  text-align: center;
  margin-bottom: 28px;
`;

// 브랜드명
// 길벗은 기본 텍스트 색상, AI는 포인트 컬러 적용
const BrandTitle = styled.h1`
  margin: 0 0 10px;
  color: var(--text);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.04em;

  span {
    color: var(--primary);
  }
`;

// 회원가입 안내 문구
const Description = styled.p`
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.55;
`;

// 입력 폼 영역
const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// 입력창 공통 스타일
// 로그인 폼과 비슷한 연한 블루 계열 배경으로 통일
const Input = styled.input`
  height: 48px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  outline: none;
  background: #f8fbff;
  color: var(--text);
  font-size: 15px;
  font-weight: 600;
  box-sizing: border-box;

  &::placeholder {
    color: #9aa3b2;
    font-weight: 500;
  }

  &:focus {
    border-color: var(--primary);
    background: #ffffff;
    box-shadow: 0 0 0 4px var(--primary-weak);
  }

  &:disabled {
    background: #f1f4f9;
    color: var(--muted);
    cursor: not-allowed;
  }
`;

// 회원가입 버튼
// 기존 파란색 직접 지정 대신 전역 primary 컬러 사용
const SubmitButton = styled.button`
  height: 48px;
  margin-top: 6px;
  border: 1px solid var(--primary);
  border-radius: 12px;
  background: var(--primary);
  color: var(--on-primary);
  cursor: pointer;
  font-size: 16px;
  font-weight: 800;
  transition: 0.18s ease;

  &:hover {
    background: var(--primary-hover);
    border-color: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(103, 137, 202, 0.22);
  }

  &:disabled {
    background: #cbd5e1;
    border-color: #cbd5e1;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// 에러 메시지
// 전역 danger 컬러 사용
const ErrorMessage = styled.p`
  margin: 14px 0 0;
  color: var(--danger-text);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
`;

const Join = () => {
  // Join 내부에서 직접 입력값 상태 관리
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Zustand에서 회원가입 함수, 로딩 상태, 에러 메시지 가져오기
  const { join: authJoin, loading, error } = useAuthStore();

  // 회원가입 성공 후 이동 처리
  const navigate = useNavigate();

  // 회원가입 제출 처리
  const handleJoinSubmit = async (e) => {
    e.preventDefault(); // form 기본 새로고침 방지

    // authStore의 join 함수 호출
    // 기존 코드 흐름 유지: nickname, email, password 순서
    const result = await authJoin(nickname, email, password);

    // 가입 성공 시 인트로 페이지로 이동
    if (result?.success) {
      alert("회원가입이 완료되었습니다.");
      navigate("/");
    }
  };

  return (
    <JoinPageContainer>
      <JoinCard>
        <JoinHeader>
          <BrandTitle>
            길벗 <span>AI</span> 회원가입
          </BrandTitle>
          <Description>
            나만의 서울 여행 일정을 저장하고 AI 분석을 받아보세요.
          </Description>
        </JoinHeader>

        <AuthForm onSubmit={handleJoinSubmit}>
          <Input
            type="text"
            placeholder="아이디를 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <Input
            type="text"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            disabled={loading}
          />

          <SubmitButton type="submit" disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </SubmitButton>
        </AuthForm>

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </JoinCard>
    </JoinPageContainer>
  );
};

export default Join;
