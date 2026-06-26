import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createProduct } from "../services/productService";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { ArrowLeft, Plus } from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      category: "Electronics",
      status: "ACTIVE",
      reorderThreshold: 10,
      imageUrl: ""
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await createProduct({
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        reorderThreshold: parseInt(data.reorderThreshold)
      });
      toast.success("Product successfully added to catalog! 🌱");
      navigate("/products");
    } catch (err) {
      toast.error(err.response?.data || "Failed to create product ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      
      {/* Header and Back Link */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 dark:border-secondary-750 dark:hover:bg-secondary-900 text-slate-500"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Add New Product
          </h1>
          <p className="text-sm text-slate-500 dark:text-secondary-400">
            Publish a new offering to your warehouse system.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                className={`block w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:text-white ${
                  errors.name ? "border-rose-500" : "border-slate-200 dark:border-secondary-700"
                }`}
                placeholder="e.g. Logitech MX Master 3S Mouse"
                {...register("name", { required: "Product name is required" })}
              />
              {errors.name && (
                <span className="text-xs text-rose-500 mt-1 block">{errors.name.message}</span>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                SKU Identifier *
              </label>
              <input
                type="text"
                className={`block w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:text-white ${
                  errors.sku ? "border-rose-500" : "border-slate-200 dark:border-secondary-700"
                }`}
                placeholder="LOGI-MX3S-BLK"
                {...register("sku", { required: "SKU is required" })}
              />
              {errors.sku && (
                <span className="text-xs text-rose-500 mt-1 block">{errors.sku.message}</span>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                Category
              </label>
              <select
                className="block w-full px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                {...register("category")}
              >
                <option value="Electronics">Electronics</option>
                <option value="Computers">Computers</option>
                <option value="Accessories">Accessories</option>
                <option value="Furniture">Furniture</option>
                <option value="Fitness">Fitness</option>
                <option value="Footwear">Footwear</option>
                <option value="Home & Kitchen">Home &amp; Kitchen</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                Price ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                className={`block w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:text-white ${
                  errors.price ? "border-rose-500" : "border-slate-200 dark:border-secondary-700"
                }`}
                placeholder="99.99"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0.01, message: "Price must be greater than 0" }
                })}
              />
              {errors.price && (
                <span className="text-xs text-rose-500 mt-1 block">{errors.price.message}</span>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                Initial Stock *
              </label>
              <input
                type="number"
                className={`block w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:text-white ${
                  errors.stock ? "border-rose-500" : "border-slate-200 dark:border-secondary-700"
                }`}
                placeholder="50"
                {...register("stock", {
                  required: "Initial stock is required",
                  min: { value: 0, message: "Stock cannot be negative" }
                })}
              />
              {errors.stock && (
                <span className="text-xs text-rose-500 mt-1 block">{errors.stock.message}</span>
              )}
            </div>

            {/* Reorder Threshold */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                Reorder Alert Threshold
              </label>
              <input
                type="number"
                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                placeholder="10"
                {...register("reorderThreshold")}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                Status
              </label>
              <select
                className="block w-full px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                {...register("status")}
              >
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                Image URL
              </label>
              <input
                type="url"
                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                placeholder="https://images.unsplash.com/photo-..."
                {...register("imageUrl")}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                placeholder="Product description, technical specs..."
                {...register("description")}
              />
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-secondary-700/50">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:border-secondary-750 dark:text-secondary-300 dark:hover:bg-secondary-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            >
              {loading ? <Loader size="sm" color="white" /> : "Save Product"}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default AddProduct;
