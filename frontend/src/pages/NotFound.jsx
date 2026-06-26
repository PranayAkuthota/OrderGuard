import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center px-4">
      <div className="p-4 bg-rose-50 text-rose-500 rounded-full dark:bg-rose-950/20 dark:text-rose-455">
        <ShieldAlert size={48} className="stroke-[2]" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">
        Page Not Found (404)
      </h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md dark:text-secondary-400">
        The route you are trying to access does not exist or has been shifted.
      </p>
      <div className="mt-8">
        <Link
          to="/"
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
