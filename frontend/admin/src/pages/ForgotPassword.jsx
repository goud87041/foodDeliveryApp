import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await client.post("/admin/auth/forgot-password", {
        email,
        resetUrlBase: window.location.origin + "/reset-password",
      });
      toast.success("If email exists, instructions were sent.");
    } catch {
      toast.error("Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white border rounded-2xl p-8 space-y-4">
        <h1 className="text-xl font-bold">Forgot password</h1>
        <input
          type="email"
          required
          className="w-full border rounded-xl px-4 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={busy} className="w-full py-3 bg-orange-500 text-white rounded-xl">
          Send
        </button>
        <Link to="/login" className="block text-center text-orange-600 text-sm">
          Login
        </Link>
      </form>
    </div>
  );
}

