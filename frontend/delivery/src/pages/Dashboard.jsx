import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { useDeliveryAuth } from "../context/DeliveryAuth.jsx";
import { createDeliverySocket } from "../lib/socket.js";

export default function Dashboard() {
  const { partner, logout } = useDeliveryAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    return client.get("/delivery/orders").then((res) => setOrders(res.data.orders || []));
  }, []);

  useEffect(() => {
    load().catch(() => toast.error("Could not load orders")).finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (!partner || partner.id == null) return;
    const socket = createDeliverySocket();
    socket.emit("join:delivery", String(partner.id));
    function refresh() {
      load();
    }
    socket.on("delivery:offer", refresh);
    socket.on("delivery:accepted", refresh);
    socket.on("order:updated", refresh);
    return () => {
      socket.off("delivery:offer", refresh);
      socket.off("delivery:accepted", refresh);
      socket.off("order:updated", refresh);
      socket.disconnect();
    };
  }, [partner, load]);

  const pending = orders.filter((o) => o.deliveryResponse === "pending");
  const active = orders.filter((o) => o.deliveryResponse === "accepted");

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hello, {partner.name}</h1>
          <p className="text-sm text-slate-500">Your delivery runs</p>
        </div>
        <button type="button" onClick={logout} className="text-sm text-orange-600 font-medium">
          Log out
        </button>
      </header>

      {loading ? (
        <p className="text-center text-slate-500 py-12">Loading orders...</p>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-3">New offers</h2>
            {pending.length === 0 ? (
              <p className="text-slate-500 text-sm bg-white rounded-xl border border-slate-100 p-6 text-center">No pending offers</p>
            ) : (
              <ul className="space-y-3">
                {pending.map((o) => (
                  <li key={o._id}>
                    <Link
                      to={"/orders/" + o._id}
                      className="block bg-white rounded-xl border-2 border-orange-200 p-4 shadow-sm hover:border-orange-400 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs text-slate-400">{o._id.slice(-8)}</span>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Action needed</span>
                      </div>
                      <p className="font-semibold text-slate-900 mt-2">INR {o.totalAmount}</p>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-1">{o.address && o.address.line1}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Accepted — out for delivery</h2>
            {active.length === 0 ? (
              <p className="text-slate-500 text-sm bg-white rounded-xl border border-slate-100 p-6 text-center">Nothing in progress</p>
            ) : (
              <ul className="space-y-3">
                {active.map((o) => (
                  <li key={o._id}>
                    <Link
                      to={"/orders/" + o._id}
                      className="block bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-orange-300 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs text-slate-400">{o._id.slice(-8)}</span>
                        <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">Accepted</span>
                      </div>
                      <p className="font-semibold text-slate-900 mt-2">INR {o.totalAmount}</p>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-1">{o.address && o.address.line1}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
