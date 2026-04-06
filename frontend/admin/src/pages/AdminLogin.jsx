import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { useAdminAuth } from "../context/AdminAuth.jsx";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, admin, loading } = useAdminAuth();
  const nav = useNavigate();

  if (loading) return <p className="p-8 text-center">Loading...</p>;
  if (admin) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await client.post("/admin/auth/login", { adminId, password });
      login(data.token, data.admin);
      toast.success("Welcome");
      nav("/");
    } catch (err) {
      const m = err.response && err.response.data && err.response.data.message;
      toast.error(m || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow-card border border-orange-100 p-8">
        <h1 className="text-2xl font-bold text-orange-500">Admin login</h1>
        <p className="text-sm text-gray-500 mt-1">Admin ID and password</p>
        <div className="mt-6 space-y-4">
          <input
            className="w-full border rounded-xl px-4 py-2.5"
            placeholder="Admin ID"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value.toUpperCase())}
            required
          />
          <input
            type="password"
            className="w-full border rounded-xl px-4 py-2.5"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold">
            {busy ? "..." : "Log in"}
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          <Link to="/forgot-password" className="text-orange-600">
            Forgot password
          </Link>
          {" · "}
          <Link to="/register" className="text-orange-600">
            Register admin
          </Link>
        </p>
      </form>
    </div>
  );
}

