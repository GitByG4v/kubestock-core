import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AsgardeoAuthContext";
import Button from "../../components/common/Button";
import { Shield } from "lucide-react";

const Login = () => {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    console.log("🔍 Login useEffect - Checking auth:", { isAuthenticated, user: user?.username, role: user?.role });
    if (isAuthenticated && user) {
      const role = user.role;
      console.log("✅ User is authenticated, redirecting to dashboard for role:", role);
      if (role === "admin") {
        console.log("  → Navigating to /dashboard/admin");
        navigate("/dashboard/admin", { replace: true });
      } else if (role === "warehouse_staff") {
        console.log("  → Navigating to /dashboard/warehouse");
        navigate("/dashboard/warehouse", { replace: true });
      } else if (role === "supplier") {
        console.log("  → Navigating to /dashboard/supplier");
        navigate("/dashboard/supplier", { replace: true });
      } else {
        console.log("  → Navigating to /products");
        navigate("/products", { replace: true });
      }
    } else {
      console.log("⏳ Not redirecting - isAuthenticated:", isAuthenticated, "user:", !!user);
    }
  }, [isAuthenticated, user, navigate]);

  const handleAsgardeoLogin = async () => {
    console.log("🚀 Starting Asgardeo login...");
    console.log("  Current URL:", window.location.href);
    console.log("  Current Origin:", window.location.origin);
    setLoading(true);
    try {
      console.log("  Calling login() function...");
      await login();
      console.log("  Login() completed successfully");
    } catch (error) {
      console.error("❌ Login error:", error);
      console.error("  Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    } finally {
      setLoading(false);
      console.log("  Login process finished");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary-100 rounded-full">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-dark-900">Welcome Back</h2>
        <p className="text-dark-600 mt-2">
          Secure authentication with Asgardeo
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-dark-200">
        <div className="space-y-6">
          <div className="text-center p-6 bg-primary-50 rounded-lg">
            <h3 className="text-lg font-semibold text-dark-900 mb-2">
              Sign In with Asgardeo
            </h3>
            <p className="text-dark-600 mb-4">
              This application uses WSO2 Asgardeo for secure authentication.
              Click below to sign in through Asgardeo.
            </p>
            <Button
              onClick={handleAsgardeoLogin}
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
              loading={loading}
            >
              <Shield className="w-5 h-5" />
              {loading ? "Redirecting..." : "Sign In with Asgardeo"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-dark-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-dark-500">
        <p>© 2025 Inventory Management System. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;
