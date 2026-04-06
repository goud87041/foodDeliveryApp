import { Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "./context/AdminAuth.jsx";
import Layout from "./components/Layout.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminRegister from "./pages/AdminRegister.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import OrdersAdmin from "./pages/OrdersAdmin.jsx";
import OrderDetailAdmin from "./pages/OrderDetailAdmin.jsx";
import UsersAdmin from "./pages/UsersAdmin.jsx";
import Tracking from "./pages/Tracking.jsx";
import ChefsAdmin from "./pages/ChefsAdmin.jsx";
import FoodsAdmin from "./pages/FoodsAdmin.jsx";
import ReviewsAdmin from "./pages/ReviewsAdmin.jsx";

function Private({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) return <p className="p-8">Loading...</p>;
  if (!admin) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/register" element={<AdminRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <Private>
            <Layout />
          </Private>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<OrdersAdmin />} />
        <Route path="orders/:id" element={<OrderDetailAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
        <Route path="tracking" element={<Tracking />} />
        <Route path="chefs" element={<ChefsAdmin />} />
        <Route path="foods" element={<FoodsAdmin />} />
        <Route path="reviews" element={<ReviewsAdmin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
