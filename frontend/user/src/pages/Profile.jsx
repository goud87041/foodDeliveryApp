import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", line1: "", city: "", pincode: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        line1: (user.address && user.address.line1) || "",
        city: (user.address && user.address.city) || "",
        pincode: (user.address && user.address.pincode) || "",
      });
    }
  }, [user]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await client.put("/auth/profile", {
        name: form.name,
        phone: form.phone,
        address: { line1: form.line1, city: form.city, pincode: form.pincode },
      });
      setUser(data.user);
      toast.success("Profile updated");
    } catch (err) {
      const m = err.response && err.response.data && err.response.data.message;
      toast.error(m || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl border border-orange-100 p-8 shadow-card">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-sm text-gray-500">{user && user.email}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            className="mt-1 w-full rounded-xl border px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            className="mt-1 w-full rounded-xl border px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            className="mt-1 w-full rounded-xl border px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            value={form.line1}
            onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="rounded-xl border px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
          <input
            className="rounded-xl border px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Pincode"
            value={form.pincode}
            onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
          />
        </div>
        <button type="submit" disabled={busy} className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold">
          {busy ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
