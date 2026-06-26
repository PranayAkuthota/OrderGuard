import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders, updateOrderStatus } from "../services/orderService";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { Plus, Eye, CheckCircle2, XCircle, FileSpreadsheet } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Orders = () => {
  const { addSystemNotification } = useAuth();
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrders({
        search,
        status,
        page,
        limit: 8
      });
      setOrders(data.orders || []);
      setTotalOrders(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      toast.error("Failed to load customer orders ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, status, page]);

  // Fast cancel order
  const handleCancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to CANCEL this order? This will restock items!")) return;

    try {
      const updated = await updateOrderStatus(id, "CANCELLED");
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: "CANCELLED" } : o))
      );
      toast.success(`Order #${id.substring(id.length - 8).toUpperCase()} Cancelled. Items restocked! 🔄`);
      addSystemNotification(
        "INFO",
        "Order Cancelled",
        `Order #${id.substring(id.length - 8).toUpperCase()} has been cancelled and items restocked.`
      );
    } catch (err) {
      toast.error(err.response?.data || "Unable to cancel order ❌");
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.warn("No orders available to export.");
      return;
    }

    const headers = ["Order ID", "Customer Name", "Customer Email", "Address", "Items Ordered", "Total Price", "Status", "Placed Date"];
    const rows = orders.map(o => [
      o._id,
      o.customerName,
      o.customerEmail,
      o.address,
      o.items.map(i => `${i.productName} (x${i.quantity})`).join("; "),
      o.totalPrice,
      o.status,
      o.createdAt
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orderguard_orders_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders report exported to CSV! 📄");
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Orders Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-secondary-400">
            View orders, check shipping details, transition statuses, or cancel transactions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-all shadow-sm dark:bg-secondary-800 dark:border-secondary-750 dark:text-secondary-200 dark:hover:bg-secondary-900"
          >
            <FileSpreadsheet size={16} className="mr-2" />
            CSV Export
          </button>
          <Link
            to="/orders/create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            <Plus size={16} className="mr-2" />
            New Order
          </Link>
        </div>
      </div>

      {/* Query Filters */}
      <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-4 dark:bg-secondary-800 dark:border-secondary-700/50">
        <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
          
          <SearchBar
            placeholder="Search by customer name or email..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
          />

          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-450 dark:text-secondary-400">Filter Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-700 focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
            >
              <option value="All">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PACKED">Packed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

        </div>
      </div>

      {/* Orders grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Your search criteria didn't match any orders. Try clearing filters or create a new order."
          actionButton={
            <Link
              to="/orders/create"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700"
            >
              Create Order
            </Link>
          }
        />
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase dark:border-secondary-700/50">
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Items</th>
                  <th className="py-3.5 px-6">Total Price</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Placed Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-secondary-700/30">
                {orders.map((o) => (
                  <tr
                    key={o._id}
                    className="text-xs text-slate-700 hover:bg-slate-50/50 dark:text-secondary-300 dark:hover:bg-secondary-900/10"
                  >
                    <td className="py-4 px-6 font-mono text-[10px] text-slate-900 dark:text-white font-semibold">
                      #{o._id.substring(o._id.length - 8).toUpperCase()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 dark:text-white">{o.customerName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{o.customerEmail}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="max-w-[200px] truncate">
                        {o.items.map((i) => (
                          <div key={i._id} className="truncate">
                            {i.productName} <span className="text-slate-400 font-semibold">(x{i.quantity})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      ${o.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(o.createdAt).toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/orders/${o._id}`}
                          className="p-1.5 text-slate-500 border border-slate-200 rounded-lg hover:text-primary-600 hover:bg-slate-50 dark:border-secondary-750 dark:text-secondary-400 dark:hover:text-primary-400 dark:hover:bg-secondary-900"
                          title="View timeline & details"
                        >
                          <Eye size={14} />
                        </Link>
                        {o.status !== "DELIVERED" && o.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleCancelOrder(o._id)}
                            className="p-1.5 text-slate-500 border border-slate-200 rounded-lg hover:text-rose-600 hover:bg-rose-50 dark:border-secondary-750 dark:text-secondary-400 dark:hover:text-rose-450 dark:hover:bg-secondary-900"
                            title="Cancel Order (restock items)"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

    </div>
  );
};

export default Orders;
