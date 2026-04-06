import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";

const labels = {
  pending: "Pending",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const params = filter ? { status: filter } : {};
    client.get("/orders/admin/all", { params }).then((res) => setOrders(res.data.orders));
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Orders</h1>
        <select className="border rounded-lg px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out_for_delivery">Out for delivery</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border divide-y">
        {orders.map((o) => (
          <Link key={o._id} to={"/orders/" + o._id} className="block p-4 hover:bg-orange-50/50">
            <div className="flex justify-between">
              <span className="font-mono text-xs text-gray-400">{o._id}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                {labels[o.status] || o.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{o.user && o.user.name}</p>
            <p className="font-semibold text-orange-600">INR {o.totalAmount}</p>
          </Link>
        ))}
        {orders.length === 0 && <p className="p-8 text-center text-gray-500">No orders</p>}
      </div>
    </div>
  );
}

