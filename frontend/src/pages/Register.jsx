import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { register } from "../services/authService";
import FormInput from "../components/common/FormInput";
import Button from "../components/common/Button";
import "../styles/register.css";

export default function Register() {
  const navigate = useNavigate();//chuyển hướng trang
  const { form, errors, handleChange, validate } = useRegisterForm({//xử lý form đăng ký
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);//trạng thái tải
  const [message, setMessage] = useState({ type: "", text: "" });//thông báo lỗi hoặc thành công

  const handleSubmit = async (e) => {
    e.preventDefault();//ngăn chặn tải lại trang
    if (!validate()) return;//kiểm tra hợp lệ form

    try {
      setLoading(true);//bắt đầu tải, báoo hiệu người dùng chờ do hệ thống đang xử lý
      await register({//gọi API đăng ký, chờ phản hồi từ server(await)
        full_name: form.full_name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
      });

      setMessage({ type: "success", text: "Đăng ký thành công! Chào mừng bạn đến với QuestDo." });

      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-root">
      <div className="hero">
        <div className="card">
          <div className="brand">
            <div className="logo">QD</div>
            <div className="title">QuestDo</div>
          </div>

          <h2 className="heading">Tạo tài khoản mới</h2>
          <p className="sub">Điền thông tin để bắt đầu hành trình của bạn</p>

          <form className="form" onSubmit={handleSubmit}>
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

            <Button loading={loading}>Đăng ký</Button>

            <div className="register-link">
              <span>Đã có tài khoản?</span>
              <Link to="/login">Đăng nhập</Link>
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
