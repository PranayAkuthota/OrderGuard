import React, { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";
import { getProducts } from "../services/productService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
  
  // Notification State
  const [notifications, setNotifications] = useState([]);

  // Cart State
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("orderguard_cart");
    return stored ? JSON.parse(stored) : [];
  });

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem("orderguard_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.productId === product._id ? { ...item, quantity: newQty } : item
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl,
          sku: product.sku,
          quantity: Math.min(product.stock, quantity)
        }
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Check user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("orderguard_user");
    const storedToken = localStorage.getItem("orderguard_token");
    const storedTheme = localStorage.getItem("orderguard_theme") || "light";
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    
    setTheme(storedTheme);
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    setLoading(false);
  }, []);

  // Poll for low stock alerts periodically (simulating real-time engine)
  useEffect(() => {
    if (!token) return;

    const checkLowStock = async () => {
      try {
        const data = await getProducts({ limit: 100 });
        const lowStockProducts = data.products.filter(
          p => p.stock <= p.reorderThreshold && p.status === "ACTIVE"
        );

        const newAlerts = lowStockProducts.map(p => ({
          id: `low-stock-${p._id}-${Date.now()}`,
          type: "WARNING",
          title: "Low Inventory Warning",
          message: `Product "${p.name}" is low on stock (${p.stock} remaining). Reorder threshold is ${p.reorderThreshold}.`,
          timestamp: new Date(),
          read: false
        }));

        if (newAlerts.length > 0) {
          setNotifications(prev => {
            // Keep unique alerts (by message text or custom composite ID)
            const existingMessages = prev.map(a => a.message);
            const filteredNew = newAlerts.filter(a => !existingMessages.includes(a.message));
            return [...filteredNew, ...prev].slice(0, 50); // limit to 50
          });
        }
      } catch (err) {
        console.error("Error checking low stock alerts:", err);
      }
    };

    // Check immediately and then every 20 seconds
    checkLowStock();
    const interval = setInterval(checkLowStock, 20000);
    return () => clearInterval(interval);
  }, [token]);

  // Auth Operations
  const loginUser = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setToken(data.token);
    addSystemNotification("INFO", "Login Success", `Welcome back, ${data.user.name}! 🚀`);
    return data;
  };

  const registerUser = async (name, email, password, role = "CUSTOMER") => {
    const data = await authService.register(name, email, password, role);
    setUser(data.user);
    setToken(data.token);
    addSystemNotification("INFO", "Account Registered", `Your OrderGuard ${role.toLowerCase()} account is ready!`);
    return data;
  };

  const logoutUser = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    setNotifications([]);
  };

  // Theme Toggle
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("orderguard_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Add notification manually (e.g. on order placed, state changes)
  const addSystemNotification = (type, title, message) => {
    const newNotif = {
      id: `${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type, // 'INFO', 'SUCCESS', 'WARNING', 'ERROR'
      title,
      message,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        loginUser,
        registerUser,
        logoutUser,
        theme,
        toggleTheme,
        notifications,
        unreadNotificationsCount,
        addSystemNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
