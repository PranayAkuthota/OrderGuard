import React, { useState, useEffect } from "react";
import { getCustomers } from "../services/customerService";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { Mail, Phone, ShoppingCart } from "lucide-react";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchCustomersList = async () => {
    setLoading(true);
    try {
      const data = await getCustomers({ search, page, limit: 10 });
      setCustomers(data.customers || []);
      setTotalCustomers(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      toast.error("Failed to load customer profiles ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersList();
  }, [search, page]);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Active Buyers Grid
        </h1>
        <p className="text-sm text-slate-500 dark:text-secondary-400">
          Aggregated list of customer emails, total transaction history, and contact metrics.
        </p>
      </div>

      {/* Query Bar */}
      <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
        <SearchBar
          placeholder="Filter buyers by name or email..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
        />
      </div>

      {/* Table list */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader size="lg" />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customer accounts logged"
          description="Place order items to log distinct buyers in the database."
        />
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase dark:border-secondary-700/50">
                  <th className="py-3.5 px-6">Customer Name</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Phone</th>
                  <th className="py-3.5 px-6 text-center">Orders Count</th>
                  <th className="py-3.5 px-6 text-center">Total Spent</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-secondary-700/30">
                {customers.map((c) => (
                  <tr
                    key={c.email}
                    className="text-xs text-slate-700 hover:bg-slate-50/50 dark:text-secondary-300 dark:hover:bg-secondary-900/10"
                  >
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      {c.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-[10px] text-slate-500">
                      <span className="flex items-center">
                        <Mail size={12} className="mr-1.5 text-slate-400" />
                        {c.email}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {c.phone ? (
                        <span className="flex items-center">
                          <Phone size={12} className="mr-1.5 text-slate-400" />
                          {c.phone}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-slate-800 dark:text-secondary-200">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-secondary-900 text-slate-655 font-bold">
                        <ShoppingCart size={10} className="mr-1 opacity-70" />
                        {c.ordersCount}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-slate-950 dark:text-white">
                      ${c.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        c.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900"
                          : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-secondary-900 dark:border-secondary-700"
                      }`}>
                        {c.status}
                      </span>
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

export default Customers;
