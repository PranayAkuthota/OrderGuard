import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({
  placeholder = "Search...",
  value = "",
  onChange,
  debounceMs = 300
}) => {
  const [innerValue, setInnerValue] = useState(value);

  // Sync internal state with external value changes
  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  // Debounce keypress triggers
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(innerValue);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [innerValue, debounceMs]);

  const handleClear = () => {
    setInnerValue("");
    onChange("");
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search size={18} />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-secondary-900 dark:border-secondary-700 dark:text-white dark:placeholder-secondary-400"
        placeholder={placeholder}
        value={innerValue}
        onChange={(e) => setInnerValue(e.target.value)}
      />
      {innerValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
