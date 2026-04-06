import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";
import Loading from "../components/Loading.jsx";

const labels = {
  pending: "Pending",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client
      .get("/orders/mine")
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-2xl font-bold">Order history</h1>
      {orders.map((o) => (
        <Link
          key={o._id}
          to={"/orders/" + o._id}
          className="block bg-white rounded-xl border border-orange-100 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm text-gray-500">{o._id.slice(-8)}</span>
            <span
              className={
                "text-xs font-semibold px-2 py-1 rounded-full " +
                (o.status === "delivered" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800")
              }
            >
              {labels[o.status] || o.status}
            </span>
          </div>
          <p className="mt-2 font-semibold text-orange-600">INR {o.totalAmount}</p>
          <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
        </Link>
      ))}
      {orders.length === 0 && <p className="text-gray-500">No orders yet.</p>}
    </div>
  );
}
