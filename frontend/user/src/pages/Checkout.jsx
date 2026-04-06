import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import client from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    if (user && user.address) {
      setLine1(user.address.line1 || "");
      setCity(user.address.city || "");
      setPincode(user.address.pincode || "");
    }
  }, [user]);
  const [busy, setBusy] = useState(false);

  async function payAndPlace(orderId) {
    const payRes = await client.post("/payments/razorpay/create-order", { orderId });
    if (payRes.data.mock) {
      toast.success("Order placed (dev: payment skipped).");
      return;
    }
    const key = payRes.data.keyId;
    const amount = payRes.data.amount;
    const rpOrderId = payRes.data.razorpayOrderId;
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        if (!window.Razorpay) {
          reject(new Error("Razorpay failed to load"));
          return;
        }
        const options = {
          key,
          amount,
          currency: payRes.data.currency || "INR",
          name: "FoodDelivery",
          order_id: rpOrderId,
          handler: async function (response) {
            try {
              await client.post("/payments/razorpay/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId,
              });
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          modal: { ondismiss: () => reject(new Error("cancelled")) },
        };
        new window.Razorpay(options).open();
      };
      script.onerror = () => reject(new Error("Script error"));
      document.body.appendChild(script);
    });
    toast.success("Payment successful!");
  }

  async function submit(e) {
    e.preventDefault();
    if (!items.length) {
      toast.error("Cart is empty");
      return;
    }
    setBusy(true);
    try {
      const { data } = await client.post("/orders", {
        items: items.map((i) => ({ foodId: i.foodId, quantity: i.quantity })),
        address: { line1, city, pincode },
      });
      await payAndPlace(data.order._id);
      clear();
      nav("/orders/" + data.order._id);
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message;
      toast.error(msg || "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-card border border-orange-100 p-8 animate-fade-in">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <p className="text-sm text-gray-500 mt-1">Total: INR {total}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input
            className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pincode</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-60"
        >
          {busy ? "Processing..." : "Place order and pay"}
        </button>
      </form>
    </div>
  );
}
