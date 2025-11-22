// App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
import TeamDetail from "./pages/TeamDetail";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/tongquan" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/nhom" element={<RequireAuth><Team /></RequireAuth>} />
      <Route path="/nhom/:id" element={<RequireAuth><TeamDetail /></RequireAuth>} />
    </Routes>
  );
}

export default App;
