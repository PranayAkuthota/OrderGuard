import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ShieldCheck, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Loader from "../components/Loader";

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("CUSTOMER"); // Role selection state

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await registerUser(data.name, data.email, data.password, role);
      toast.success("Account successfully created! Welcome to OrderGuard 🚀");
      if (res.user.role === "SELLER") {
        navigate("/");
      } else {
        navigate("/store");
      }
    } catch (err) {
      toast.error(err.response?.data || "Registration failed! Please try again ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-secondary-900 px-4 py-8">
      <div className="w-full max-w-md p-8 bg-white border border-slate-100 rounded-2xl shadow-lg dark:bg-secondary-800 dark:border-secondary-700/50">
        
        {/* Logo and Headings */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl dark:bg-primary-950/20 dark:text-primary-400">
            <ShieldCheck size={36} className="stroke-[2.5]" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white">
            Create OrderGuard Account
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-secondary-400">
            Join the inventory consistency platform
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
              Account Type
            </label>
            <div className="flex space-x-2 text-xs">
              <button
                type="button"
                onClick={() => setRole("CUSTOMER")}
                className={`flex-1 py-2 px-3 border rounded-lg font-semibold text-center transition-all ${
                  role === "CUSTOMER"
                    ? "border-primary-500 bg-primary-50/20 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400"
                    : "border-slate-200 dark:border-secondary-700 text-slate-500"
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole("SELLER")}
                className={`flex-1 py-2 px-3 border rounded-lg font-semibold text-center transition-all ${
                  role === "SELLER"
                    ? "border-primary-500 bg-primary-50/20 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400"
                    : "border-slate-200 dark:border-secondary-700 text-slate-500"
                }`}
              >
                Seller (Merchant)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User size={16} />
              </span>
              <input
                type="text"
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:text-white ${
                  errors.name ? "border-rose-500" : "border-slate-200 dark:border-secondary-700"
                }`}
                placeholder="John Doe"
                {...register("name", { required: "Name is required" })}
              />
            </div>
            {errors.name && (
              <span className="text-xs text-rose-500 mt-1 block">
                {errors.name.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:text-white ${
                  errors.email ? "border-rose-500" : "border-slate-200 dark:border-secondary-700"
                }`}
                placeholder="john@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
            </div>
            {errors.email && (
              <span className="text-xs text-rose-500 mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className={`block w-full pl-10 pr-10 py-2 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:text-white ${
                  errors.password ? "border-rose-500" : "border-slate-200 dark:border-secondary-700"
                }`}
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-rose-500 mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:text-white ${
                  errors.confirmPassword ? "border-rose-500" : "border-slate-200 dark:border-secondary-700"
                }`}
                placeholder="••••••••"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (val) => val === password || "Passwords do not match"
                })}
              />
            </div>
            {errors.confirmPassword && (
              <span className="text-xs text-rose-500 mt-1 block">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 mt-2"
          >
            {loading ? <Loader size="sm" color="white" /> : "Sign Up"}
          </button>
        </form>

        {/* Redirect to login */}
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-secondary-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
          >
            Log in
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
