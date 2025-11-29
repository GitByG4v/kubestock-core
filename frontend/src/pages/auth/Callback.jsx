import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AsgardeoAuthContext";
import { Loader2 } from "lucide-react";

const Callback = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for authentication to complete
    if (isAuthenticated && user) {
      const role = user.role;
      
      // Redirect based on role
      if (role === "admin") {
        navigate("/dashboard/admin", { replace: true });
      } else if (role === "warehouse_staff") {
        navigate("/dashboard/warehouse", { replace: true });
      } else if (role === "supplier") {
        navigate("/dashboard/supplier", { replace: true });
      } else {
        navigate("/products", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completing Sign In...
        </h2>
        <p className="text-gray-600">
          Please wait while we redirect you to your dashboard.
        </p>
      </div>
    </div>
  );
};

export default Callback;
