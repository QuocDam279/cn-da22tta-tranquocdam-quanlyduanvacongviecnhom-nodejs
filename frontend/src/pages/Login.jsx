// src/pages/Login.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

import Button from "../components/common/Button";
import FormInput from "../components/common/FormInput";
import { login } from "../services/authService";
import { useLoginForm } from "../hooks/useLoginForm";

export default function Login() {
  const navigate = useNavigate();

  const { form, errors, handleChange, validate } = useLoginForm({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const data = await login(form);

      // lưu token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage({ type: "success", text: "Đăng nhập thành công!" });
      setTimeout(() => navigate("/tongquan"), 2000);

    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="hero">
        <div className="card">
          <div className="brand">
            <div className="logo">QD</div>
            <div className="title">QuestDo</div>
          </div>

          <h2 className="heading">Chào mừng trở lại</h2>
          <p className="sub">Đăng nhập để tiếp tục</p>

          <form className="form" onSubmit={handleSubmit}>
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
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              label="Mật khẩu"
              error={errors.password}
              icon={
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              }
            />

            <Button loading={loading}>Đăng nhập</Button>

            <div className="register-link">
              <span>Chưa có tài khoản?</span>
              <Link to="/register">Đăng ký</Link>
            </div>
          </form>

          {message.text && (
            <div className={`message-overlay ${message.type}-toast`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
