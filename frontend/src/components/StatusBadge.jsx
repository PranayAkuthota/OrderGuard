import React from "react";

const StatusBadge = ({ status }) => {
  const normalizedStatus = status ? status.toUpperCase() : "PENDING";

  const config = {
    PENDING: {
      bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50",
      label: "Pending"
    },
    CONFIRMED: {
      bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
      label: "Confirmed"
    },
    PACKED: {
      bg: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50",
      label: "Packed"
    },
    SHIPPED: {
      bg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50",
      label: "Shipped"
    },
    DELIVERED: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
      label: "Delivered"
    },
    CANCELLED: {
      bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50",
      label: "Cancelled"
    },
    // Product Status badges
    ACTIVE: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
      label: "Active"
    },
    OUT_OF_STOCK: {
      bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50",
      label: "Out of Stock"
    },
    DRAFT: {
      bg: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
      label: "Draft"
    }
  };

  const current = config[normalizedStatus] || {
    bg: "bg-slate-100 text-slate-800 border-slate-200",
    label: status
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current"></span>
      {current.label}
    </span>
  );
};

export default StatusBadge;
