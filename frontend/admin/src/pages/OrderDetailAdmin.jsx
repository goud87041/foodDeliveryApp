import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { io } from "socket.io-client";

function socketUrl() {
  const u = import.meta.env.VITE_SOCKET_URL;
  if (u) return u;
  if (import.meta.env.DEV) return "http://localhost:5000";
  return window.location.origin;
}

export default function OrderDetailAdmin() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [chefs, setChefs] = useState([]);
  const [status, setStatus] = useState("");
  const [chefId, setChefId] = useState("");

  function load() {
    return client.get("/orders/admin/" + id).then((res) => {
      setOrder(res.data.order);
      setStatus(res.data.order.status);
      setChefId(res.data.order.chef && res.data.order.chef._id ? res.data.order.chef._id : res.data.order.chef || "");
    });
  }

  useEffect(() => {
    load();
    client.get("/admin/chefs").then((res) => setChefs(res.data.chefs));
  }, [id]);

  useEffect(() => {
    const s = io(socketUrl());
    s.emit("join:admin");
    function onUp(payload) {
      if (payload.orderId === id || (payload.order && payload.order._id === id)) {
        setOrder(payload.order);
        setStatus(payload.order.status);
      }
    }
    s.on("order:updated", onUp);
    s.on("order:created", onUp);
    return () => {
      s.disconnect();
    };
  }, [id]);

  async function saveStatus() {
    try {
      const { data } = await client.patch("/orders/admin/" + id + "/status", { status });
      setOrder(data.order);
      toast.success("Status updated");
    } catch (err) {
      const m = err.response && err.response.data && err.response.data.message;
      toast.error(m || "Failed");
    }
  }

  async function saveChef() {
    try {
      const { data } = await client.patch("/orders/admin/" + id + "/chef", { chefId: chefId || null });
      setOrder(data.order);
      toast.success("Chef updated");
    } catch (err) {
      toast.error("Failed");
    }
  }

  if (!order) return <p className="p-8">Loading...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/orders" className="text-sm text-orange-600">
        Back to orders
      </Link>
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h1 className="text-xl font-bold">Order detail</h1>
        <p className="text-sm text-gray-500 font-mono">{order._id}</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500 block">Status</label>
            <select className="border rounded-lg px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button type="button" onClick={saveStatus} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
            Save status
          </button>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500 block">Chef</label>
            <select className="border rounded-lg px-3 py-2 min-w-[180px]" value={chefId} onChange={(e) => setChefId(e.target.value)}>
              <option value="">Unassigned</option>
              {chefs.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={saveChef} className="px-4 py-2 border border-orange-200 rounded-lg text-sm">
            Assign chef
          </button>
        </div>
        <div className="border-t pt-4 text-sm space-y-1">
          <p>
            <strong>Customer:</strong> {order.user && order.user.name} ({order.user && order.user.email})
          </p>
          <p>
            <strong>Address:</strong> {order.address && order.address.line1}
          </p>
          {order.chef && <p>Chef: {order.chef.name}</p>}
          {order.deliveryBoy && (
            <p>
              Delivery: {order.deliveryBoy.name} ({order.deliveryBoy.status})
              {order.deliveryResponse && (
                <span className="ml-2 text-orange-600 font-medium"> — {order.deliveryResponse}</span>
              )}
            </p>
          )}
        </div>
        <ul className="border rounded-lg divide-y text-sm">
          {(order.items || []).map((it, i) => (
            <li key={i} className="p-3 flex justify-between">
              <span>
                {it.name || (it.food && it.food.name)} x {it.quantity}
              </span>
              <span>INR {(it.price || 0) * (it.quantity || 1)}</span>
            </li>
          ))}
        </ul>
        <p className="font-bold text-orange-600">Total INR {order.totalAmount}</p>
      </div>
    </div>
  );
}
