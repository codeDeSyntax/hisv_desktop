import React from "react";

const OptionButtons: React.FC<{
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  accentColor: string;
  styleOverride?: (opt: string, active: boolean) => React.CSSProperties | undefined;
}> = ({ options, value, onChange, accentColor, styleOverride }) => (
  <div className="flex gap-1">
    {options.map((opt) => {
      const active = value === opt;
      return (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 text-xs rounded-lg capitalize transition-colors ${
            active
              ? "text-white shadow-sm"
              : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
          }`}
          style={
            styleOverride
              ? styleOverride(opt, active)
              : active
                ? { backgroundColor: accentColor }
                : undefined
          }
        >
          {opt}
        </button>
      );
    })}
  </div>
);

export default OptionButtons;
