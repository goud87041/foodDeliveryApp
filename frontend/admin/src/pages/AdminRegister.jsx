import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { useAdminAuth } from "../context/AdminAuth.jsx";

export default function AdminRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "", adminId: "" });
  const [busy, setBusy] = useState(false);
  const { login } = useAdminAuth();
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await client.post("/admin/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        adminId: form.adminId || undefined,
      });
      login(data.token, data.admin);
      toast.success("Admin created");
      nav("/");
    } catch (err) {
      const m = err.response && err.response.data && err.response.data.message;
      toast.error(m || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl border p-8 space-y-4">
        <h1 className="text-2xl font-bold">Register admin</h1>
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="w-full border rounded-xl px-4 py-2"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full border rounded-xl px-4 py-2"
          placeholder="Admin ID (optional)"
          value={form.adminId}
          onChange={(e) => setForm({ ...form, adminId: e.target.value })}
        />
        <input
          className="w-full border rounded-xl px-4 py-2"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={6}
        />
        <button type="submit" disabled={busy} className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold">
          Create
        </button>
        <Link to="/login" className="block text-center text-sm text-orange-600">
          Back to login
        </Link>
      </form>
    </div>
  );
}

