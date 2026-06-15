import { Routes, Route, Navigate } from "react-router-dom";
import { useDeliveryAuth } from "./context/DeliveryAuth.jsx";
import Login from "./pages/Login.jsx";
import Registration from "./pages/Registration.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import { AuthGateSkeleton } from "./components/Skeleton.jsx";

function Private({ children }) {
  const { partner, loading } = useDeliveryAuth();
  if (loading) return <AuthGateSkeleton />;
  if (!partner) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />
      <Route
        path="/"
        element={
          <Private>
            <Dashboard />
          </Private>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <Private>
            <OrderDetail />
          </Private>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
