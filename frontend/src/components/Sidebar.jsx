import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  BarChart3,
  Bell,
  User,
  Settings,
  LogOut,
  ShieldCheck
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logoutUser, unreadNotificationsCount } = useAuth();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", path: "/orders", icon: ShoppingCart },
    { name: "Products", path: "/products", icon: Package },
    { name: "Inventory", path: "/inventory", icon: Boxes },
    { name: "Customers", path: "/customers", icon: Users },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    {
      name: "Notifications",
      path: "/notifications",
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : null
    },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen dark:bg-secondary-800 dark:border-secondary-700/50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-secondary-700/50">
          <NavLink to="/" className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
            <ShieldCheck size={28} className="stroke-[2.5]" />
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">OrderGuard</span>
          </NavLink>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    isActive
                      ? "bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-secondary-400 dark:hover:bg-secondary-900 dark:hover:text-white"
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon size={18} className="opacity-80 group-hover:scale-105 transition-transform" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-rose-500 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-100 dark:border-secondary-700/50">
          <button
            onClick={() => {
              logoutUser();
              window.location.href = "/login";
            }}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-rose-600 rounded-lg hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-all"
          >
            <LogOut size={18} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
