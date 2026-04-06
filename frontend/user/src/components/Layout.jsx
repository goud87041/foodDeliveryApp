import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const nav = useNavigate();
  const count = items.reduce((s, x) => s + x.quantity, 0);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? "bg-orange-500 text-white shadow-md" : "text-gray-600 hover:bg-orange-50"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/80">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-orange-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="text-xl font-bold text-orange-500 tracking-tight">
            Food<span className="text-gray-800">Delivery</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={linkClass} end>
              Menu
            </NavLink>
            <NavLink to="/restaurant" className={linkClass}>
              Restaurant
            </NavLink>
            {user && (
              <>
                <NavLink to="/orders" className={linkClass}>
                  Orders
                </NavLink>
                <NavLink to="/profile" className={linkClass}>
                  Profile
                </NavLink>
              </>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold shadow-card hover:bg-orange-600 transition-colors"
            >
              Cart
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-white text-orange-600 text-xs font-bold border border-orange-200">
                  {count}
                </span>
              )}
            </Link>
            {user ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  nav("/");
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-orange-600"
              >
                Log out
              </button>
            ) : (
              <Link to="/login" className="px-3 py-2 text-sm font-medium text-orange-600">
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>
      <footer className="border-t border-orange-100 bg-white py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} FoodDelivery — Fresh & fast
      </footer>
    </div>
  );
}
