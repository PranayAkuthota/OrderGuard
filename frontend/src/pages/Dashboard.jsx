import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../services/orderService";
import { getProducts } from "../services/productService";
import { getCustomers } from "../services/customerService";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Boxes,
  Users,
  DollarSign
} from "lucide-react";
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
  BarChart,
  Bar,
  Legend
} from "recharts";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [orderRes, prodRes, custRes] = await Promise.all([
          getOrders({ limit: 100 }), // Fetch up to 100 recent orders for stats
          getProducts({ limit: 100 }),
          getCustomers({ limit: 100 }).catch(() => ({ total: 0 }))
        ]);

        setOrders(orderRes?.orders || []);
        setProducts(prodRes?.products || []);
        setCustomersCount(custRes?.total || 0);
      } catch (err) {
        console.error("Dashboard data load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  // --- STATS CALCULATIONS ---
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING" || o.status === "CONFIRMED").length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length;
  const totalProducts = products.length;
  const inventoryCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalRevenue = orders.reduce((sum, o) => (o.status !== "CANCELLED" ? sum + o.totalPrice : sum), 0);

  // Recent 5 orders for table
  const recentOrders = orders.slice(0, 5);

  // --- CHART DATA PREPARATION ---

  // 1. Line Chart: Daily sales trend
  const dailyDataMap = {};
  orders
    .filter((o) => o.status !== "CANCELLED")
    .forEach((o) => {
      const dateStr = new Date(o.createdAt).toLocaleDateString([], { month: "short", day: "numeric" });
      dailyDataMap[dateStr] = (dailyDataMap[dateStr] || 0) + o.totalPrice;
    });

  const salesTrendData = Object.keys(dailyDataMap)
    .map((date) => ({ date, Sales: parseFloat(dailyDataMap[date].toFixed(2)) }))
    .reverse() // Chronological order
    .slice(-7); // Last 7 days with sales

  // 2. Pie Chart: Order status distribution
  const statusCounts = {
    Pending: orders.filter((o) => o.status === "PENDING").length,
    Confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
    Packed: orders.filter((o) => o.status === "PACKED").length,
    Shipped: orders.filter((o) => o.status === "SHIPPED").length,
    Delivered: orders.filter((o) => o.status === "DELIVERED").length,
    Cancelled: orders.filter((o) => o.status === "CANCELLED").length
  };

  const pieChartData = Object.keys(statusCounts)
    .map((key) => ({ name: key, value: statusCounts[key] }))
    .filter((d) => d.value > 0);

  const COLORS = ["#f59e0b", "#3b82f6", "#6366f1", "#a855f7", "#10b981", "#ef4444"];

  // 3. Bar Chart: Stock levels of top products
  const stockChartData = products
    .slice(0, 5) // Top 5 products
    .map((p) => ({
      name: p.name.length > 12 ? p.name.substring(0, 12) + "..." : p.name,
      Stock: p.stock,
      Reserved: p.reservedStock
    }));

  const cardStats = [
    { title: "Revenue", value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400" },
    { title: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400" },
    { title: "Pending Orders", value: pendingOrders, icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400" },
    { title: "Delivered Orders", value: deliveredOrders, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400" },
    { title: "Cancelled Orders", value: cancelledOrders, icon: XCircle, color: "text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400" },
    { title: "Total Products", value: totalProducts, icon: Boxes, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400" },
    { title: "Inventory stock", value: inventoryCount, icon: Boxes, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400" },
    { title: "Active Customers", value: customersCount, icon: Users, color: "text-teal-600 bg-teal-50 dark:bg-teal-950/20 dark:text-teal-400" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header and Welcome */}
      <div className="flex flex-col space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Seller Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-secondary-400">
          Overview of your store sales, processing queues, and inventory level statistics.
        </p>
      </div>

      {/* Grid of stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="flex items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow dark:bg-secondary-800 dark:border-secondary-700/50"
            >
              <div className={`p-3 rounded-lg mr-4 ${stat.color}`}>
                <Icon size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-secondary-400 uppercase tracking-wider">
                  {stat.title}
                </p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {stat.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recharts Graphics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales trend */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
              <TrendingUp size={16} className="text-primary-600 mr-2" />
              Daily Sales Trend (Revenue)
            </h3>
          </div>
          <div className="h-64">
            {salesTrendData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                No sales logged in the past week.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                  />
                  <Line type="monotone" dataKey="Sales" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Order status split */}
        <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Order Status Share
          </h3>
          <div className="h-64 flex flex-col items-center justify-center">
            {pieChartData.length === 0 ? (
              <div className="text-xs text-slate-400">No active orders placed.</div>
            ) : (
              <>
                <div className="w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Labels legend */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] w-full text-center">
                  {pieChartData.map((d, index) => (
                    <div key={d.name} className="flex items-center justify-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-slate-600 dark:text-secondary-400 font-medium truncate max-w-[50px]">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Product Stock metrics */}
        <div className="lg:col-span-3 p-5 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
            Inventory &amp; Reserved Levels (Top Products)
          </h3>
          <div className="h-64">
            {stockChartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                No catalog items found. Add products to view.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Stock" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Available Stock" />
                  <Bar dataKey="Reserved" fill="#a855f7" radius={[4, 4, 0, 0]} name="Reserved Stock" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders table */}
      <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Recent Orders
          </h3>
          <Link
            to="/orders"
            className="text-xs font-semibold text-primary-600 hover:underline dark:text-primary-400"
          >
            View all orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="When customers place orders, they will show up here."
            actionButton={
              <Link
                to="/orders/create"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 inline-block"
              >
                Create First Order
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase dark:border-secondary-700/50">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-secondary-700/30">
                {recentOrders.map((o) => (
                  <tr
                    key={o._id}
                    className="text-xs text-slate-700 hover:bg-slate-50/50 dark:text-secondary-300 dark:hover:bg-secondary-900/10"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-950 dark:text-white">
                      #{o._id.substring(o._id.length - 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{o.customerName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{o.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      ${o.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/orders/${o._id}`}
                        className="inline-flex items-center px-2.5 py-1.5 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50 dark:border-secondary-750 dark:text-secondary-300 dark:hover:bg-secondary-900"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
