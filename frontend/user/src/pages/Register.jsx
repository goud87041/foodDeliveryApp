import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    line1: "",
    city: "",
    pincode: "",
  });
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  function ch(k) {
    return (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await client.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        address: { line1: form.line1, city: form.city, pincode: form.pincode },
      });
      login(data.token, data.user);
      toast.success("Account created!");
      nav("/");
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      toast.error(msg || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-card border border-orange-100 p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Register</h1>
      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            value={form.name}
            onChange={ch("name")}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            value={form.email}
            onChange={ch("email")}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            value={form.password}
            onChange={ch("password")}
            required
            minLength={6}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            value={form.phone}
            onChange={ch("phone")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address line</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            value={form.line1}
            onChange={ch("line1")}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            value={form.city}
            onChange={ch("city")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Pincode</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            value={form.pincode}
            onChange={ch("pincode")}
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60"
          >
            {busy ? "Creating..." : "Create account"}
          </button>
        </div>
      </form>
      <p className="mt-4 text-sm text-center">
        <Link to="/login" className="text-orange-600 hover:underline">
          Already have an account?
        </Link>
      </p>
    </div>
  );
}
