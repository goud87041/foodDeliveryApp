import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await client.post("/auth/login", { email, password });
      login(data.token, data.user);
      toast.success("Welcome back!");
      nav("/");
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      toast.error(msg || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-card border border-orange-100 p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
      <p className="text-sm text-gray-500 mt-1">Use your email and password</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-orange-400 outline-none"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-orange-400 outline-none"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
        >
          {busy ? "Please wait..." : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-center text-gray-500">
        <Link to="/forgot-password" className="text-orange-600 hover:underline">
          Forgot password?
        </Link>
        {" · "}
        <Link to="/register" className="text-orange-600 hover:underline">
          Create account
        </Link>
      </p>
    </div>
  );
}
