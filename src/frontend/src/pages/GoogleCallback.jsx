import { useEffect } from "react";
import { useGoogleCallback } from "../hooks/useAuthMutations";

export default function GoogleCallback() {
  // ✅ Hook đã handle tất cả: save auth, invalidate cache, navigate
  const { mutate: handleCallback, isPending, isError, error } = useGoogleCallback();

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50 text-center max-w-md">
        {isPending && (
          <>
            {/* Loading Spinner */}
            <div className="w-16 h-16 mx-auto mb-6">
              <svg className="animate-spin text-blue-600" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  fill="none" 
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
                />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-slate-800 mb-2">
              Đang xử lý đăng nhập...
            </h2>
            <p className="text-slate-600 text-sm">
              Vui lòng chờ trong giây lát
            </p>
          </>
        )}

        {isError && (
          <>
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-red-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-slate-800 mb-2">
              Đăng nhập thất bại
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              {error?.message === "missing_data"
                ? "Thiếu thông tin từ Google"
                : error?.message === "parse_error"
                ? "Lỗi xử lý dữ liệu"
                : error?.message || "Đã có lỗi xảy ra. Vui lòng thử lại."}
            </p>

            <a
              href="/login"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-200"
            >
              Quay lại đăng nhập
            </a>
          </>
        )}
      </div>
    </div>
  );
}