import React from "react";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  ArrowRight, 
  Boxes, 
  BarChart3, 
  Repeat,
  Zap,
  Globe,
  Lock
} from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-secondary-900 font-sans selection:bg-primary-200 selection:text-primary-900">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:bg-secondary-900/80 dark:border-secondary-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
            <ShieldCheck size={28} className="stroke-[2.5]" />
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">OrderGuard</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-sm font-semibold text-slate-600 hover:text-primary-600 dark:text-secondary-300 dark:hover:text-primary-400 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="inline-flex items-center justify-center h-9 px-4 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden sm:pt-40 sm:pb-24">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-indigo-500 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-lighten" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 mb-8 rounded-full bg-primary-50 border border-primary-100 dark:bg-primary-900/20 dark:border-primary-800/50">
            <span className="flex w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-primary-700 dark:text-primary-400 uppercase">
              OrderGuard v1.0 is Live
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
            Orchestration & <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400">
              Consistency Engine
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-secondary-400 mb-10 leading-relaxed">
            The intelligent backend that keeps your inventory perfectly synced, orchestrates orders seamlessly, and scales your e-commerce operations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="flex items-center justify-center w-full sm:w-auto h-12 px-8 text-base font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-600/20 transition-all hover:-translate-y-0.5"
            >
              Start for free
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link 
              to="/store" 
              className="flex items-center justify-center w-full sm:w-auto h-12 px-8 text-base font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl shadow-sm transition-all dark:bg-secondary-800 dark:text-secondary-200 dark:border-secondary-700 dark:hover:bg-secondary-700/50"
            >
              <Globe size={18} className="mr-2 text-slate-400" />
              View Demo Store
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-secondary-800 border-y border-slate-200 dark:border-secondary-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to run your store
            </h2>
            <p className="text-slate-500 dark:text-secondary-400">
              OrderGuard provides a robust set of tools to manage products, sync inventory, and delight your customers with real-time updates.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-secondary-900/50 border border-slate-100 dark:border-secondary-800 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                <Boxes className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Real-time Inventory</h3>
              <p className="text-slate-600 dark:text-secondary-400 leading-relaxed">
                Never oversell again. Inventory is instantly synced across all touchpoints the moment an order is placed or updated.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-secondary-900/50 border border-slate-100 dark:border-secondary-800 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
                <Repeat className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Order Lifecycle</h3>
              <p className="text-slate-600 dark:text-secondary-400 leading-relaxed">
                Track every order from checkout to delivery. Automated status updates keep your customers informed and happy.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-secondary-900/50 border border-slate-100 dark:border-secondary-800 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                <BarChart3 className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Analytics & Insights</h3>
              <p className="text-slate-600 dark:text-secondary-400 leading-relaxed">
                Make data-driven decisions with built-in analytics. View revenue trends, top-selling products, and customer behavior.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-slate-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-10">
            Enterprise-grade reliability out of the box
          </h2>
          <div className="flex flex-wrap justify-center gap-8 text-slate-400 dark:text-secondary-500">
            <div className="flex items-center gap-2">
              <Lock size={20} />
              <span className="font-semibold">Secure Architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={20} />
              <span className="font-semibold">Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} />
              <span className="font-semibold">Data Protection</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 mb-4 md:mb-0">
            <ShieldCheck size={24} className="stroke-[2.5]" />
            <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">OrderGuard</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-secondary-400">
            &copy; {new Date().getFullYear()} OrderGuard. Built for Scaler AI Labs.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
