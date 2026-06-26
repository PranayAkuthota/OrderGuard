import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Loader from "../components/Loader";

const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await loginUser(data.email, data.password);
      toast.success("Successfully logged in! 🚀");
      if (res.user.role === "SELLER") {
        navigate("/dashboard");
      } else {
        navigate("/store");
      }
    } catch (err) {
      toast.error(err.response?.data || "Login failed! Please check credentials ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-secondary-900 px-4">
      <div className="w-full max-w-md p-8 bg-white border border-slate-100 rounded-2xl shadow-lg dark:bg-secondary-800 dark:border-secondary-700/50">
        
        {/* Brand logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl dark:bg-primary-950/20 dark:text-primary-400">
            <ShieldCheck size={36} className="stroke-[2.5]" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white">
            Sign in to OrderGuard
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-secondary-400">
            Orchestration &amp; Consistency Engine
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:text-white ${
                  errors.email
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                    : "border-slate-200 focus:border-primary-500 dark:border-secondary-700"
                }`}
                placeholder="seller@orderguard.com"
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-secondary-900 dark:text-white ${
                  errors.password
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10"
                    : "border-slate-200 focus:border-primary-500 dark:border-secondary-700"
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

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          >
            {loading ? <Loader size="sm" color="white" /> : "Sign In"}
          </button>
        </form>

        {/* Redirect to Register */}
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-secondary-400">
          New to OrderGuard?{" "}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:underline dark:text-primary-400"
          >
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
