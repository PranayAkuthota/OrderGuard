import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOrders } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import {
  ShieldCheck,
  ShoppingBag,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const CustomerOrders = () => {
  const navigate = useNavigate();
  const { user, theme, toggleTheme, logoutUser } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchCustomerOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders({ limit: 100 });
      setOrders(data.orders || []);
    } catch (err) {
      toast.error("Failed to load your order history ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const toggleOrderExpand = (id) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  // State timeline parameters
  const standardTimeline = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-secondary-900 transition-colors duration-200">
      
      {/* Customer Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 dark:bg-secondary-800 dark:border-secondary-700/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/store" className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
              <ShieldCheck size={28} className="stroke-[2.5]" />
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">OrderGuard Store</span>
            </Link>
            <Link
              to="/store/orders"
              className="text-xs font-semibold text-primary-600 dark:text-primary-400"
            >
              My Purchase History
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 rounded-full hover:bg-slate-100 dark:text-secondary-400 dark:hover:bg-secondary-900"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 rounded-full hover:bg-rose-50 hover:text-rose-600 dark:text-secondary-400 dark:hover:bg-rose-955/20"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Orders List Container */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Title */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              My Orders
            </h1>
            <p className="text-sm text-slate-500 dark:text-secondary-400">
              Monitor fulfillment state-machines and review delivery timelines.
            </p>
          </div>
          <Link
            to="/store"
            className="px-4 py-2 bg-primary-605 text-xs font-semibold text-primary-600 border border-primary-200 bg-primary-50/20 rounded-lg hover:bg-primary-50 dark:text-primary-400 dark:border-primary-900"
          >
            Continue Shopping
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader size="lg" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders placed yet"
            description="You haven't bought anything. Browse the store and purchase products to get started!"
            actionButton={
              <Link
                to="/store"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-semibold hover:bg-primary-700 inline-block shadow"
              >
                Go to Storefront
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const isExpanded = expandedOrderId === o._id;
              const isCancelled = o.status === "CANCELLED";
              const currentStatusIndex = standardTimeline.indexOf(o.status);

              return (
                <div
                  key={o._id}
                  className="bg-white border border-slate-150 rounded-xl overflow-hidden shadow-sm dark:bg-secondary-800 dark:border-secondary-750"
                >
                  
                  {/* Summary Bar */}
                  <div
                    onClick={() => toggleOrderExpand(o._id)}
                    className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-secondary-900/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2.5 bg-slate-50 text-slate-500 rounded-lg dark:bg-secondary-900 dark:text-secondary-400">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white block">
                          #{o._id.substring(o._id.length - 8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5 flex items-center">
                          <Calendar size={10} className="mr-1" />
                          Ordered {new Date(o.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-6">
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-950 dark:text-white block">
                          ${o.totalPrice.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {o.items.reduce((sum, item) => sum + item.quantity, 0)} items
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <StatusBadge status={o.status} />
                        {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 bg-slate-50/50 dark:bg-secondary-900/10 dark:border-secondary-700/50 space-y-6">
                      
                      {/* Lifecycle Timeline */}
                      <div className="bg-white border border-slate-150 p-5 rounded-xl dark:bg-secondary-800 dark:border-secondary-750">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-5 uppercase tracking-wide">
                          Fulfillment Timeline
                        </h4>
                        {isCancelled ? (
                          <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400 p-3 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 rounded-lg text-xs font-semibold">
                            <XCircle size={16} />
                            <span>This order has been cancelled. Allocated stock has been restored to inventory.</span>
                          </div>
                        ) : (
                          <div className="relative flex flex-col sm:flex-row justify-between items-stretch sm:items-center space-y-4 sm:space-y-0">
                            {standardTimeline.map((step, idx) => {
                              const isPast = idx <= currentStatusIndex;
                              const isCurrent = idx === currentStatusIndex;
                              
                              const stepIcons = {
                                PENDING: Clock,
                                CONFIRMED: CheckCircle2,
                                PACKED: Package,
                                SHIPPED: Truck,
                                DELIVERED: CheckCircle2
                              };
                              const StepIcon = stepIcons[step] || HelpCircle;

                              return (
                                <div key={step} className="flex flex-1 flex-col items-center relative">
                                  {idx < standardTimeline.length - 1 && (
                                    <div className={`absolute hidden sm:block top-3.5 left-1/2 w-full h-0.5 z-0 ${
                                      idx < currentStatusIndex ? "bg-primary-500" : "bg-slate-100 dark:bg-secondary-700"
                                    }`} />
                                  )}
                                  <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 text-[10px] ${
                                    isCurrent
                                      ? "bg-primary-500 border-primary-500 text-white shadow shadow-primary-500/25 scale-105"
                                      : isPast
                                      ? "bg-emerald-500 border-emerald-500 text-white"
                                      : "bg-white border-slate-200 text-slate-400 dark:bg-secondary-900 dark:border-secondary-700"
                                  }`}>
                                    <StepIcon size={12} />
                                  </div>
                                  <span className={`mt-1.5 text-[10px] font-semibold ${
                                    isCurrent ? "text-primary-600 dark:text-primary-400" : "text-slate-455"
                                  }`}>
                                    {step.charAt(0) + step.slice(1).toLowerCase()}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Items details & Shipping summary */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Products list */}
                        <div className="p-4 bg-white border border-slate-150 rounded-xl dark:bg-secondary-800 dark:border-secondary-750">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wide">Items Purchased</h4>
                          <div className="divide-y divide-slate-100 dark:divide-secondary-700/50">
                            {o.items.map((item) => (
                              <div key={item._id} className="py-2.5 flex items-center justify-between text-xs">
                                <div>
                                  <span className="font-semibold text-slate-900 dark:text-white block">{item.productName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{item.sku}</span>
                                </div>
                                <span className="font-bold text-slate-800 dark:text-secondary-300">
                                  ${item.price.toFixed(2)} x {item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery metadata */}
                        <div className="p-4 bg-white border border-slate-150 rounded-xl dark:bg-secondary-800 dark:border-secondary-750 space-y-3.5 text-xs text-slate-600 dark:text-secondary-300">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Fulfillment Address</h4>
                          <div className="flex items-start space-x-2">
                            <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                            <span>{o.address}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CreditCard size={14} className="text-slate-400" />
                            <span>Paid via {o.paymentMethod}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerOrders;
