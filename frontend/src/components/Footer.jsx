import React from "react";

const Footer = () => {
  return (
    <footer className="py-4 px-6 bg-white border-t border-slate-200 dark:bg-secondary-800 dark:border-secondary-700/50">
      <div className="flex flex-col items-center justify-between space-y-2 md:flex-row md:space-y-0 text-center">
        <p className="text-xs text-slate-500 dark:text-secondary-400">
          &copy; {new Date().getFullYear()} OrderGuard Inc. All rights reserved.
        </p>
        <p className="text-xs text-slate-400 dark:text-secondary-500">
          Atomic Transaction Orchestration &amp; Inventory Consistency
        </p>
      </div>
    </footer>
  );
};

export default Footer;
