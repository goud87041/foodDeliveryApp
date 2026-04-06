import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { createUserSocket } from "../lib/socket.js";
import Loading from "../components/Loading.jsx";
import StarRating from "../components/StarRating.jsx";

const statusLabel = {
  pending: "Pending",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [foodRating, setFoodRating] = useState({});
  const [foodComment, setFoodComment] = useState({});
  const [delRating, setDelRating] = useState(5);
  const [delComment, setDelComment] = useState("");
  const [restRating, setRestRating] = useState(5);
  const [restComment, setRestComment] = useState("");

  const load = useCallback(() => {
    return client.get("/orders/mine/" + id).then((res) => {
      setOrder(res.data.order);
      return res.data.order;
    });
  }, [id]);

  useEffect(() => {
    load().catch(() => toast.error("Order not found")).finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (!user || !order) return;
    const socket = createUserSocket();
    socket.emit("join:user", user.id);
    function onUpdate(payload) {
      if (payload.orderId === id || (payload.order && payload.order._id === id)) {
        setOrder(payload.order);
      }
    }
    socket.on("order:updated", onUpdate);
    socket.on("order:created", onUpdate);
    return () => {
      socket.off("order:updated", onUpdate);
      socket.off("order:created", onUpdate);
      socket.disconnect();
    };
  }, [user, id, order && order._id]);

  useEffect(() => {
    if (!order || order.status !== "delivered") return;
    client.get("/reviews/order/" + id).then((res) => setReviews(res.data.reviews || []));
  }, [order, id]);

  async function submitFoodReview(foodId) {
    const rating = foodRating[foodId];
    if (!rating) {
      toast.error("Pick stars");
      return;
    }
    try {
      await client.post("/reviews", {
        orderId: id,
        foodId,
        rating,
        comment: foodComment[foodId] || "",
        type: "food",
      });
      toast.success("Food review saved");
      const res = await client.get("/reviews/order/" + id);
      setReviews(res.data.reviews || []);
    } catch (err) {
      const m = err.response && err.response.data && err.response.data.message;
      toast.error(m || "Failed");
    }
  }

  async function submitDeliveryReview() {
    try {
      await client.post("/reviews", {
        orderId: id,
        rating: delRating,
        comment: delComment,
        type: "delivery",
      });
      toast.success("Delivery review saved");
      const res = await client.get("/reviews/order/" + id);
      setReviews(res.data.reviews || []);
    } catch (err) {
      const m = err.response && err.response.data && err.response.data.message;
      toast.error(m || "Failed");
    }
  }

  async function submitRestaurantReview() {
    try {
      await client.post("/reviews", {
        orderId: id,
        rating: restRating,
        comment: restComment,
        type: "restaurant",
      });
      toast.success("Restaurant review saved");
      const res = await client.get("/reviews/order/" + id);
      setReviews(res.data.reviews || []);
    } catch (err) {
      const m = err.response && err.response.data && err.response.data.message;
      toast.error(m || "Failed");
    }
  }

  function hasReview(type, foodId) {
    return reviews.some((r) => {
      if (r.type !== type) return false;
      if (type === "food" && foodId) {
        const fid = r.food && r.food._id ? r.food._id : r.food;
        return String(fid) === String(foodId);
      }
      if (type === "food") return false;
      return true;
    });
  }

  if (loading || !order) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-orange-100 p-6 shadow-card">
        <div className="flex justify-between items-start">
          <h1 className="text-xl font-bold">Order</h1>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-800">
            {statusLabel[order.status] || order.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">{new Date(order.createdAt).toLocaleString()}</p>
        <p className="mt-4 font-semibold text-orange-600">INR {order.totalAmount}</p>
        <p className="text-sm text-gray-600 mt-2">
          {order.address && order.address.line1}
          {order.address && order.address.city ? ", " + order.address.city : ""}
        </p>
        {order.chef && order.chef.name && (
          <p className="text-sm mt-2">
            Chef: <span className="font-medium">{order.chef.name}</span>
          </p>
        )}
        {order.deliveryBoy && order.deliveryBoy.name && (
          <p className="text-sm mt-1">
            Delivery: <span className="font-medium">{order.deliveryBoy.name}</span>
          </p>
        )}
        {order.status === "out_for_delivery" && order.deliveryResponse === "pending" && (
          <p className="text-sm mt-3 text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            Waiting for the delivery partner to accept this run.
          </p>
        )}
        {order.deliveryLocation && order.deliveryLocation.lat != null && (
          <p className="text-xs text-gray-500 mt-2 font-mono">
            Simulated location: {order.deliveryLocation.lat.toFixed(4)}, {order.deliveryLocation.lng.toFixed(4)}
          </p>
        )}
        <ul className="mt-4 space-y-2 border-t border-orange-50 pt-4">
          {(order.items || []).map((it, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span>
                {it.name || (it.food && it.food.name)} x {it.quantity}
              </span>
              <span>INR {(it.price || 0) * (it.quantity || 1)}</span>
            </li>
          ))}
        </ul>
      </div>

      {order.status === "delivered" && (
        <div className="bg-white rounded-2xl border border-orange-100 p-6 space-y-6">
          <h2 className="font-bold text-lg">Reviews</h2>
          {(order.items || []).map((it) => {
            const foodId = it.food && it.food._id ? it.food._id : it.food;
            if (!foodId) return null;
            if (hasReview("food", foodId)) {
              return (
                <p key={String(foodId)} className="text-sm text-green-700">
                  You reviewed {it.name || "item"}.
                </p>
              );
            }
            return (
              <div key={String(foodId)} className="border border-orange-50 rounded-xl p-4 space-y-2">
                <p className="font-medium">{it.name || "Food"}</p>
                <StarRating value={foodRating[foodId] || 0} onChange={(n) => setFoodRating((s) => ({ ...s, [foodId]: n }))} />
                <textarea
                  className="w-full border rounded-lg p-2 text-sm"
                  placeholder="Optional comment"
                  value={foodComment[foodId] || ""}
                  onChange={(e) => setFoodComment((s) => ({ ...s, [foodId]: e.target.value }))}
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => submitFoodReview(foodId)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm"
                >
                  Submit food review
                </button>
              </div>
            );
          })}

          {order.deliveryBoy && !hasReview("delivery") && (
            <div className="border border-orange-50 rounded-xl p-4 space-y-2">
              <p className="font-medium">Delivery experience</p>
              <StarRating value={delRating} onChange={setDelRating} />
              <textarea
                className="w-full border rounded-lg p-2 text-sm"
                value={delComment}
                onChange={(e) => setDelComment(e.target.value)}
                rows={2}
              />
              <button type="button" onClick={submitDeliveryReview} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
                Submit
              </button>
            </div>
          )}
          {order.deliveryBoy && hasReview("delivery") && <p className="text-sm text-green-700">Delivery reviewed.</p>}

          {!hasReview("restaurant") && (
            <div className="border border-orange-50 rounded-xl p-4 space-y-2">
              <p className="font-medium">Restaurant overall</p>
              <StarRating value={restRating} onChange={setRestRating} />
              <textarea
                className="w-full border rounded-lg p-2 text-sm"
                value={restComment}
                onChange={(e) => setRestComment(e.target.value)}
                rows={2}
              />
              <button type="button" onClick={submitRestaurantReview} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
                Submit
              </button>
            </div>
          )}
          {hasReview("restaurant") && <p className="text-sm text-green-700">Restaurant reviewed.</p>}
        </div>
      )}
    </div>
  );
}

