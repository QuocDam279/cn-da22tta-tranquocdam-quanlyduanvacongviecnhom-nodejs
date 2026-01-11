import React from "react";
import { CheckCircle2, Users, BarChart3, Clock, Shield, Zap } from "lucide-react";
import { useGoogleLogin } from "../hooks/useAuthMutations";
import tongquan from "/tongquan.png";
import Congviec from "/congviec.png";
import Nhom from "/nhom.png";

export default function LandingPage() {
  const { mutate: googleLogin, isPending: isLoading } = useGoogleLogin();

  const handleGoogleLogin = () => {
    // Lưu redirect path để GoogleCallback biết redirect về đâu
    localStorage.setItem("redirectAfterLogin", "/tongquan");
    
    // Gọi Google OAuth (sẽ redirect sang Google)
    googleLogin();
  };

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Quản lý nhóm",
      description: "Tổ chức và phân công công việc cho team một cách hiệu quả"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Theo dõi tiến độ",
      description: "Cập nhật thời gian thực về trạng thái của mọi công việc và dự án"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Quản lý deadline",
      description: "Không bao giờ bỏ lỡ deadline với hệ thống nhắc nhở thông minh"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Bảo mật cao",
      description: "Dữ liệu được mã hóa và bảo vệ tuyệt đối"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Tốc độ nhanh",
      description: "Giao diện mượt mà, xử lý tức thì không lag"
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: "Dễ sử dụng",
      description: "Thiết kế trực quan, làm quen ngay trong 5 phút"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header/Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-10 w-auto object-contain"
            />
            <span className="text-xl font-bold text-gray-900">Quản lý công việc</span>
          </div>
          <button
            onClick={handleGoogleLogin}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
          >
            Đăng nhập
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="space-y-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                Quản lý công việc nhóm một cách
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> hiệu quả </span>
                hơn bao giờ hết
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Tăng năng suất làm việc nhóm với công cụ quản lý công việc, 
                theo dõi tiến độ thời gian thực và cộng tác liền mạch.
              </p>

              {/* Login Box */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-4">
                <h3 className="text-2xl font-bold text-gray-900 text-center">
                  Bắt đầu ngay hôm nay
                </h3>
                <p className="text-gray-600 text-center text-sm">
                  Đăng nhập bằng Google để trải nghiệm ngay
                </p>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 transition shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Đăng nhập với Google</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center">
                  Bằng việc đăng nhập, bạn đồng ý với{" "}
                  <a href="#" className="text-indigo-600 hover:underline">Điều khoản dịch vụ</a>
                  {" "}và{" "}
                  <a href="#" className="text-indigo-600 hover:underline">Chính sách bảo mật</a>
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">5000+</div>
                  <div className="text-sm text-gray-600 mt-1">Người dùng</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">50K+</div>
                  <div className="text-sm text-gray-600 mt-1">Dự án</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">99%</div>
                  <div className="text-sm text-gray-600 mt-1">Hài lòng</div>
                </div>
              </div>
            </div>

            {/* Right - Screenshot */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Screenshot Placeholder */}
                <div className="aspect-[4/3] bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <div className="w-full h-full p-6 flex items-center justify-center">
                    <img
                      src={tongquan}
                      alt="Dashboard Preview"
                      className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling.style.display = "flex";
                      }}
                    />

                    {/* Fallback khi lỗi ảnh */}
                    <div
                      style={{ display: "none" }}
                      className="flex flex-col items-center justify-center space-y-4 text-center"
                    >
                      <div className="text-6xl">📊</div>
                      <div className="text-gray-600 font-medium">
                        Screenshot Dashboard
                        <br />
                        <span className="text-sm">
                          (Không load được ảnh tongquan.png)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Mọi công cụ bạn cần để quản lý dự án hiệu quả trên một nền tảng duy nhất
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 bg-gradient-to-br from-white to-indigo-50/50 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Giao diện trực quan, dễ sử dụng
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Thiết kế hiện đại, tối ưu trải nghiệm người dùng
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Screenshot 1 */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <img
                  src={Congviec}
                  alt="Task Management"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling.style.display = "flex";
                  }}
                />

                {/* Fallback */}
                <div
                  style={{ display: "none" }}
                  className="flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="text-5xl mb-4">✅</div>
                  <div className="text-gray-600 font-medium">
                    Quản lý công việc
                    <br />
                    <span className="text-sm">(Không load được ảnh congviec.png)</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Quản lý công việc
                </h3>
                <p className="text-gray-600">
                  Tạo, phân công, trao đổi và theo dõi tiến độ công việc dễ dàng
                </p>
              </div>
            </div>

            {/* Screenshot 2 */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <img
                  src={Nhom}
                  alt="Team Collaboration"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling.style.display = "flex";
                  }}
                />

                {/* Fallback */}
                <div
                  style={{ display: "none" }}
                  className="flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="text-5xl mb-4">👥</div>
                  <div className="text-gray-600 font-medium">
                    Cộng tác nhóm
                    <br />
                    <span className="text-sm">(Không load được ảnh nhom.png)</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Cộng tác nhóm
                </h3>
                <p className="text-gray-600">
                  Làm việc nhóm hiệu quả, quản lý nhóm dễ dàng
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Sẵn sàng tăng năng suất?
          </h2>
          <p className="text-xl text-indigo-100">
            Hàng nghìn đội nhóm đang sử dụng để quản lý công việc hiệu quả hơn
          </p>
          <button
            onClick={handleGoogleLogin}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-xl hover:bg-gray-50 transition shadow-2xl hover:shadow-3xl"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Bắt đầu miễn phí với Google
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-8 w-auto object-contain"
            />
            <span className="text-lg font-bold text-white">Quản lý công việc</span>
          </div>
          <p className="mb-4">© 2025 Quản lý công việc. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition">Về chúng tôi</a>
            <a href="#" className="hover:text-white transition">Tính năng</a>
            <a href="#" className="hover:text-white transition">Liên hệ</a>
            <a href="#" className="hover:text-white transition">Chính sách bảo mật</a>
          </div>
        </div>
      </footer>
    </div>
  );
}