import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { resolveMediaUrl } from "../lib/resolveMediaUrl.js";

const empty = { name: "", description: "", price: "", category: "", image: "", available: true };

export default function FoodsAdmin() {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  function load() {
    client.get("/admin/foods").then((res) => setFoods(res.data.foods));
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price), available: !!form.available };
    try {
      if (editing) {
        await client.put("/admin/foods/" + editing, payload);
        toast.success("Updated");
      } else {
        await client.post("/admin/foods", payload);
        toast.success("Created");
      }
      setForm(empty);
      setEditing(null);
      load();
    } catch {
      toast.error("Failed");
    }
  }

  function edit(f) {
    setEditing(f._id);
    setForm({
      name: f.name,
      description: f.description || "",
      price: String(f.price),
      category: f.category || "",
      image: f.image || "",
      available: f.available,
    });
  }

  async function del(id) {
    if (!confirm("Delete?")) return;
    await client.delete("/admin/foods/" + id);
    load();
  }

  async function onPickImage(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const { data } = await client.post("/admin/upload/image", body);
      if (data.url) {
        setForm((f) => ({ ...f, image: data.url }));
        toast.success("Image uploaded");
      }
    } catch (err) {
      const m = err.response && err.response.data && err.response.data.message;
      toast.error(m || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Foods</h1>
      <form onSubmit={save} className="bg-white rounded-xl border p-4 grid sm:grid-cols-2 gap-3 max-w-3xl">
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <div className="sm:col-span-2 space-y-2">
          <p className="text-xs font-medium text-gray-600">Image</p>
          <div className="flex flex-wrap items-center gap-3">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="px-4 py-2 rounded-lg border-2 border-orange-200 bg-orange-50 text-orange-800 text-sm font-medium hover:bg-orange-100 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Choose image"}
            </button>
            {form.image && (
              <img src={resolveMediaUrl(form.image)} alt="" className="h-16 w-24 object-cover rounded-lg border border-orange-100" />
            )}
          </div>
          <input
            className="border rounded-lg px-3 py-2 w-full text-sm"
            placeholder="Or paste external image URL"
            value={form.image.startsWith("/uploads/") ? "" : form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
          {form.image.startsWith("/uploads/") && (
            <p className="text-xs text-gray-500">Using uploaded file: {form.image}</p>
          )}
        </div>
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
          Available
        </label>
        <textarea
          className="border rounded-lg px-3 py-2 sm:col-span-2"
          placeholder="Description"
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg">
            {editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button
              type="button"
              className="px-4 py-2 border rounded-lg"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="bg-white rounded-xl border divide-y">
        {foods.map((f) => (
          <div key={f._id} className="p-4 flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {f.image ? (
                <img src={resolveMediaUrl(f.image)} alt="" className="h-12 w-16 object-cover rounded-lg border shrink-0" />
              ) : (
                <div className="h-12 w-16 rounded-lg bg-orange-50 shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-medium truncate">{f.name}</p>
                <p className="text-sm text-orange-600">INR {f.price}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="text-sm text-orange-600" onClick={() => edit(f)}>
                Edit
              </button>
              <button type="button" className="text-sm text-red-600" onClick={() => del(f._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

