import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cart() {
  const { items, setQty, removeItem, total } = useCart();
  const { user } = useAuth();
  if (!items.length) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-orange-50">
        <p className="text-gray-600">Cart is empty.</p>
        <Link to="/" className="inline-block mt-4 text-orange-600 font-medium">
          Browse menu
        </Link>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Cart</h1>
      <ul className="space-y-3">
        {items.map((line) => (
          <li key={line.foodId} className="flex gap-4 items-center bg-white rounded-xl border p-4">
            <div className="flex-1">
              <p className="font-medium">{line.name}</p>
              <p className="text-sm text-orange-600">INR {line.price}</p>
            </div>
            <button type="button" className="px-2 border rounded" onClick={() => setQty(line.foodId, line.quantity - 1)}>
              -
            </button>
            <span className="w-6 text-center">{line.quantity}</span>
            <button type="button" className="px-2 border rounded" onClick={() => setQty(line.foodId, line.quantity + 1)}>
              +
            </button>
            <button type="button" className="text-red-500 text-sm" onClick={() => removeItem(line.foodId)}>
              X
            </button>
          </li>
        ))}
      </ul>
      <p className="text-lg font-bold">Total: INR {total}</p>
      {user ? (
        <Link to="/checkout" className="block text-center py-3 rounded-xl bg-orange-500 text-white font-semibold">
          Checkout
        </Link>
      ) : (
        <Link to="/login" className="block text-center py-3 rounded-xl bg-orange-500 text-white font-semibold">
          Log in to checkout
        </Link>
      )}
    </div>
  );
}

