import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { User, Mail, Shield, Check } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "+1 (555) 019-2834",
      role: "Seller Administrator"
    }
  });

  const {
    register: registerPass,
    handleSubmit: handlePassSubmit,
    reset: resetPass,
    formState: { errors: passErrors },
    watch
  } = useForm();

  const newPassword = watch("newPassword");

  const onUpdateProfile = async (data) => {
    setUpdating(true);
    // Simulate updating profile endpoint
    setTimeout(() => {
      setUpdating(false);
      toast.success("Profile details updated successfully! (Demo) 👤");
    }, 800);
  };

  const onUpdatePassword = async (data) => {
    setSavingPass(true);
    // Simulate changing password
    setTimeout(() => {
      setSavingPass(false);
      resetPass();
      toast.success("Account password changed successfully! 🔐");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          My Account Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-secondary-400">
          Manage your personal details, role credentials, and secure passkeys.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Side Avatar Summary */}
        <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-full bg-primary-100 border border-primary-200 text-primary-700 font-extrabold text-3xl flex items-center justify-center dark:bg-primary-955/30 dark:text-primary-400 dark:border-primary-900">
            {user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "S"}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">
            {user?.name || "Seller Admin"}
          </h3>
          <p className="text-xs text-slate-400">{user?.email}</p>
          <div className="mt-4 flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100 dark:bg-primary-950/20 dark:text-primary-450 dark:border-primary-900">
            <Shield size={12} className="mr-1.5" />
            Seller Operations
          </div>
        </div>

        {/* Right Side: Two editable forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile details */}
          <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Edit Account Information
            </h3>
            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                    {...registerProfile("name", { required: "Name is required" })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                    {...registerProfile("email", { required: "Email is required" })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
                    {...registerProfile("phone")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                    Dashboard Role
                  </label>
                  <input
                    type="text"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400 focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 cursor-not-allowed"
                    disabled
                    {...registerProfile("role")}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center"
                >
                  {updating ? <Loader size="sm" color="white" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Password Reset */}
          <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
              Update System Password
            </h3>
            <form onSubmit={handlePassSubmit(onUpdatePassword)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    className={`block w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none dark:bg-secondary-900 dark:text-white ${
                      passErrors.currentPassword ? "border-rose-500" : "border-slate-200 dark:border-secondary-700"
                    }`}
                    placeholder="••••••••"
                    {...registerPass("currentPassword", { required: "Current password is required" })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                    New Password *
                  </label>
                  <input
                    type="password"
                    className={`block w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none dark:bg-secondary-900 dark:text-white ${
                      passErrors.newPassword ? "border-rose-500" : "border-slate-200 dark:border-secondary-700"
                    }`}
                    placeholder="••••••••"
                    {...registerPass("newPassword", {
                      required: "New password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" }
                    })}
                  />
                  {passErrors.newPassword && (
                    <span className="text-xs text-rose-500 mt-1 block">{passErrors.newPassword.message}</span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-secondary-300 uppercase tracking-wide mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    className={`block w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900 focus:outline-none dark:bg-secondary-900 dark:text-white ${
                      passErrors.confirmNewPassword ? "border-rose-500" : "border-slate-200 dark:border-secondary-700"
                    }`}
                    placeholder="••••••••"
                    {...registerPass("confirmNewPassword", {
                      required: "Please confirm new password",
                      validate: (v) => v === newPassword || "Passwords do not match"
                    })}
                  />
                  {passErrors.confirmNewPassword && (
                    <span className="text-xs text-rose-500 mt-1 block">{passErrors.confirmNewPassword.message}</span>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={savingPass}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  {savingPass ? <Loader size="sm" color="white" /> : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;
