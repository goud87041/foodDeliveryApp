import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { resolveMediaUrl } from "../lib/resolveMediaUrl.js";
import { useCart } from "../context/CartContext.jsx";
import Loading from "../components/Loading.jsx";
import StarRating from "../components/StarRating.jsx";

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    const params = cat ? { category: cat } : {};
    client
      .get("/foods", { params })
      .then((res) => setFoods(res.data.foods))
      .catch(() => toast.error("Could not load menu"))
      .finally(() => setLoading(false));
  }, [cat]);

  const categories = Array.from(new Set(foods.map((f) => f.category).filter(Boolean)));

  if (loading) return <Loading label="Loading menu..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Order your <span className="text-orange-500">favorites</span>
        </h1>
        <p className="mt-2 text-gray-600">Browse the menu and add to cart.</p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setCat("")}
            className={
              !cat
                ? "px-4 py-2 rounded-full text-sm font-medium bg-orange-500 text-white shadow-md"
                : "px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-600 border border-gray-200"
            }
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={
                cat === c
                  ? "px-4 py-2 rounded-full text-sm font-medium bg-orange-500 text-white shadow-md"
                  : "px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-600 border border-gray-200"
              }
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {foods.map((food, idx) => (
          <article
            key={food._id}
            className="bg-white rounded-2xl shadow-card border border-orange-50 overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in"
            style={{ animationDelay: String(idx * 40) + "ms" }}
          >
            <div className="h-48 bg-orange-50 overflow-hidden">
              {food.image ? (
                <img src={resolveMediaUrl(food.image)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-orange-300 text-4xl font-light">
                  FD
                </div>
              )}
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <h2 className="font-semibold text-gray-900">{food.name}</h2>
                <span className="text-orange-600 font-bold whitespace-nowrap">INR {food.price}</span>
              </div>
              {food.totalReviews > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <StarRating value={Math.round(food.avgRating || 0)} disabled size="sm" />
                  <span>
                    {Number(food.avgRating || 0).toFixed(1)} ({food.totalReviews})
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-600 line-clamp-2">{food.description}</p>
              <button
                type="button"
                disabled={!food.available}
                onClick={() => {
                  addItem(food);
                  toast.success("Added to cart");
                }}
                className="w-full mt-2 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {food.available ? "Add to cart" : "Unavailable"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {foods.length === 0 && <p className="text-center text-gray-500 py-12">No items yet.</p>}
    </div>
  );
}
