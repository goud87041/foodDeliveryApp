import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await client.post("/auth/forgot-password", {
        email,
        resetUrlBase: `${window.location.origin}/reset-password`,
      });
      toast.success("If the email exists, we sent reset instructions.");
    } catch {
      toast.error("Request failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-card border border-orange-100 p-8">
      <h1 className="text-2xl font-bold">Forgot password</h1>
      <p className="text-sm text-gray-500 mt-1">We will email a reset link (or log it in dev if SMTP is off).</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-orange-400 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold">
          {busy ? "Sending..." : "Send link"}
        </button>
      </form>
      <Link to="/login" className="block mt-4 text-center text-sm text-orange-600">
        Back to login
      </Link>
    </div>
  );
}
