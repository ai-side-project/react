import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // 외부 접속 허용 (도커 필수)
    port: 5173, // 포트 고정
    strictPort: true,
    hmr: {
      clientPort: 80, // 브라우저가 인식할 외부 포트
    },
  },
})
