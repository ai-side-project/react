import { createGlobalStyle, keyframes } from "styled-components";

// 로딩 애니메이션 정의
const spin = keyframes`
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
`;

const GlobalStyle = createGlobalStyle`
  :root {
    --container-w: 1400px;

    --bg: #f1f4f9;
    --card: #ffffff;
    --border: #e3e8f0;

    --text: #504e49;
    --muted: #747f90;

    --primary: #6789ca;
    --primary-hover: #5678b9;
    --primary-weak: rgba(103, 137, 202, 0.14);
    --on-primary: #ffffff;

    --accent: #e5b560;
    --accent-weak: #f6e7c7;

    --danger: #c24b5a;
    --danger-weak: rgba(194, 75, 90, 0.12);
    --danger-border: rgba(194, 75, 90, 0.28);
    --danger-text: #941e34;

    --shadow: 0 10px 28px rgba(80, 78, 73, 0.08);
    --radius: 14px;
  }

  body {
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  #root {
    max-width: none;
    margin: 0;
    padding: 0;
    text-align: left;
    width: 100%;
  }

  /* 공통 버튼 기본값 */
  button {
    border: 1px solid var(--border);
    background: #fff;
    border-radius: 10px;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease;
    cursor: pointer;
  }

  button:active {
    transform: translateY(1px);
  }

  /* 로딩 서클 애니메이션 전역 등록 */
  .loadingCircle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-sizing: border-box;
    border-radius: 50%;
    width: 100px;
    height: 100px;
    border-top: 15px solid #88ac73;
    border-left: 15px solid #88ac73;
    border-right: 15px solid #88ac73;
    border-bottom: 15px solid transparent;
    animation: ${spin} 2s linear infinite;
  }
`;

export default GlobalStyle;
