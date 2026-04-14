import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/ai": {
        target: "http://localhost:8000",
        // target: import.meta.env.VITE_BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
})
