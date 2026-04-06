import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import client from "../api/client.js";

export default function ChefsAdmin() {
  const [chefs, setChefs] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function load() {
    client.get("/admin/chefs").then((res) => setChefs(res.data.chefs));
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    try {
      await client.post("/admin/chefs", { name, email });
      toast.success("Chef added");
      setName("");
      setEmail("");
      load();
    } catch {
      toast.error("Failed");
    }
  }

  async function toggle(c) {
    await client.patch("/admin/chefs/" + c._id, { active: !c.active });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chefs</h1>
      <form onSubmit={add} className="bg-white rounded-xl border p-4 flex flex-wrap gap-3 items-end max-w-xl">
        <div>
          <label className="text-xs text-gray-500">Name</label>
          <input className="block border rounded-lg px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="text-xs text-gray-500">Email</label>
          <input className="block border rounded-lg px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
          Add chef
        </button>
      </form>
      <ul className="bg-white rounded-xl border divide-y">
        {chefs.map((c) => (
          <li key={c._id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-gray-500">{c.email}</p>
            </div>
            <button type="button" className="text-sm text-orange-600" onClick={() => toggle(c)}>
              {c.active ? "Deactivate" : "Activate"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

