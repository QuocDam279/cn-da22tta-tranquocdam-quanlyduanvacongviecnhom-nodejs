import { useState } from "react";

export function useRegisterForm(initialValues) {
  const [form, setForm] = useState(initialValues);//trạng thái form đăng ký và hàm cập nhật trạng thái form
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });//cập nhật giá trị form khi người dùng nhập
    setErrors({});//xóa lỗi khi người dùng thay đổi giá trị
  };

  const validate = () => {//hàm kiểm tra hợp lệ form
    const errs = {};
    if (!form.full_name) errs.full_name = "Vui lòng nhập họ và tên";
    if (!form.email) errs.email = "Email không được để trống";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      errs.email = "Email không hợp lệ";
    if (!form.password || form.password.length < 6)
      errs.password = "Mật khẩu ít nhất 6 ký tự";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Mật khẩu xác nhận không khớp";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  return { form, errors, handleChange, validate, setForm, setErrors };
}
