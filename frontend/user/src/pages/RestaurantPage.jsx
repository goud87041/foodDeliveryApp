import { useEffect, useState } from "react";
import client from "../api/client.js";
import Loading from "../components/Loading.jsx";
import StarRating from "../components/StarRating.jsx";

export default function RestaurantPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get("/restaurant"),
      client.get("/reviews/public", { params: { type: "restaurant" } }),
    ])
      .then(([rRes, revRes]) => {
        setRestaurant(rRes.data.restaurant);
        setReviews(revRes.data.reviews || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white rounded-2xl border border-orange-100 p-8 shadow-card text-center">
        <h1 className="text-3xl font-bold text-orange-500">{restaurant && restaurant.name}</h1>
        <div className="mt-4 flex justify-center items-center gap-3">
          <StarRating value={Math.round(restaurant && restaurant.avgRating) || 0} disabled size="lg" />
          <span className="text-gray-600">
            {Number((restaurant && restaurant.avgRating) || 0).toFixed(1)} ({(restaurant && restaurant.totalReviews) || 0} reviews)
          </span>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold mb-3">What diners say</h2>
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r._id} className="bg-white rounded-xl border border-orange-50 p-4">
              <div className="flex justify-between items-start">
                <span className="font-medium text-gray-800">{r.user && r.user.name}</span>
                <StarRating value={r.rating} disabled size="sm" />
              </div>
              {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
            </li>
          ))}
        </ul>
        {reviews.length === 0 && <p className="text-gray-500 text-sm">No restaurant reviews yet.</p>}
      </div>
    </div>
  );
}
