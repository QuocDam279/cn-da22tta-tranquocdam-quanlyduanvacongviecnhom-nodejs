// dùng để gọi API đăng ký người dùng mới
export async function register({ full_name, email, password }) {//gọi API đăng ký người dùng mới
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, password }),
  });
  const data = await res.json();//chuyển phản hồi thành JSON
  if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");
  return data;
}

// hàm đăng nhập người dùng
export async function login({ email, password }) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");
  return data;
}

