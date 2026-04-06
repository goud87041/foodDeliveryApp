import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await client.post("/auth/reset-password", { email, token, password });
      toast.success("Password updated. Log in with your new password.");
      nav("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-card border border-orange-100 p-8">
      <h1 className="text-2xl font-bold">Set new password</h1>
      {!token || !email ? (
        <p className="mt-4 text-sm text-red-600">Invalid link. Open the link from your email.</p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <p className="text-sm text-gray-500">{email}</p>
          <input
            type="password"
            required
            minLength={6}
            placeholder="New password"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:ring-2 focus:ring-orange-400 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold">
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>
      )}
      <Link to="/login" className="block mt-4 text-center text-sm text-orange-600">
        Log in
      </Link>
    </div>
  );
}
