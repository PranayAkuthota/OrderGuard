import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/EmptyState";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  CheckCheck,
  Trash2
} from "lucide-react";
import { toast } from "react-toastify";

const Notifications = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications
  } = useAuth();

  const [filter, setFilter] = useState("ALL");

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "ALL") return true;
    if (filter === "UNREAD") return !n.read;
    return n.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle className="text-emerald-500" size={18} />;
      case "WARNING":
        return <AlertTriangle className="text-amber-500" size={18} />;
      case "ERROR":
        return <XCircle className="text-rose-500" size={18} />;
      default:
        return <Info className="text-primary-500" size={18} />;
    }
  };

  const getBorderColor = (type, read) => {
    if (read) return "border-slate-100 dark:border-secondary-700/30";
    switch (type) {
      case "SUCCESS":
        return "border-emerald-500 dark:border-emerald-900";
      case "WARNING":
        return "border-amber-500 dark:border-amber-900";
      case "ERROR":
        return "border-rose-500 dark:border-rose-900";
      default:
        return "border-primary-500 dark:border-primary-900";
    }
  };

  const handleClear = () => {
    clearNotifications();
    toast.success("Notification logs cleared 🗑️");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
            <Bell size={24} className="text-primary-600 mr-2" />
            Alerts &amp; Notifications Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-secondary-400">
            Audit logs for stock alerts, failed checkout bounds, and delivery notifications.
          </p>
        </div>

        <div className="flex space-x-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllNotificationsAsRead}
                className="inline-flex items-center px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold dark:bg-secondary-800 dark:border-secondary-750 dark:text-secondary-200"
              >
                <CheckCheck size={14} className="mr-1.5" />
                Mark All Read
              </button>
              <button
                onClick={handleClear}
                className="inline-flex items-center px-3 py-1.5 border border-rose-250 bg-rose-50 hover:bg-rose-105 text-rose-600 rounded-lg text-xs font-semibold dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-455"
              >
                <Trash2 size={14} className="mr-1.5" />
                Clear Logs
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1.5 p-1 bg-slate-100 rounded-lg max-w-md dark:bg-secondary-900 text-xs">
        {["ALL", "UNREAD", "SUCCESS", "WARNING", "ERROR"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-1.5 text-center font-medium rounded-md transition-all uppercase ${
              filter === tab
                ? "bg-white text-slate-900 shadow dark:bg-secondary-800 dark:text-white"
                : "text-slate-550 hover:text-slate-800 dark:text-secondary-400 dark:hover:text-secondary-200"
            }`}
          >
            {tab.toLowerCase()}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredNotifs.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description={`No logs found under your "${filter.toLowerCase()}" filter settings.`}
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`p-4 bg-white border rounded-xl shadow-sm flex items-start justify-between cursor-pointer transition-colors dark:bg-secondary-800 ${getBorderColor(
                n.type,
                n.read
              )} ${!n.read ? "bg-primary-50/10 dark:bg-primary-950/5 border-l-4" : ""}`}
            >
              <div className="flex space-x-3.5">
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 dark:text-secondary-400">
                    {n.message}
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col justify-between h-full text-[10px] text-slate-400 min-w-[70px]">
                <span>
                  {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {!n.read && (
                  <span className="text-[9px] text-primary-600 font-semibold mt-1 dark:text-primary-400 uppercase tracking-wider">
                    New
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Notifications;
