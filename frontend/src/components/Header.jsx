import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Search,
  User,
  ShoppingBag,
  Boxes,
  Users,
  LogOut,
  ChevronDown,
  Settings
} from "lucide-react";
import { getProducts } from "../services/productService";
import { getOrders } from "../services/orderService";
import { getCustomers } from "../services/customerService";

const Header = ({ toggleSidebar }) => {
  const {
    user,
    theme,
    toggleTheme,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    logoutUser
  } = useAuth();

  const navigate = useNavigate();

  // State controls
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ products: [], orders: [], customers: [] });
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Refs for click outside
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResultsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Global search handler (debounced)
  useEffect(() => {
    if (!globalSearchQuery.trim()) {
      setSearchResults({ products: [], orders: [], customers: [] });
      setShowResultsDropdown(false);
      return;
    }

    const delaySearch = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Run searches in parallel
        const [prodData, orderData, custData] = await Promise.all([
          getProducts({ search: globalSearchQuery, limit: 3 }),
          getOrders({ search: globalSearchQuery, limit: 3 }),
          getCustomers({ search: globalSearchQuery, limit: 3 }).catch(() => ({ customers: [] }))
        ]);

        setSearchResults({
          products: prodData?.products || [],
          orders: orderData?.orders || [],
          customers: custData?.customers || []
        });
        setShowResultsDropdown(true);
      } catch (err) {
        console.error("Global search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [globalSearchQuery]);

  const handleResultClick = (path) => {
    setGlobalSearchQuery("");
    setShowResultsDropdown(false);
    navigate(path);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  // Get user avatar initials
  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full h-16 px-6 bg-white border-b border-slate-200 dark:bg-secondary-800 dark:border-secondary-700/50">
      
      {/* Sidebar toggle and Brand on Mobile */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-slate-700 dark:text-secondary-400 dark:hover:text-white lg:hidden"
        >
          <Menu size={24} />
        </button>

        {/* Global search input */}
        <div ref={searchRef} className="relative hidden sm:block w-72 md:w-96">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search across orders, products, customers..."
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            onFocus={() => {
              if (globalSearchQuery.trim()) setShowResultsDropdown(true);
            }}
          />

          {/* Global Search Results Dropdown */}
          {showResultsDropdown && (
            <div className="absolute left-0 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg dark:bg-secondary-800 dark:border-secondary-700 overflow-hidden max-h-96 overflow-y-auto">
              <div className="p-2 border-b border-slate-100 dark:border-secondary-700/50 text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-secondary-900">
                {isSearching ? "Searching..." : "Global Search Results"}
              </div>

              {/* Products Section */}
              {searchResults.products.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium px-2 py-1">
                    <Boxes size={12} />
                    <span>Products</span>
                  </div>
                  {searchResults.products.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => handleResultClick(`/products`)}
                      className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-secondary-900 text-xs"
                    >
                      <span className="font-medium text-slate-700 dark:text-secondary-200 truncate max-w-[200px]">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{p.sku}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Orders Section */}
              {searchResults.orders.length > 0 && (
                <div className="p-2 border-t border-slate-50 dark:border-secondary-700/30">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium px-2 py-1">
                    <ShoppingBag size={12} />
                    <span>Orders</span>
                  </div>
                  {searchResults.orders.map((o) => (
                    <button
                      key={o._id}
                      onClick={() => handleResultClick(`/orders?search=${o._id}`)}
                      className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-secondary-900 text-xs"
                    >
                      <span className="font-medium text-slate-700 dark:text-secondary-200 truncate">
                        {o.customerName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ${o.totalPrice.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Customers Section */}
              {searchResults.customers.length > 0 && (
                <div className="p-2 border-t border-slate-50 dark:border-secondary-700/30">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium px-2 py-1">
                    <Users size={12} />
                    <span>Customers</span>
                  </div>
                  {searchResults.customers.map((c) => (
                    <button
                      key={c.email}
                      onClick={() => handleResultClick(`/customers?search=${c.email}`)}
                      className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-secondary-900 text-xs"
                    >
                      <span className="font-medium text-slate-700 dark:text-secondary-200 truncate">
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{c.email}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.products.length === 0 &&
                searchResults.orders.length === 0 &&
                searchResults.customers.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching products, orders, or customers found.
                  </div>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-4">
        
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-700 dark:text-secondary-400 dark:hover:bg-secondary-900 dark:hover:text-white transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications center dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-700 dark:text-secondary-400 dark:hover:bg-secondary-900 dark:hover:text-white transition-colors"
            aria-label="View notifications"
          >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full border border-white dark:border-secondary-800 animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 w-80 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg dark:bg-secondary-800 dark:border-secondary-700 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-secondary-700/50 bg-slate-50 dark:bg-secondary-900">
                <span className="text-xs font-semibold text-slate-700 dark:text-white">
                  Notifications
                </span>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[10px] text-primary-600 font-semibold hover:underline dark:text-primary-400"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-secondary-700/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-secondary-900 ${
                        !n.read ? "bg-primary-50/20 dark:bg-primary-950/10" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className={`text-[10px] font-semibold uppercase ${
                          n.type === "WARNING" ? "text-amber-500" :
                          n.type === "ERROR" ? "text-rose-500" : "text-primary-600"
                        }`}>
                          {n.title}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-secondary-300 mt-1">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-slate-100 dark:border-secondary-700/50 py-1.5 text-center bg-slate-50 dark:bg-secondary-900">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate("/notifications");
                  }}
                  className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 dark:text-secondary-400 dark:hover:text-white"
                >
                  View all alerts
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile menu dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-1.5 focus:outline-none"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-xs border border-primary-200 dark:bg-primary-950/40 dark:text-primary-400 dark:border-primary-900">
              {getInitials(user?.name)}
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden md:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 w-48 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg dark:bg-secondary-800 dark:border-secondary-700 overflow-hidden z-50">
              <div className="p-3 border-b border-slate-100 dark:border-secondary-700/50 text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {user?.name || "Seller Admin"}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {user?.email}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/profile");
                  }}
                  className="flex items-center w-full px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 dark:text-secondary-400 dark:hover:bg-secondary-900 dark:hover:text-white text-left"
                >
                  <User size={14} className="mr-2" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/settings");
                  }}
                  className="flex items-center w-full px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 dark:text-secondary-400 dark:hover:bg-secondary-900 dark:hover:text-white text-left"
                >
                  <Settings size={14} className="mr-2" />
                  Settings
                </button>
              </div>
              <div className="border-t border-slate-100 dark:border-secondary-700/50 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 text-left"
                >
                  <LogOut size={14} className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};

export default Header;
