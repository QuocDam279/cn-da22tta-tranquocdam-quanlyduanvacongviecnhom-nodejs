import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from "./App";
import "./index.css";

// Tạo Query Client với cấu hình tối ưu
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ⏳ Dữ liệu được coi là "tươi" trong 2 phút (không tự fetch lại nếu chưa quá hạn)
      staleTime: 2 * 60 * 1000, 
      
      // 🗑️ Giữ trong bộ nhớ cache 15 phút trước khi xóa hẳn (Garbage Collection)
      cacheTime: 15 * 60 * 1000, 
      
      // 🛑 TẮT TỰ ĐỘNG FETCH (Nguyên nhân chính gây log 304 liên tục)
      refetchOnWindowFocus: false, // Không fetch khi chuyển tab qua lại
      refetchOnMount: false,       // Không fetch lại nếu component mount lại mà dữ liệu còn tươi
      refetchOnReconnect: false,   // Không fetch khi mất mạng có lại (tùy chọn)
      
      retry: 1, // Chỉ thử lại 1 lần nếu lỗi
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);