// src/hooks/useLoginForm.js
import { useState } from "react";

export function useLoginForm(initial = { email: "", password: "" }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const err = {};

    if (!form.email) err.email = "Email không được để trống.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      err.email = "Email không hợp lệ.";

    if (!form.password) err.password = "Mật khẩu không được để trống.";
    else if (form.password.length < 6)
      err.password = "Mật khẩu phải có ít nhất 6 ký tự.";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  return { form, errors, handleChange, validate };
}
