import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { useRegister } from "../hooks/useAuth";
import FormInput from "../components/common/FormInput";
import Button from "../components/common/Button";

export default function Register() {
  const navigate = useNavigate();
  const { mutate: registerMutation, isPending } = useRegister();
  
  const { form, errors, handleChange, validate } = useRegisterForm({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    registerMutation({
      full_name: form.full_name.trim(),
      email: form.email.toLowerCase().trim(),
      password: form.password,
    }, {
      onSuccess: (data) => {
        setMessage({ type: "success", text: "Đăng ký thành công! Chào mừng bạn đến với QuestDo." });
        setTimeout(() => navigate("/login"), 2500);
      },
      onError: (err) => {
        setMessage({ type: "error", text: err.message });
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-5">
      <div className="w-full max-w-md">
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50 animate-fadeIn">
          {/* Brand */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500 text-white text-xl font-bold rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              QD
            </div>
            <div className="text-3xl font-bold text-blue-900 tracking-wide">
              QuestDo
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-center text-slate-800 text-2xl font-semibold mb-2">
            Tạo tài khoản mới
          </h2>
          <p className="text-center text-slate-600 text-sm mb-7">
            Điền thông tin để bắt đầu hành trình của bạn
          </p>

          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <FormInput
              name="full_name"
              type="text"
              value={form.full_name}
              onChange={handleChange}
              label="Họ và tên"
              error={errors.full_name}
            />
            <FormInput
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              label="Email"
              error={errors.email}
            />
            <FormInput
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              label="Mật khẩu"
              error={errors.password}
            />
            <FormInput
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              label="Xác nhận mật khẩu"
              error={errors.confirmPassword}
            />

            <Button loading={isPending}>Đăng ký</Button>

            <div className="text-center text-sm mt-2">
              <span className="text-slate-600">Đã có tài khoản?</span>
              <Link 
                to="/login" 
                className="ml-2 text-blue-600 hover:underline font-medium"
              >
                Đăng nhập
              </Link>
            </div>
          </form>

          {/* Message Toast */}
          {message.text && (
            <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 min-w-[280px] px-4 py-3 rounded-lg font-medium shadow-lg animate-pulse ${
              message.type === "success" 
                ? "bg-green-100 text-green-800 border border-green-400" 
                : "bg-red-100 text-red-800 border border-red-400"
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}