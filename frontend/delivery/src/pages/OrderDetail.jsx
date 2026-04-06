import { useEffect, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { useDeliveryAuth } from "../context/DeliveryAuth.jsx";
import { createDeliverySocket } from "../lib/socket.js";

function mapsQuery(addr) {
  if (!addr) return "";
  const parts = [addr.line1, addr.city, addr.pincode].filter(Boolean);
  return encodeURIComponent(parts.join(", "));
}

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { partner } = useDeliveryAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    return client.get("/delivery/orders/" + id).then((res) => setOrder(res.data.order));
  }, [id]);

  useEffect(() => {
    load()
      .catch(() => {
        toast.error("Order not found");
        nav("/");
      })
      .finally(() => setLoading(false));
  }, [load, nav]);

  useEffect(() => {
    if (!partner || partner.id == null) return;
    const socket = createDeliverySocket();
    socket.emit("join:delivery", String(partner.id));
    function onOrder(payload) {
      if (payload.orderId === id || (payload.order && payload.order._id === id)) {
        if (payload.order) setOrder(payload.order);
        else load();
      }
    }
    socket.on("order:updated", onOrder);
    return () => {
      socket.off("order:updated", onOrder);
      socket.disconnect();
    };
  }, [partner, id, load]);

  async function accept() {
    setBusy(true);
    try {
      const { data } = await client.post("/delivery/orders/" + id + "/accept");
      setOrder(data.order);
      toast.success("You accepted this delivery");
    } catch (err) {
      const m = err.response && err.response.data && err.response.data.message;
      toast.error(m || "Could not accept");
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    if (!confirm("Reject this offer? It may go to another partner.")) return;
    setBusy(true);
    try {
      const { data } = await client.post("/delivery/orders/" + id + "/reject");
      toast.success(data.message || "Rejected");
      nav("/");
    } catch (err) {
      const m = err.response && err.response.data && err.response.data.message;
      toast.error(m || "Could not reject");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !order) {
    return <p className="p-8 text-center text-slate-500">Loading...</p>;
  }

  const u = order.user || {};
  const pending = order.deliveryResponse === "pending";
  const accepted = order.deliveryResponse === "accepted";
  const mapUrl = order.address ? "https://www.google.com/maps/search/?api=1&query=" + mapsQuery(order.address) : null;

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6 pb-24">
      <Link to="/" className="text-sm text-orange-600 font-medium mb-4 inline-block">
        Back to list
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-orange-500 text-white px-4 py-3 flex justify-between items-center">
          <span className="font-mono text-sm opacity-90">#{order._id.slice(-8)}</span>
          <span className="text-sm font-semibold">
            {pending ? "Offer pending" : accepted ? "Out for delivery" : order.deliveryResponse || "—"}
          </span>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase">Customer</h2>
            <p className="font-semibold text-slate-900">{u.name || "—"}</p>
            {u.phone && (
              <a href={"tel:" + u.phone} className="text-orange-600 text-sm font-medium">
                {u.phone}
              </a>
            )}
            {u.email && <p className="text-sm text-slate-600">{u.email}</p>}
          </div>

          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase">Drop-off address</h2>
            <p className="text-slate-800">{order.address && order.address.line1}</p>
            <p className="text-sm text-slate-600">
              {[order.address && order.address.city, order.address && order.address.pincode].filter(Boolean).join(", ")}
            </p>
            {mapUrl && (
              <a href={mapUrl} target="_blank" rel="noreferrer" className="text-sm text-orange-600 font-medium mt-2 inline-block">
                Open in Maps
              </a>
            )}
          </div>

          {order.chef && order.chef.name && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase">Kitchen</h2>
              <p className="text-slate-800">Chef {order.chef.name}</p>
            </div>
          )}

          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase">Items</h2>
            <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg mt-2">
              {(order.items || []).map((it, i) => (
                <li key={i} className="flex justify-between px-3 py-2 text-sm">
                  <span>
                    {it.name || (it.food && it.food.name)} x {it.quantity}
                  </span>
                  <span className="text-slate-600">INR {(it.price || 0) * (it.quantity || 1)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <span className="text-slate-600">Payment</span>
            <span className="font-medium capitalize">{order.paymentStatus || "—"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-xl font-bold text-orange-600">INR {order.totalAmount}</span>
          </div>
        </div>
      </div>

      {pending && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-slate-200 flex gap-3 max-w-lg mx-auto">
          <button
            type="button"
            disabled={busy}
            onClick={reject}
            className="flex-1 py-3 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={accept}
            className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            Accept
          </button>
        </div>
      )}
    </div>
  );
}
