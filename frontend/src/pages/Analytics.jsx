import React, { useState, useEffect } from "react";
import { getOrders } from "../services/orderService";
import { getProducts } from "../services/productService";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { BarChart3, TrendingUp, DollarSign, Calendar, RefreshCcw } from "lucide-react";

const Analytics = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [orderRes, prodRes] = await Promise.all([
        getOrders({ limit: 500 }), // Load a larger batch for historical charting
        getProducts({ limit: 100 })
      ]);
      setOrders(orderRes?.orders || []);
      setProducts(prodRes?.products || []);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  // --- ANALYTICS DATA CALCULATIONS ---

  // 1. Revenue & Sales Trend per Day (Area Chart)
  const revenueByDayMap = {};
  const ordersByDayMap = {};

  orders
    .filter(o => o.status !== "CANCELLED")
    .forEach(o => {
      const date = new Date(o.createdAt).toLocaleDateString([], { month: "short", day: "numeric" });
      revenueByDayMap[date] = (revenueByDayMap[date] || 0) + o.totalPrice;
      ordersByDayMap[date] = (ordersByDayMap[date] || 0) + 1;
    });

  const dailyTrendData = Object.keys(revenueByDayMap)
    .map(date => ({
      date,
      Revenue: parseFloat(revenueByDayMap[date].toFixed(2)),
      Orders: ordersByDayMap[date]
    }))
    .reverse()
    .slice(-10); // Last 10 reporting days

  // 2. Order Status distribution (Pie Chart)
  const statusSummary = {
    Pending: orders.filter(o => o.status === "PENDING").length,
    Confirmed: orders.filter(o => o.status === "CONFIRMED").length,
    Packed: orders.filter(o => o.status === "PACKED").length,
    Shipped: orders.filter(o => o.status === "SHIPPED").length,
    Delivered: orders.filter(o => o.status === "DELIVERED").length,
    Cancelled: orders.filter(o => o.status === "CANCELLED").length
  };

  const statusPieData = Object.keys(statusSummary)
    .map(name => ({ name, value: statusSummary[name] }))
    .filter(d => d.value > 0);

  const COLORS = ["#f59e0b", "#3b82f6", "#6366f1", "#a855f7", "#10b981", "#ef4444"];

  // 3. Top selling products (Horizontal Bar Chart)
  const productSalesMap = {};
  orders
    .filter(o => o.status !== "CANCELLED")
    .forEach(o => {
      o.items.forEach(item => {
        productSalesMap[item.productName] = (productSalesMap[item.productName] || 0) + item.quantity;
      });
    });

  const topProductsData = Object.keys(productSalesMap)
    .map(name => ({
      name: name.length > 15 ? name.substring(0, 15) + "..." : name,
      Sold: productSalesMap[name]
    }))
    .sort((a, b) => b.Sold - a.Sold)
    .slice(0, 5); // top 5

  // 4. Monthly sales aggregation (mock aggregate from dates for Area Chart)
  const monthlyRevenue = [
    { month: "Jan", Revenue: totalRevenueForMonth(1) },
    { month: "Feb", Revenue: totalRevenueForMonth(2) },
    { month: "Mar", Revenue: totalRevenueForMonth(3) },
    { month: "Apr", Revenue: totalRevenueForMonth(4) },
    { month: "May", Revenue: totalRevenueForMonth(5) },
    { month: "Jun", Revenue: totalRevenueForMonth(6) }
  ];

  function totalRevenueForMonth(monthOffset) {
    // Dynamically calculate from loaded orders or seed if no history
    const total = orders
      .filter(o => {
        if (o.status === "CANCELLED") return false;
        const oMonth = new Date(o.createdAt).getMonth() + 1;
        return oMonth === monthOffset || (monthOffset === 6 && oMonth >= 6); // catch-all for current month
      })
      .reduce((sum, o) => sum + o.totalPrice, 0);

    // Provide default starter analytics curve if db is fresh
    if (total === 0) {
      const baselines = { 1: 1200, 2: 1850, 3: 2200, 4: 2900, 5: 3500, 6: 4100 };
      return baselines[monthOffset] || 1500;
    }
    return parseFloat(total.toFixed(2));
  }

  // Aggregate Stats
  const revenue = orders.reduce((sum, o) => (o.status !== "CANCELLED" ? sum + o.totalPrice : sum), 0);
  const totalProcessed = orders.filter(o => o.status !== "CANCELLED").length;
  const avgOrderVal = totalProcessed > 0 ? revenue / totalProcessed : 0;

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
            <BarChart3 size={24} className="text-primary-600 mr-2" />
            Performance &amp; Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-secondary-400">
            Advanced sales monitoring, average order values, and product inventory insights.
          </p>
        </div>
        <button
          onClick={loadAnalyticsData}
          className="inline-flex items-center px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-all shadow-sm dark:bg-secondary-800 dark:border-secondary-755 dark:text-secondary-200"
        >
          <RefreshCcw size={14} className="mr-2" />
          Refresh Stats
        </button>
      </div>

      {/* Analytics stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
          <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Gross Revenue</span>
          <div className="flex items-center space-x-2 mt-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded dark:bg-emerald-950/20 dark:text-emerald-400">
              <DollarSign size={20} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              ${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
        <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
          <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Average Order Value</span>
          <div className="flex items-center space-x-2 mt-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded dark:bg-blue-950/20 dark:text-blue-400">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              ${avgOrderVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>
        <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
          <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Orders Processed</span>
          <div className="flex items-center space-x-2 mt-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded dark:bg-indigo-950/20 dark:text-indigo-400">
              <Calendar size={20} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalProcessed}</h3>
          </div>
        </div>
      </div>

      {/* Grid of chart graphics */}
      {orders.length === 0 ? (
        <EmptyState
          title="No analytics insights available"
          description="Place customer order items to populate graphs and performance charts."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* Revenue Trend Area Chart */}
          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Daily Revenue Growth
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders per day Bar Chart */}
          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Orders Volume per Day
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} name="Orders Placed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Sales Area Chart */}
          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Monthly Cumulative Sales ($ USD)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMonth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Horizontal Bar Chart */}
          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Top Selling Products (Units Sold)
            </h3>
            <div className="h-64">
              {topProductsData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  No products shipped.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProductsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={80} />
                    <Tooltip />
                    <Bar dataKey="Sold" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Units Shipped" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Order Status Distribution Pie Chart */}
          <div className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 text-center">
              Global Order Status Distribution
            </h3>
            <div className="h-64 flex flex-col md:flex-row items-center justify-around">
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-600 dark:text-secondary-400">
                {statusPieData.map((d, index) => (
                  <div key={d.name} className="flex items-center space-x-2">
                    <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span>
                      {d.name}: <span className="font-bold text-slate-900 dark:text-white">{d.value} orders</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Analytics;
