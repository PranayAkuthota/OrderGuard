import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Settings as SettingsIcon, Sun, Moon, Bell, Shield, Globe } from "lucide-react";

const Settings = () => {
  const { theme, toggleTheme } = useAuth();
  const [lang, setLang] = useState("en");

  // Notifications switches
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyNewOrders, setNotifyNewOrders] = useState(true);
  const [notifyStatusChanges, setNotifyStatusChanges] = useState(true);

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully! ⚙️");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
          <SettingsIcon size={24} className="text-primary-600 mr-2 animate-spin-slow" />
          Settings Panel
        </h1>
        <p className="text-sm text-slate-500 dark:text-secondary-400">
          Adjust theme modes, system preferences, localization, and notification bounds.
        </p>
      </div>

      <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm dark:bg-secondary-800 dark:border-secondary-700/50 space-y-6">
        
        {/* Theme Preferences */}
        <div className="pb-6 border-b border-slate-100 dark:border-secondary-700/50 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
            {theme === "dark" ? <Moon size={16} className="mr-2" /> : <Sun size={16} className="mr-2" />}
            Theme Display Preferences
          </h3>
          <p className="text-xs text-slate-400">
            Switch between light and dark backgrounds depending on your display preferences.
          </p>
          <div className="flex space-x-3 text-xs">
            <button
              onClick={() => { if (theme !== "light") toggleTheme(); }}
              className={`flex-1 py-3 px-4 border rounded-xl font-bold flex items-center justify-center space-x-2 ${
                theme === "light"
                  ? "border-primary-500 bg-primary-50/20 text-primary-600"
                  : "border-slate-200 dark:border-secondary-700 text-slate-550"
              }`}
            >
              <Sun size={16} />
              <span>Light Theme</span>
            </button>
            <button
              onClick={() => { if (theme !== "dark") toggleTheme(); }}
              className={`flex-1 py-3 px-4 border rounded-xl font-bold flex items-center justify-center space-x-2 ${
                theme === "dark"
                  ? "border-primary-500 bg-primary-950/20 text-primary-400"
                  : "border-slate-250 dark:border-secondary-700 text-slate-450"
              }`}
            >
              <Moon size={16} />
              <span>Dark Theme</span>
            </button>
          </div>
        </div>

        {/* Localizations */}
        <div className="pb-6 border-b border-slate-100 dark:border-secondary-700/50 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
            <Globe size={16} className="mr-2" />
            Language &amp; Region
          </h3>
          <p className="text-xs text-slate-400">
            Select the localization parameters and languages for the seller administration UI.
          </p>
          <select
            className="block w-full max-w-xs px-3 py-2 border border-slate-200 bg-white text-slate-900 rounded-lg text-xs focus:outline-none dark:bg-secondary-900 dark:border-secondary-700 dark:text-white"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="en">English (United States)</option>
            <option value="es">Español (España)</option>
            <option value="fr">Français (France)</option>
            <option value="de">Deutsch (Deutschland)</option>
          </select>
        </div>

        {/* Notification settings */}
        <div className="pb-6 border-b border-slate-100 dark:border-secondary-700/50 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
            <Bell size={16} className="mr-2" />
            Notification Preferences
          </h3>
          <p className="text-xs text-slate-400">
            Configure when the engine triggers push banners or alerts to your notifications feed.
          </p>
          <div className="space-y-3.5 text-xs text-slate-700 dark:text-secondary-300">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                checked={notifyLowStock}
                onChange={(e) => setNotifyLowStock(e.target.checked)}
              />
              <span>Push alerts when active stock goes below reorder thresholds</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                checked={notifyNewOrders}
                onChange={(e) => setNotifyNewOrders(e.target.checked)}
              />
              <span>Generate logs when new customer orders are placed successfully</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                checked={notifyStatusChanges}
                onChange={(e) => setNotifyStatusChanges(e.target.checked)}
              />
              <span>Alert when orders transition across shipping &amp; delivery states</span>
            </label>
          </div>
        </div>

        {/* Security checks */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
            <Shield size={16} className="mr-2" />
            System Operations
          </h3>
          <p className="text-xs text-slate-400">
            Current system deployment: <span className="font-mono bg-slate-100 text-slate-600 dark:bg-secondary-900 dark:text-secondary-400 px-1 py-0.5 rounded">MERN STACK - MONGODB &amp; EXPRESS</span>
          </p>
        </div>

        {/* Action button */}
        <div className="pt-4 border-t border-slate-100 dark:border-secondary-700/50 flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold transition-all"
          >
            Save Preferences
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
