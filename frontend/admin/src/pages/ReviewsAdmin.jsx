import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import client from "../api/client.js";

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [type, setType] = useState("");
  const [averages, setAverages] = useState(null);

  function load() {
    const params = {};
    if (type) params.type = type;
    client.get("/admin/reviews", { params }).then((res) => setReviews(res.data.reviews));
  }

  useEffect(() => {
    load();
  }, [type]);

  useEffect(() => {
    client.get("/reviews/aggregates").then((res) => setAverages(res.data.averages));
  }, []);

  async function del(id) {
    if (!confirm("Delete review?")) return;
    await client.delete("/admin/reviews/" + id);
    toast.success("Deleted");
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reviews</h1>
      {averages && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-4">
            <p className="text-sm text-gray-500">Food avg</p>
            <p className="text-xl font-bold">{averages.food.avg}</p>
            <p className="text-xs text-gray-400">{averages.food.count} reviews</p>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <p className="text-sm text-gray-500">Delivery avg</p>
            <p className="text-xl font-bold">{averages.delivery.avg}</p>
            <p className="text-xs text-gray-400">{averages.delivery.count} reviews</p>
          </div>
          <div className="bg-white border rounded-xl p-4">
            <p className="text-sm text-gray-500">Restaurant avg</p>
            <p className="text-xl font-bold">{averages.restaurant.avg}</p>
            <p className="text-xs text-gray-400">{averages.restaurant.count} reviews</p>
          </div>
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        <select className="border rounded-lg px-3 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="food">Food</option>
          <option value="delivery">Delivery</option>
          <option value="restaurant">Restaurant</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border divide-y">
        {reviews.map((r) => (
          <div key={r._id} className="p-4">
            <div className="flex justify-between gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-800">{r.type}</span>
              <span className="text-orange-600 font-bold">{r.rating} stars</span>
            </div>
            <p className="text-sm mt-2">{r.comment}</p>
            <p className="text-xs text-gray-500 mt-1">
              {r.user && r.user.name} · {r.food && r.food.name}
              {r.deliveryBoy && " · " + r.deliveryBoy.name}
            </p>
            <button type="button" className="text-sm text-red-600 mt-2" onClick={() => del(r._id)}>
              Delete
            </button>
          </div>
        ))}
        {reviews.length === 0 && <p className="p-8 text-center text-gray-500">No reviews</p>}
      </div>
    </div>
  );
}
