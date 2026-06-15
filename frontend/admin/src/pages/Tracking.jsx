import { useEffect, useState } from "react";
import client from "../api/client.js";
import { createAdminSocket } from "../lib/socket.js";
import { TrackingSkeleton } from "../components/Skeleton.jsx";

const statusLabel = { idle: "Idle", active: "Active", on_delivery: "On delivery" };

export default function Tracking() {
  const [boys, setBoys] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    return client.get("/admin/delivery-boys").then((res) => setBoys(res.data.deliveryBoys));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
    const s = createAdminSocket();
    s.emit("join:admin");
    s.on("delivery:location", () => load());
    return () => s.disconnect();
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Delivery partners</h1>
      <p className="text-sm text-gray-500">Live status updates via Socket.io</p>
      {loading ? (
        <TrackingSkeleton />
      ) : (
      <div className="grid md:grid-cols-2 gap-4 stagger-children">
        {boys.map((b) => (
          <div key={b._id} className="bg-white rounded-xl border p-4 card-lift">
            <p className="font-semibold">{b.name}</p>
            <p className="text-sm text-gray-500">{b.email}</p>
            <p className="mt-2 text-sm">
              Status: <strong className="text-orange-600">{statusLabel[b.status] || b.status}</strong>
            </p>
            {b.currentLocation && (
              <p className="text-xs font-mono text-gray-500 mt-1">
                {b.currentLocation.lat?.toFixed(4)}, {b.currentLocation.lng?.toFixed(4)}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">Avg delivery rating: {b.deliveryAvgRating || 0}</p>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
