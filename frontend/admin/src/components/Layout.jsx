import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuth.jsx";

function navClass({ isActive }) {
  return (
    "block px-4 py-2 rounded-lg text-sm font-medium " +
    (isActive ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-orange-50")
  );
}

export default function Layout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-white border-r border-orange-100 flex flex-col shrink-0">
        <div className="p-4 border-b border-orange-50">
          <p className="font-bold text-orange-500">FoodDelivery</p>
          <p className="text-xs text-gray-500 truncate">{admin && admin.adminId}</p>
        </div>
        <nav className="p-2 space-y-1 flex-1">
          <NavLink to="/" end className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/orders" className={navClass}>
            Orders
          </NavLink>
          <NavLink to="/users" className={navClass}>
            Users
          </NavLink>
          <NavLink to="/tracking" className={navClass}>
            Live tracking
          </NavLink>
          <NavLink to="/chefs" className={navClass}>
            Chefs
          </NavLink>
          <NavLink to="/foods" className={navClass}>
            Foods
          </NavLink>
          <NavLink to="/reviews" className={navClass}>
            Reviews
          </NavLink>
        </nav>
        <button
          type="button"
          className="m-2 p-2 text-sm text-red-600 border border-red-100 rounded-lg"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Log out
        </button>
      </aside>
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}

