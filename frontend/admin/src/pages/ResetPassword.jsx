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

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await client.post("/admin/auth/reset-password", { email, token, password });
      toast.success("Password updated");
      nav("/login");
    } catch (err) {
      const m = err.response && err.response.data && err.response.data.message;
      toast.error(m || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white border rounded-2xl p-8 space-y-4">
        <h1 className="text-xl font-bold">Reset password</h1>
        {!token || !email ? (
          <p className="text-red-600 text-sm">Invalid link</p>
        ) : (
          <>
            <p className="text-sm text-gray-500">{email}</p>
            <input type="password" minLength={6} required className="w-full border rounded-xl px-4 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" disabled={busy} className="w-full py-3 bg-orange-500 text-white rounded-xl">
              Save
            </button>
          </>
        )}
        <Link to="/login" className="block text-center text-sm text-orange-600">
          Login
        </Link>
      </form>
    </div>
  );
}
