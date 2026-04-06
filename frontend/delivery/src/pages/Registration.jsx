import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { useDeliveryAuth } from "../context/DeliveryAuth.jsx";

export default function Registration() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { partner, loading, login } = useDeliveryAuth();
  const nav = useNavigate();

  if (loading) return <p className="p-8 text-center">Loading...</p>;
  if (partner) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await client.post("/delivery/register", { name, email, phone, password });
      login(data.token, data.deliveryBoy);
      toast.success("Registration successful");
      nav("/");
    } catch (err) {
      const m = err.response && err.response.data && err.response.data.message;
      toast.error(m || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-orange-50 to-white">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
        <h1 className="text-2xl font-bold text-orange-500">Become a Delivery Partner</h1>
        <p className="text-sm text-slate-500 mt-1">Sign up to receive and fulfill delivery offers</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            type="text"
            required
            placeholder="Full Name"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            required
            placeholder="Email Address"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="tel"
            required
            placeholder="Phone Number"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Password"
            minLength="6"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60 transition-colors"
          >
            {busy ? "Registering..." : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
