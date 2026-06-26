import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../services/orderService";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { ArrowLeft, CreditCard, ShoppingBag, ShieldCheck, Sun, Moon, LogOut } from "lucide-react";

const StoreCheckout = () => {
  const navigate = useNavigate();
  const {
    user,
    theme,
    toggleTheme,
    logoutUser,
    cart,
    clearCart,
    addSystemNotification
  } = useAuth();

  const [loading, setLoading] = useState(false);

  // Form Fields State
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    if (!address) {
      toast.error("Shipping address is required ❌");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty! Browse products first ❌");
      navigate("/store");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        customerName: user?.name || "Customer Account",
        customerEmail: user?.email || "customer@orderguard.com",
        phone,
        address,
        paymentMethod,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const result = await createOrder(orderPayload);
      toast.success("Order placed successfully! 🚀");
      
      // Trigger notification alert
      addSystemNotification(
        "SUCCESS",
        "Order Processed",
        `Your order #${result._id.substring(result._id.length - 8).toUpperCase()} was placed. Track timeline updates in history!`
      );

      clearCart();
      navigate("/store/orders");
    } catch (err) {
      toast.error(err.response?.data || "Inventory checkout check failed. Check stock levels ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

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
              className="text-xs font-semibold text-slate-650 hover:text-primary-600 dark:text-secondary-300 dark:hover:text-primary-400"
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

      {/* Checkout Form */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        
        {/* Back Link */}
        <div className="flex items-center space-x-4 mb-6">
          <Link
            to="/store"
            className="p-2 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 dark:border-secondary-750 dark:bg-secondary-800 dark:hover:bg-secondary-900 text-slate-500"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Secure Checkout
            </h1>
            <p className="text-xs text-slate-500 dark:text-secondary-400 mt-0.5">
              Review cart details and provide shipping address.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Checkout Details Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 bg-white border border-slate-150 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-750">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Shipping &amp; Billing Info
              </h3>
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                
                {/* Read only user details */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-455 cursor-not-allowed dark:bg-secondary-900 dark:border-secondary-700"
                      value={user?.name || ""}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-455 cursor-not-allowed dark:bg-secondary-900 dark:border-secondary-700"
                      value={user?.email || ""}
                      disabled
                    />
                  </div>
                  
                  {/* Phone */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="block w-full px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg text-sm focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                      placeholder="+1 (555) 012-3456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg text-sm focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                      placeholder="123 Maple Street, Apt 1C, Seattle WA 98101"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Payment preferences */}
                <div className="pt-4 border-t border-slate-100 dark:border-secondary-700/50">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                    {["Credit Card", "PayPal", "Bank Transfer", "Cash on Delivery"].map((method) => (
                      <label
                        key={method}
                        className={`flex items-center space-x-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-secondary-900 ${
                          paymentMethod === method
                            ? "border-primary-500 bg-primary-50/10 dark:bg-primary-950/20"
                            : "border-slate-200 dark:border-secondary-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          className="w-4 h-4 text-primary-600 border-slate-350 focus:ring-primary-500"
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                        />
                        <span className="text-slate-800 dark:text-secondary-200">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </form>
            </div>
          </div>

          {/* Checkout Totals Summary */}
          <div className="space-y-6">
            <div className="p-6 bg-white border border-slate-150 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-750">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                <ShoppingBag size={16} className="text-primary-600 mr-2" />
                Cart Verification
              </h3>

              {cart.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-6">Your cart is empty.</div>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y divide-slate-100 dark:divide-secondary-700/50 max-h-52 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.productId} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="truncate max-w-[150px]">
                          <span className="font-semibold text-slate-900 dark:text-white block truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400">${item.price.toFixed(2)} each</span>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-secondary-300">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-secondary-700/50 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-550">
                      <span>Total items:</span>
                      <span className="font-semibold">{cartItemsCount}</span>
                    </div>
                    <div className="flex justify-between text-slate-550">
                      <span>Shipping cost:</span>
                      <span className="font-semibold text-emerald-600">FREE</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-dashed border-slate-200 dark:border-secondary-700">
                      <span>Grand Total:</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckoutSubmit}
                    disabled={loading || cart.length === 0}
                    className="flex items-center justify-center w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 mt-4 shadow"
                  >
                    {loading ? <Loader size="sm" color="white" /> : "Place Secure Order"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default StoreCheckout;
