import styled from "styled-components";

// 1. 푸터 전용 스타일 정의
const FooterContainer = styled.footer`
  border-top: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  padding: 12px 0; /* 패딩을 살짝 늘려주면 더 예쁩니다 */
  color: var(--muted);
  font-size: 12px;
  margin-top: auto; /* 푸터를 항상 바닥으로 밀어냄 */
`;

const FooterInner = styled.div`
  /* 기존 .container 스타일이 전역에 없다면 여기서 정의 */
  width: min(var(--container-w), calc(100% - 32px));
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 4px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
`;

function Footer() {
  return (
    <FooterContainer>
      <FooterInner>
        <div>
          <strong
            style={{
              display: "block",
              marginBottom: "4px",
              color: "var(--text)",
            }}
          >
            길벗 AI
          </strong>
          <p style={{ margin: 0 }}>
            서울 여행을 더 똑똑하게 만드는 AI 여행 플래너
          </p>
          <span>© 2026 side project No.1</span>
        </div>
      </FooterInner>
    </FooterContainer>
  );
}

export default Footer;
