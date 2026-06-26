import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../services/productService";
import { useAuth } from "../context/AuthContext";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { toast } from "react-toastify";
import {
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  Tag,
  Plus,
  Minus
} from "lucide-react";

const Storefront = () => {
  const navigate = useNavigate();
  const {
    user,
    theme,
    toggleTheme,
    logoutUser,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity
  } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Fetch catalog
  const fetchStoreProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({
        search,
        category: category === "All" ? "" : category,
        status: "ACTIVE",
        limit: 100
      });
      setProducts(data.products || []);

      // Pull unique categories dynamically
      if (categories.length === 0) {
        const all = await getProducts({ limit: 100, status: "ACTIVE" });
        const unique = Array.from(new Set((all.products || []).map(p => p.category)));
        setCategories(unique);
      }
    } catch (err) {
      toast.error("Failed to load store products ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreProducts();
  }, [search, category]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-secondary-900 transition-colors duration-200">
      
      {/* Customer Header Navbar */}
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
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 rounded-full hover:bg-slate-100 dark:text-secondary-400 dark:hover:bg-secondary-900"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-slate-500 rounded-full hover:bg-slate-100 dark:text-secondary-400 dark:hover:bg-secondary-900"
            >
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-primary-600 rounded-full border border-white dark:border-secondary-800">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* User Greeting */}
            <div className="hidden md:block text-right text-xs">
              <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-[10px] text-slate-400">Customer Account</p>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 rounded-full hover:bg-rose-50 hover:text-rose-600 dark:text-secondary-400 dark:hover:bg-rose-950/20"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Banner */}
        <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white shadow-md mb-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">OrderGuard Customer Store</h2>
            <p className="text-sm mt-1.5 opacity-90 max-w-lg">
              Place orders with transactional safety. Seeded products are instantly available, and stock is managed atomically.
            </p>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="px-5 py-2.5 bg-white text-primary-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all shadow flex items-center"
          >
            <ShoppingCart size={16} className="mr-2" />
            Check My Cart ({cartItemsCount})
          </button>
        </div>

        {/* Filter bars */}
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:justify-between md:items-center mb-8">
          <SearchBar
            placeholder="Search catalog products..."
            value={search}
            onChange={(val) => setSearch(val)}
          />

          <div className="flex space-x-1.5 overflow-x-auto text-xs py-1.5 scrollbar-thin pr-2">
            <button
              onClick={() => setCategory("All")}
              className={`px-3 py-1.5 rounded-lg border font-semibold ${
                category === "All"
                  ? "bg-primary-600 border-primary-600 text-white"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-secondary-800 dark:border-secondary-750 dark:text-secondary-300"
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg border font-semibold truncate ${
                  category === cat
                    ? "bg-primary-600 border-primary-600 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-secondary-800 dark:border-secondary-750 dark:text-secondary-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog list */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader size="lg" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Store catalogue empty"
            description="There are currently no active products available in the storefront."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => {
              const inCartItem = cart.find(c => c.productId === p._id);
              const qtyInCart = inCartItem ? inCartItem.quantity : 0;
              const actualStock = p.stock;
              const hasStock = actualStock > 0;

              return (
                <div
                  key={p._id}
                  className="bg-white border border-slate-150 rounded-2xl overflow-hidden hover:shadow-lg transition-all flex flex-col h-full dark:bg-secondary-800 dark:border-secondary-750"
                >
                  {/* Image */}
                  <div className="h-44 bg-slate-100 dark:bg-secondary-900 relative flex items-center justify-center border-b border-slate-100 dark:border-secondary-700/50">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80";
                      }}
                    />
                    {!hasStock && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 text-[9px] font-bold text-white bg-rose-600 rounded uppercase tracking-wider animate-pulse">
                        Sold Out
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[9px] font-semibold text-slate-700 bg-white/90 backdrop-blur rounded flex items-center shadow">
                      <Tag size={10} className="mr-1" />
                      {p.category}
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="p-4 flex flex-col flex-1 space-y-2.5 justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate" title={p.name}>
                        {p.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 h-7">
                        {p.description || "No description available"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-base font-extrabold text-slate-950 dark:text-white">
                        ${p.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {actualStock} available
                      </span>
                    </div>

                    {/* Add to cart action */}
                    <div className="pt-2 border-t border-slate-50 dark:border-secondary-700/30">
                      {hasStock ? (
                        qtyInCart > 0 ? (
                          <div className="flex items-center justify-between border border-primary-200 bg-primary-50/20 rounded-xl p-1 dark:border-primary-900 dark:bg-primary-950/20">
                            <button
                              onClick={() => updateCartQuantity(p._id, qtyInCart - 1)}
                              className="p-1 hover:bg-white rounded dark:hover:bg-secondary-900 text-primary-650"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold text-primary-750 dark:text-primary-400">
                              {qtyInCart} in Cart
                            </span>
                            <button
                              onClick={() => addToCart(p, 1)}
                              disabled={qtyInCart >= actualStock}
                              className="p-1 hover:bg-white rounded dark:hover:bg-secondary-900 text-primary-650 disabled:opacity-30"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(p, 1)}
                            className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center"
                          >
                            <ShoppingCart size={12} className="mr-1.5" />
                            Add To Cart
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="w-full py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed dark:bg-secondary-900"
                        >
                          Out of Stock
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Slider Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setCartOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-secondary-800 flex flex-col h-full shadow-2xl">
              
              {/* Header */}
              <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between dark:border-secondary-700/50">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
                  <ShoppingCart className="text-primary-600 mr-2" size={18} />
                  Shopping Cart ({cartItemsCount})
                </h3>
                <button
                  onClick={() => setCartOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-655 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Items list */}
              <div className="flex-1 overflow-y-auto p-6 divide-y divide-slate-100 dark:divide-secondary-700/50">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                    <ShoppingCart size={40} className="text-slate-300" />
                    <p className="text-xs text-slate-500">Your shopping cart is empty.</p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:border-secondary-700"
                    >
                      Browse Store
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3 max-w-[200px]">
                        <div className="w-12 h-12 bg-slate-50 border rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center dark:bg-secondary-900 dark:border-secondary-700">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80";
                            }}
                          />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">{item.sku}</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-secondary-300 block mt-1">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity adjusting buttons */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg p-0.5 dark:bg-secondary-900 dark:border-secondary-700">
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-white rounded dark:hover:bg-secondary-800"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-xs font-bold px-2 text-slate-700 dark:text-secondary-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            className="p-1 hover:bg-white rounded dark:hover:bg-secondary-800"
                          >
                            <Plus size={10} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout details panel */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4 dark:bg-secondary-900 dark:border-secondary-700/50">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Shipping:</span>
                    <span className="font-semibold text-emerald-600 uppercase tracking-wider">Free</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-dashed border-slate-200 dark:border-secondary-700">
                    <span>Estimated Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <Link
                    to="/store/checkout"
                    onClick={() => setCartOpen(false)}
                    className="flex items-center justify-center w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Storefront;
