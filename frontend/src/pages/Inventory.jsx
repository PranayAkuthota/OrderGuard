import React, { useState, useEffect } from "react";
import { getInventoryLevels, updateStock } from "../services/inventoryService";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import {
  Boxes,
  AlertTriangle,
  FileDown,
  RefreshCw,
  Plus,
  Minus,
  Check
} from "lucide-react";

const Inventory = () => {
  const { addSystemNotification } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Quick stock edit state
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await getInventoryLevels({ search });
      setProducts(data.products || []);
    } catch (err) {
      toast.error("Failed to load inventory levels ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search]);

  // Adjust stock level quickly
  const handleQuickAdjust = async (id, currentStock, delta) => {
    const nextStock = Math.max(0, currentStock + delta);
    try {
      const updated = await updateStock(id, nextStock);
      setProducts(prev =>
        prev.map(p => (p._id === id ? { ...p, stock: updated.stock, status: updated.status } : p))
      );
      toast.success(`Stock level adjusted to ${updated.stock} ✅`);

      // Trigger warning notification if threshold crossed
      if (updated.stock <= updated.reorderThreshold) {
        addSystemNotification(
          "WARNING",
          "Low Stock Warning",
          `Product "${updated.name}" has crossed reorder threshold. Only ${updated.stock} left.`
        );
      }
    } catch (err) {
      toast.error("Stock adjustment failed ❌");
    }
  };

  // Submit set stock value
  const handleSetStockSubmit = async (id) => {
    const stockNum = parseInt(editVal);
    if (isNaN(stockNum) || stockNum < 0) {
      toast.error("Please enter a valid non-negative integer ❌");
      return;
    }

    try {
      const updated = await updateStock(id, stockNum);
      setProducts(prev =>
        prev.map(p => (p._id === id ? { ...p, stock: updated.stock, status: updated.status } : p))
      );
      setEditingId(null);
      toast.success(`Stock set to ${updated.stock} successfully ✅`);
    } catch (err) {
      toast.error("Failed to set stock levels ❌");
    }
  };

  // Export to CSV helper
  const handleExportCSV = () => {
    if (products.length === 0) {
      toast.warn("No inventory data to export.");
      return;
    }

    const headers = ["Product ID", "Name", "SKU", "Category", "Current Stock", "Reserved Stock", "Available Stock", "Reorder Threshold", "Status"];
    const rows = products.map(p => [
      p._id,
      p.name,
      p.sku,
      p.category,
      p.stock,
      p.reservedStock || 0,
      p.stock - (p.reservedStock || 0),
      p.reorderThreshold,
      p.status
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orderguard_inventory_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully! 📄");
  };

  // Calculate Metrics
  const totalItems = products.length;
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);
  const totalReserved = products.reduce((sum, p) => sum + (p.reservedStock || 0), 0);
  const lowStockCount = products.filter(p => p.stock <= p.reorderThreshold && p.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Inventory &amp; Stock Levels
          </h1>
          <p className="text-sm text-slate-500 dark:text-secondary-400">
            Monitor real-time warehouse counts, reserved orders, and reorder levels.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-all shadow-sm dark:bg-secondary-800 dark:border-secondary-750 dark:text-secondary-200 dark:hover:bg-secondary-900"
        >
          <FileDown size={16} className="mr-2" />
          Export to CSV
        </button>
      </div>

      {/* Inventory stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Total skus */}
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
          <div className="flex items-center space-x-3 text-slate-550/80 dark:text-secondary-400">
            <Boxes size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Total SKUs</span>
          </div>
          <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{totalItems}</h3>
        </div>
        {/* Total physical stock */}
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
          <div className="flex items-center space-x-3 text-primary-500">
            <Boxes size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Physical Stock</span>
          </div>
          <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{totalStockCount}</h3>
        </div>
        {/* Total reserved */}
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
          <div className="flex items-center space-x-3 text-indigo-500">
            <Boxes size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Reserved (Pending)</span>
          </div>
          <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{totalReserved}</h3>
        </div>
        {/* Low Stock Alerts count */}
        <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
          <div className="flex items-center space-x-3 text-rose-500">
            <AlertTriangle size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Alerts</span>
          </div>
          <h3 className={`text-2xl font-bold mt-2 ${lowStockCount > 0 ? "text-rose-600 dark:text-rose-450" : "text-slate-900 dark:text-white"}`}>
            {lowStockCount}
          </h3>
        </div>
      </div>

      {/* Table search and triggers */}
      <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0 dark:bg-secondary-800 dark:border-secondary-700/50">
        <SearchBar
          placeholder="Filter stock levels by product name or SKU..."
          value={search}
          onChange={(val) => setSearch(val)}
        />
        <button
          onClick={fetchInventory}
          className="inline-flex items-center justify-center p-2 text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 dark:border-secondary-755 dark:text-secondary-400 dark:hover:bg-secondary-900"
          title="Refresh counts"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Grid of stock */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader size="lg" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No stock records found"
          description="Try modifying search keywords or populate product items first."
        />
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase dark:border-secondary-700/50">
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6 text-center">Physical Stock</th>
                  <th className="py-3.5 px-6 text-center">Reserved Stock</th>
                  <th className="py-3.5 px-6 text-center">Available Stock</th>
                  <th className="py-3.5 px-6 text-center">Reorder Limit</th>
                  <th className="py-3.5 px-6">Alert Level</th>
                  <th className="py-3.5 px-6 text-right">Quick Refill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-secondary-700/30">
                {products.map((p) => {
                  const reserved = p.reservedStock || 0;
                  const available = p.stock - reserved;
                  
                  // Color coding alert badge
                  let alertText = "Safe";
                  let alertClass = "bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/50";
                  
                  if (p.stock <= 0) {
                    alertText = "Out of Stock";
                    alertClass = "bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/50 animate-pulse";
                  } else if (p.stock <= p.reorderThreshold) {
                    alertText = "Reorder Warning";
                    alertClass = "bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/50";
                  }

                  return (
                    <tr
                      key={p._id}
                      className="text-xs text-slate-700 hover:bg-slate-50/50 dark:text-secondary-300 dark:hover:bg-secondary-900/10"
                    >
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{p.sku}</span>
                      </td>
                      <td className="py-4 px-6 text-center font-semibold text-slate-900 dark:text-white">
                        {p.stock}
                      </td>
                      <td className="py-4 px-6 text-center text-purple-650 font-medium">
                        {reserved}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-950 dark:text-white">
                        {available}
                      </td>
                      <td className="py-4 px-6 text-center text-slate-450">
                        {p.reorderThreshold}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${alertClass}`}>
                          {alertText}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {editingId === p._id ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            <input
                              type="number"
                              className="w-16 px-1.5 py-1 border border-slate-350 rounded text-center focus:outline-none dark:bg-secondary-900 dark:border-secondary-700"
                              value={editVal}
                              onChange={(e) => setEditVal(e.target.value)}
                            />
                            <button
                              onClick={() => handleSetStockSubmit(p._id)}
                              className="p-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleQuickAdjust(p._id, p.stock, -1)}
                              disabled={p.stock <= 0}
                              className="p-1 text-slate-500 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-30 dark:border-secondary-700 dark:text-secondary-400 dark:hover:bg-secondary-900"
                              title="Decrease 1"
                            >
                              <Minus size={12} />
                            </button>
                            <button
                              onClick={() => handleQuickAdjust(p._id, p.stock, 5)}
                              className="p-1 text-slate-500 border border-slate-200 rounded hover:bg-slate-50 dark:border-secondary-700 dark:text-secondary-400 dark:hover:bg-secondary-900"
                              title="Refill 5"
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(p._id);
                                setEditVal(p.stock.toString());
                              }}
                              className="text-[10px] text-primary-600 hover:underline font-semibold dark:text-primary-400"
                            >
                              Set Stock
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
