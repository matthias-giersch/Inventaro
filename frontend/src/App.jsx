import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { initAuth } from "./api/auth";
import AdminRoute from "./components/AdminRoute";
import AppLayout from "./components/AppLayout";
import AdminUsersPage from "./pages/AdminUsersPage";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  const nav = useNavigate();
  useEffect(() => {
    const ok = initAuth();
    if (!ok && window.location.pathname !== "/login") {
      nav("/login", { replace: true });
    }
  }, [nav]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/auth/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
