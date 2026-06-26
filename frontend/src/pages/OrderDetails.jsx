import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOrderById, updateOrderStatus } from "../services/orderService";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  User,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  HelpCircle,
  XCircle
} from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addSystemNotification } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const fetchOrder = async () => {
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      toast.error("Failed to load order details ❌");
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Handle transitioning states
  const handleTransition = async (nextStatus) => {
    setTransitioning(true);
    try {
      const result = await updateOrderStatus(order._id, nextStatus);
      setOrder(result);
      toast.success(`Order state updated to ${nextStatus}! ✅`);
      addSystemNotification(
        "INFO",
        "Order State Updated",
        `Order #${order._id.substring(order._id.length - 8).toUpperCase()} was moved to ${nextStatus}.`
      );
    } catch (err) {
      toast.error(err.response?.data || "Invalid state transition or error occurred ❌");
    } finally {
      setTransitioning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" />
      </div>
    );
  }

  if (!order) return null;

  // Timeline statuses list
  const standardTimeline = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];
  const currentStatusIndex = standardTimeline.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  // Action flow buttons configuration
  const nextActions = {
    PENDING: [
      { label: "Confirm Order", status: "CONFIRMED", color: "bg-blue-600 hover:bg-blue-700 text-white" },
      { label: "Cancel Order", status: "CANCELLED", color: "bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455" }
    ],
    CONFIRMED: [
      { label: "Pack Products", status: "PACKED", color: "bg-indigo-600 hover:bg-indigo-700 text-white" },
      { label: "Cancel Order", status: "CANCELLED", color: "bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455" }
    ],
    PACKED: [
      { label: "Ship Order", status: "SHIPPED", color: "bg-purple-600 hover:bg-purple-700 text-white" },
      { label: "Cancel Order", status: "CANCELLED", color: "bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-455" }
    ],
    SHIPPED: [
      { label: "Deliver Order", status: "DELIVERED", color: "bg-emerald-600 hover:bg-emerald-700 text-white" }
    ],
    DELIVERED: [],
    CANCELLED: []
  };

  const actions = nextActions[order.status] || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header and transition triggers */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/orders")}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 dark:border-secondary-750 dark:hover:bg-secondary-900 text-slate-500"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
              Order #{order._id.toUpperCase()}
            </h1>
            <p className="text-xs text-slate-500 dark:text-secondary-400 mt-1 flex items-center">
              <Calendar size={12} className="mr-1" />
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Transition State Button Actions */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.map((act) => (
              <button
                key={act.status}
                disabled={transitioning}
                onClick={() => handleTransition(act.status)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm disabled:opacity-50 ${act.color}`}
              >
                {transitioning ? <Loader size="sm" color="white" /> : act.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* State-Machine timeline visualization */}
      <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-6">
          Order Lifecycle Timeline
        </h3>

        {isCancelled ? (
          <div className="flex items-center space-x-4 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl dark:bg-rose-950/15 dark:border-rose-900/30 dark:text-rose-400">
            <XCircle size={28} className="animate-bounce" />
            <div>
              <h4 className="font-bold text-sm">Order Cancelled</h4>
              <p className="text-xs mt-0.5">
                This transaction has been terminated. Allocated stock has been restored to active inventory.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-col md:flex-row justify-between items-stretch md:items-center space-y-6 md:space-y-0">
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
                <div key={step} className="flex flex-1 flex-col items-center relative group">
                  {/* Connecting lines */}
                  {idx < standardTimeline.length - 1 && (
                    <div
                      className={`absolute hidden md:block top-4 left-1/2 w-full h-1 z-0 transition-colors ${
                        idx < currentStatusIndex ? "bg-primary-500" : "bg-slate-100 dark:bg-secondary-700"
                      }`}
                    />
                  )}

                  {/* Icon circle */}
                  <div
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCurrent
                        ? "bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20 scale-110"
                        : isPast
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-white border-slate-200 text-slate-400 dark:bg-secondary-900 dark:border-secondary-700"
                    }`}
                  >
                    <StepIcon size={16} />
                  </div>

                  {/* Step label */}
                  <span
                    className={`mt-2 text-xs font-semibold ${
                      isCurrent
                        ? "text-primary-600 dark:text-primary-400"
                        : isPast
                        ? "text-slate-800 dark:text-secondary-100"
                        : "text-slate-400 dark:text-secondary-500"
                    }`}
                  >
                    {step.charAt(0) + step.slice(1).toLowerCase()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side: Order items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Ordered Products
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-secondary-700/50">
              {order.items.map((item) => (
                <div key={item._id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2 bg-slate-50 text-slate-500 rounded-lg dark:bg-secondary-900 dark:text-secondary-400">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white text-xs block">
                        {item.productName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-450 dark:text-secondary-500 mt-0.5 block">
                        {item.sku}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Subtotals */}
            <div className="pt-4 border-t border-slate-150 dark:border-secondary-700/80 space-y-2 text-xs text-right">
              <div className="flex justify-between max-w-xs ml-auto text-slate-500">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900 dark:text-white">${order.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between max-w-xs ml-auto text-slate-500">
                <span>Shipping:</span>
                <span className="font-semibold text-slate-900 dark:text-white">FREE</span>
              </div>
              <div className="flex justify-between max-w-xs ml-auto text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-dashed border-slate-200 dark:border-secondary-700">
                <span>Total Payment:</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Customer details */}
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50 space-y-6">
            
            {/* Status card */}
            <div>
              <h3 className="text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                Order Status
              </h3>
              <StatusBadge status={order.status} />
            </div>

            {/* Buyer Contact details */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
                Customer Information
              </h3>
              <div className="flex items-center space-x-3 text-xs text-slate-700 dark:text-secondary-305">
                <User size={15} className="text-slate-400" />
                <span className="font-semibold text-slate-900 dark:text-white">{order.customerName}</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-700 dark:text-secondary-305">
                <Mail size={15} className="text-slate-400" />
                <span className="truncate">{order.customerEmail}</span>
              </div>
              {order.phone && (
                <div className="flex items-center space-x-3 text-xs text-slate-700 dark:text-secondary-305">
                  <Phone size={15} className="text-slate-400" />
                  <span>{order.phone}</span>
                </div>
              )}
            </div>

            {/* Delivery address */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                Shipping Details
              </h3>
              <div className="flex items-start space-x-3 text-xs text-slate-700 dark:text-secondary-305">
                <MapPin size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{order.address}</span>
              </div>
            </div>

            {/* Payment detail */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
                Payment Info
              </h3>
              <div className="flex items-center space-x-3 text-xs text-slate-700 dark:text-secondary-305">
                <CreditCard size={15} className="text-slate-400" />
                <span>{order.paymentMethod}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default OrderDetails;
