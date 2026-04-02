import { createGlobalStyle, keyframes } from "styled-components"

// 로딩 애니메이션 정의
const spin = keyframes`
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
`

const GlobalStyle = createGlobalStyle`
  :root {
    --container-w: 1400px;
    --bg: #f6f8fc;
    --card: #ffffff;
    --border: #e5e7eb;
    --muted: #6b7280;
    --primary: #4f46e5;
    --primary-hover: #4338ca;
    --primary-weak: rgba(79, 70, 229, 0.12);
    --on-primary: #ffffff;
    --danger: #ef4444;
    --danger-weak: rgba(239, 68, 68, 0.1);
    --danger-border: rgba(239, 68, 68, 0.3);
    --danger-text: #b91c1c;
    --shadow: 0 10px 28px rgba(17, 24, 39, 0.08);
    --radius: 14px;
  }

  body {
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: #111827;
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
`

export default GlobalStyle
