import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../services/productService";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { Plus, Edit2, Trash2, SlidersHorizontal, Image as ImageIcon } from "lucide-react";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Query States
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("createdAt_desc");
  const [page, setPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts({
        search,
        category,
        status,
        sort,
        page,
        limit: 8
      });
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
      setTotalPages(data.pages || 1);

      // Collect unique categories dynamically if not already populated
      if (categories.length === 0) {
        const allProds = await getProducts({ limit: 200 });
        const uniqueCats = Array.from(new Set((allProds.products || []).map(p => p.category)));
        setCategories(uniqueCats);
      }
    } catch (err) {
      toast.error("Failed to load catalog products ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, status, sort, page]);

  // Handle product deletion with optimistic UI updates
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product from the catalog?")) return;

    // Optimistic UI Update
    const originalProducts = [...products];
    setProducts(products.filter((p) => p._id !== id));

    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully! 🗑️");
      setTotalProducts((prev) => prev - 1);
    } catch (err) {
      // Revert UI if API fails
      setProducts(originalProducts);
      toast.error(err.response?.data || "Deletion failed ❌");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Add product button */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Product Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-secondary-400">
            Manage your store offerings, pricing, SKU codes, and status.
          </p>
        </div>
        <Link
          to="/products/add"
          className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          <Plus size={16} className="mr-2" />
          Add Product
        </Link>
      </div>

      {/* Query Filters Bar */}
      <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-4 dark:bg-secondary-800 dark:border-secondary-700/50">
        <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4 md:items-center">
          
          <SearchBar
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
          />

          <div className="flex flex-wrap gap-3 items-center text-xs">
            {/* Category Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-450 dark:text-secondary-400">Category:</span>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-700 focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-450 dark:text-secondary-400">Status:</span>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-700 focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
              >
                <option value="All">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-450 dark:text-secondary-400">Sort:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1.5 border border-slate-200 bg-white rounded-lg text-slate-700 focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
              >
                <option value="createdAt_desc">Newest Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_desc">Available Stock</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Products list grid/table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader size="lg" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products in catalog"
          description="Your search criteria didn't match any products. Try clearing filters or create a new catalog item."
          actionButton={
            <Link
              to="/products/add"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700"
            >
              Add Product
            </Link>
          }
        />
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase dark:border-secondary-700/50">
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Price</th>
                  <th className="py-3.5 px-6">Stock</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-secondary-700/30">
                {products.map((p) => (
                  <tr
                    key={p._id}
                    className="text-xs text-slate-700 hover:bg-slate-50/50 dark:text-secondary-300 dark:hover:bg-secondary-900/10"
                  >
                    <td className="py-4 px-6 flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-secondary-900 flex-shrink-0 flex items-center justify-center border border-slate-200/50 dark:border-secondary-700">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80";
                            }}
                          />
                        ) : (
                          <ImageIcon size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div className="truncate max-w-[200px]">
                        <span className="font-semibold text-slate-900 dark:text-white block hover:text-primary-600 cursor-pointer">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[180px] block mt-0.5">
                          {p.description || "No description provided"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-[10px] text-slate-500">
                      {p.sku}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-secondary-900 dark:text-secondary-400">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-950 dark:text-white">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      <span
                        className={
                          p.stock <= p.reorderThreshold
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-slate-900 dark:text-white"
                        }
                      >
                        {p.stock}
                      </span>
                      {p.stock <= p.reorderThreshold && (
                        <span className="ml-1.5 text-[9px] text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-1 py-0.2 rounded font-normal animate-pulse">
                          Low Stock
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/products/edit/${p._id}`}
                          className="p-1.5 text-slate-500 border border-slate-200 rounded-lg hover:text-primary-600 hover:bg-slate-50 dark:border-secondary-750 dark:text-secondary-400 dark:hover:text-primary-400 dark:hover:bg-secondary-900"
                          title="Edit Product"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-1.5 text-slate-500 border border-slate-200 rounded-lg hover:text-rose-600 hover:bg-rose-50 dark:border-secondary-750 dark:text-secondary-400 dark:hover:text-rose-400 dark:hover:bg-secondary-900"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
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

export default Products;
