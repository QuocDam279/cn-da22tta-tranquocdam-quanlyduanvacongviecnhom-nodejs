import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',    // Cho phép truy cập từ máy host
    port: 5173,         // Đảm bảo port khớp với docker-compose
    watch: {
      usePolling: true, // Quan trọng: giúp hot reload trong Docker
      interval: 100,    // Tần suất kiểm tra thay đổi file
    },
  },
})
