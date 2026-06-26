import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../services/productService";
import { createOrder } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { ArrowLeft, Plus, Trash2, ShieldCheck, ShoppingCart } from "lucide-react";

const CreateOrder = () => {
  const { addSystemNotification } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Customer State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");

  // Selected items state: [{ productId, name, price, stock, quantity }]
  const [items, setItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Load products list for dropdown selections
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await getProducts({ limit: 100, status: "ACTIVE" });
        setProductsList(data.products || []);
        if (data.products && data.products.length > 0) {
          setSelectedProductId(data.products[0]._id);
        }
      } catch (err) {
        toast.error("Error loading products list ❌");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchCatalog();
  }, []);

  const handleAddItem = () => {
    if (!selectedProductId) return;

    const prod = productsList.find((p) => p._id === selectedProductId);
    if (!prod) return;

    // Check if product is already in items list
    const existing = items.find((i) => i.productId === selectedProductId);
    const currentQty = existing ? existing.quantity : 0;
    const requestedQty = currentQty + parseInt(selectedQuantity);

    // Validate stock levels locally first
    if (requestedQty > prod.stock) {
      toast.warn(`Insufficient stock for ${prod.name}. Available: ${prod.stock}`);
      return;
    }

    if (existing) {
      setItems(
        items.map((i) =>
          i.productId === selectedProductId ? { ...i, quantity: requestedQty } : i
        )
      );
    } else {
      setItems([
        ...items,
        {
          productId: prod._id,
          name: prod.name,
          price: prod.price,
          stock: prod.stock,
          quantity: parseInt(selectedQuantity)
        }
      ]);
    }
    setSelectedQuantity(1);
    toast.success(`${prod.name} added to cart! 🛒`);
  };

  const handleRemoveItem = (prodId) => {
    setItems(items.filter((i) => i.productId !== prodId));
  };

  // Calculate order metrics
  const totalItemsCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const totalPrice = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!customerName || !customerEmail || !address) {
      toast.error("Customer metadata is required ❌");
      return;
    }

    if (items.length === 0) {
      toast.error("Add at least one product to the order ❌");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        customerName,
        customerEmail,
        phone,
        address,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity
        }))
      };

      const result = await createOrder(orderPayload);
      toast.success("Order placed successfully! Stock decremented 🚀");
      
      // Trigger live notification alert
      addSystemNotification(
        "SUCCESS",
        "New Order Placed",
        `Order #${result._id.substring(result._id.length - 8).toUpperCase()} for ${customerName} was placed successfully.`
      );

      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data || "Insufficient inventory or placement failure ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header and navigation */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 dark:border-secondary-755 dark:hover:bg-secondary-900 text-slate-500"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Customer Order
          </h1>
          <p className="text-sm text-slate-500 dark:text-secondary-400">
            Deducts warehouse stock atomically on order validation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Side - Details Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Metadata Card */}
          <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              1. Customer Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                  placeholder="Jane Smith"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                  placeholder="jane.smith@mail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                  Shipping Address *
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                  placeholder="123 Orchard Road, Unit 4B, New York NY 10001"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Catalog Item Selection Card */}
          <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              2. Add Products to Order
            </h3>

            {loadingProducts ? (
              <Loader size="sm" />
            ) : productsList.length === 0 ? (
              <div className="text-center text-xs text-slate-450">
                No catalog items found. Create products before creating orders.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1">
                    Select Product
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg text-sm focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    {productsList.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} - ${p.price.toFixed(2)} ({p.stock} in stock)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-24">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center"
                  >
                    <Plus size={16} className="mr-1.5" /> Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Summary panel */}
        <div className="space-y-6">
          {/* Cart items listing and order pricing */}
          <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <ShoppingCart size={16} className="text-primary-600 mr-2" />
              Order Summary
            </h3>

            {items.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No items added yet. Select products on the left.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-slate-100 dark:divide-secondary-700/50 max-h-60 overflow-y-auto pr-1">
                  {items.map((i) => (
                    <div key={i.productId} className="py-2.5 flex items-center justify-between">
                      <div className="truncate max-w-[140px]">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                          {i.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ${i.price.toFixed(2)} each
                        </span>
                      </div>
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-secondary-300">
                          x{i.quantity}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(i.productId)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals section */}
                <div className="pt-4 border-t border-slate-100 dark:border-secondary-700/50 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Total items:</span>
                    <span className="font-semibold">{totalItemsCount}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Payment Method:</span>
                    <select
                      className="bg-transparent font-semibold text-slate-700 focus:outline-none dark:text-secondary-300 text-right"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash on Delivery">Cash on Delivery</option>
                    </select>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-dashed border-slate-200 dark:border-secondary-700">
                    <span>Total Amount:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Placement buttons */}
                <button
                  onClick={handleSubmitOrder}
                  disabled={loading || items.length === 0}
                  className="flex items-center justify-center w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 mt-4"
                >
                  {loading ? <Loader size="sm" color="white" /> : "Place Order"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CreateOrder;
