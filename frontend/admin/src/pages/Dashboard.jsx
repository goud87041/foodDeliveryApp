import { useEffect, useState } from "react";
import client from "../api/client.js";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    client.get("/admin/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  const s = data.stats;
  const chartData = (data.ordersByDay || []).map((d) => ({ day: d._id, orders: d.count }));

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-orange-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total orders</p>
          <p className="text-2xl font-bold text-orange-600">{s.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-orange-600">{s.activeOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{s.completedOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 p-4 shadow-sm">
          <p className="text-sm text-gray-500">Revenue (paid)</p>
          <p className="text-2xl font-bold text-gray-900">INR {s.revenue}</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Orders (last 7 days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Users</p>
          <p className="text-xl font-bold">{s.users}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Restaurant rating</p>
          <p className="text-xl font-bold">
            {Number(s.restaurantRating || 0).toFixed(1)} ({s.restaurantReviews || 0} reviews)
          </p>
        </div>
      </div>
    </div>
  );
}

