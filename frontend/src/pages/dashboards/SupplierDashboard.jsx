import { useState, useEffect } from "react";
import {
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  Package,
  DollarSign,
} from "lucide-react";
import Card from "../../components/common/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const SupplierDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 28,
    pendingOrders: 5,
    completedOrders: 20,
    totalRevenue: 45600,
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  const monthlyOrders = [
    { month: "Jan", orders: 12 },
    { month: "Feb", orders: 15 },
    { month: "Mar", orders: 18 },
    { month: "Apr", orders: 22 },
    { month: "May", orders: 25 },
    { month: "Jun", orders: 28 },
  ];

  const orderStatus = [
    { name: "Completed", value: 20, color: "#10B981" },
    { name: "Pending", value: 5, color: "#F97316" },
    { name: "Cancelled", value: 3, color: "#EF4444" },
  ];

  if (loading) {
    return <LoadingSpinner text="Loading supplier dashboard..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900">Supplier Dashboard</h1>
        <p className="text-dark-600 mt-2">
          Track your orders, deliveries, and performance metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-primary text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Orders</p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalOrders}</h3>
            </div>
            <ShoppingCart size={40} className="opacity-80" />
          </div>
        </Card>

        <Card className="bg-gradient-orange text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending Orders</p>
              <h3 className="text-3xl font-bold mt-2">{stats.pendingOrders}</h3>
            </div>
            <Clock size={40} className="opacity-80" />
          </div>
        </Card>

        <Card className="bg-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Completed</p>
              <h3 className="text-3xl font-bold mt-2">
                {stats.completedOrders}
              </h3>
            </div>
            <CheckCircle size={40} className="opacity-80" />
          </div>
        </Card>

        <Card className="bg-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-2">
                ${stats.totalRevenue.toLocaleString()}
              </h3>
            </div>
            <DollarSign size={40} className="opacity-80" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center">
            <TrendingUp size={20} className="mr-2 text-primary" />
            Order Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#F97316"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center">
            <Package size={20} className="mr-2 text-primary" />
            Order Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Purchase Orders */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-900 mb-4">
          Recent Purchase Orders
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-600">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-600">
                  Product
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-600">
                  Quantity
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-600">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  id: "PO-001",
                  product: "Electronics Kit",
                  qty: 50,
                  amount: 2500,
                  status: "Pending",
                },
                {
                  id: "PO-002",
                  product: "Office Supplies",
                  qty: 100,
                  amount: 1200,
                  status: "Completed",
                },
                {
                  id: "PO-003",
                  product: "Furniture Set",
                  qty: 20,
                  amount: 8000,
                  status: "Pending",
                },
              ].map((order, idx) => (
                <tr key={idx} className="border-b border-dark-100">
                  <td className="py-3 px-4 text-sm text-dark-900">
                    {order.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-dark-900">
                    {order.product}
                  </td>
                  <td className="py-3 px-4 text-sm text-dark-900">
                    {order.qty}
                  </td>
                  <td className="py-3 px-4 text-sm text-dark-900">
                    ${order.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        order.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SupplierDashboard;
