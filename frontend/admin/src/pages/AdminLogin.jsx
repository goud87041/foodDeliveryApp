import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { useAdminAuth } from "../context/AdminAuth.jsx";
import { AuthGateSkeleton } from "../components/Skeleton.jsx";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, admin, loading } = useAdminAuth();
  const nav = useNavigate();

  if (loading) return <AuthGateSkeleton />;
  if (admin) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    if (!adminId.trim() && !email.trim()) {
      toast.error("Enter Admin ID or email");
      setBusy(false);
      return;
    }
    try {
      const payload = { password };
      if (adminId.trim()) payload.adminId = adminId.trim();
      else payload.email = email.trim();
      const { data } = await client.post("/admin/auth/login", payload);
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
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow-card border border-orange-100 p-8 animate-fade-in-scale">
        <h1 className="text-2xl font-bold text-orange-500">Admin login</h1>
        <p className="text-sm text-gray-500 mt-1">Admin ID or email, and password</p>
        <div className="mt-6 space-y-4">
          <input
            className="w-full border rounded-xl px-4 py-2.5"
            placeholder="Admin ID"
            value={adminId}
            onChange={(e) => { setAdminId(e.target.value.toUpperCase()); setEmail(""); }}
          />
          <p className="text-center text-xs text-gray-400">or</p>
          <input
            type="email"
            className="w-full border rounded-xl px-4 py-2.5"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setAdminId(""); }}
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

