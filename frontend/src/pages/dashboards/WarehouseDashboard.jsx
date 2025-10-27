import { useState, useEffect } from "react";
import {
  Package,
  TrendingUp,
  AlertCircle,
  Activity,
  Box,
  CheckCircle,
} from "lucide-react";
import Card from "../../components/common/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { inventoryService } from "../../services/inventoryService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const WarehouseDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInventory: 0,
    lowStockItems: 0,
    pendingAdjustments: 0,
    todayMovements: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const inventory = await inventoryService.getAllInventory();

      setStats({
        totalInventory:
          inventory.data?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        lowStockItems:
          inventory.data?.filter((item) => item.quantity < item.min_quantity)
            .length || 0,
        pendingAdjustments: 3,
        todayMovements: 15,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stockData = [
    { name: "Electronics", stock: 450 },
    { name: "Clothing", stock: 320 },
    { name: "Food", stock: 280 },
    { name: "Furniture", stock: 150 },
    { name: "Others", stock: 200 },
  ];

  if (loading) {
    return <LoadingSpinner text="Loading warehouse dashboard..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-900">
          Warehouse Dashboard
        </h1>
        <p className="text-dark-600 mt-2">
          Monitor stock levels and manage inventory operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-dark text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Inventory</p>
              <h3 className="text-3xl font-bold mt-2">
                {stats.totalInventory}
              </h3>
            </div>
            <Box size={40} className="opacity-80" />
          </div>
        </Card>

        <Card className="bg-gradient-orange text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Low Stock Alert</p>
              <h3 className="text-3xl font-bold mt-2">{stats.lowStockItems}</h3>
            </div>
            <AlertCircle size={40} className="opacity-80" />
          </div>
        </Card>

        <Card className="bg-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Pending Adjustments</p>
              <h3 className="text-3xl font-bold mt-2">
                {stats.pendingAdjustments}
              </h3>
            </div>
            <Activity size={40} className="opacity-80" />
          </div>
        </Card>

        <Card className="bg-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Today's Movements</p>
              <h3 className="text-3xl font-bold mt-2">
                {stats.todayMovements}
              </h3>
            </div>
            <TrendingUp size={40} className="opacity-80" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center">
            <Package size={20} className="mr-2 text-primary" />
            Stock by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stock" fill="#1E293B" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center">
            <AlertCircle size={20} className="mr-2 text-orange-600" />
            Low Stock Items
          </h3>
          <div className="space-y-3">
            {[
              { name: "Product A", qty: 5, min: 20 },
              { name: "Product B", qty: 8, min: 25 },
              { name: "Product C", qty: 3, min: 15 },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
              >
                <div>
                  <p className="text-sm font-medium text-dark-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-dark-500">
                    Current: {item.qty} | Min: {item.min}
                  </p>
                </div>
                <AlertCircle size={20} className="text-orange-600" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Stock Movements */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-900 mb-4">
          Recent Stock Movements
        </h3>
        <div className="space-y-3">
          {[
            { type: "IN", product: "Product X", qty: 50, time: "10 mins ago" },
            { type: "OUT", product: "Product Y", qty: 25, time: "30 mins ago" },
            { type: "IN", product: "Product Z", qty: 100, time: "1 hour ago" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center p-3 bg-dark-50 rounded-lg"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                  item.type === "IN" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {item.type === "IN" ? (
                  <CheckCircle size={20} />
                ) : (
                  <Activity size={20} />
                )}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-dark-900">
                  {item.type === "IN" ? "Stock In" : "Stock Out"}:{" "}
                  {item.product}
                </p>
                <p className="text-xs text-dark-500">
                  Quantity: {item.qty} • {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WarehouseDashboard;
