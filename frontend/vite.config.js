import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // 외부 접속 허용 (도커 필수)
    port: 5173, // 포트 고정
    strictPort: true,
    hmr: {
      clientPort: 3000, // 브라우저가 인식할 외부 포트
    },
    proxy: {
      // 도커망 내부에서는 'backend'라는 서비스 이름으로 통신합니다.
      "/api": {
        target: "http://backend:5000",
        changeOrigin: true,
      },
      "/ai": {
        target: "http://ai_backend:8000", // AI 컨테이너 이름에 맞게 수정
        changeOrigin: true,
      },
    },
  },
})
