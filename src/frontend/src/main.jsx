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
      // ⏳ TĂNG THỜI GIAN CACHE LÊN: 
      // 5 phút. Trong thời gian này, dù bạn chuyển trang đi đâu quay lại, 
      // nó sẽ dùng cache chứ KHÔNG gọi API.
      staleTime: 5 * 60 * 1000, 
      
      // 🗑️ Giữ cache 30 phút (Garbage Collection)
      gcTime: 30 * 60 * 1000, // (Lưu ý: v5 dùng gcTime, v4 dùng cacheTime)
      
      // 🛑 CHẶN SPAM REQUEST TUYỆT ĐỐI 🛑
      refetchOnWindowFocus: false, // Chặn khi Alt+Tab
      refetchOnReconnect: false,   // Chặn khi có mạng lại
      
      // 👇 ĐÂY LÀ DÒNG BẠN ĐANG THIẾU 👇
      // Nếu component render lại mà dữ liệu trong cache vẫn còn hạn (staleTime),
      // nó sẽ dùng luôn cache, KHÔNG gọi server nữa.
      refetchOnMount: false,       
      
      retry: 1, 
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