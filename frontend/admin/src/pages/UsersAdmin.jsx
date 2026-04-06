import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import client from "../api/client.js";

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);

  function load() {
    client.get("/admin/users").then((res) => setUsers(res.data.users));
  }

  useEffect(() => {
    load();
  }, []);

  async function block(id) {
    await client.patch("/admin/users/" + id + "/block");
    toast.success("Blocked");
    load();
  }

  async function unblock(id) {
    await client.patch("/admin/users/" + id + "/unblock");
    toast.success("Unblocked");
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="bg-white rounded-xl border divide-y">
        {users.map((u) => (
          <div key={u._id} className="p-4 flex justify-between items-center flex-wrap gap-2">
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
              {u.blocked && <span className="text-xs text-red-600">Blocked</span>}
            </div>
            <div className="flex gap-2">
              {u.blocked ? (
                <button type="button" className="px-3 py-1 text-sm bg-green-100 rounded-lg" onClick={() => unblock(u._id)}>
                  Unblock
                </button>
              ) : (
                <button type="button" className="px-3 py-1 text-sm bg-red-100 rounded-lg" onClick={() => block(u._id)}>
                  Block
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

