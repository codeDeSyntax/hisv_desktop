import React from "react";

const OptionButtons: React.FC<{
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  accentColor: string;
  styleOverride?: (
    opt: string,
    active: boolean,
  ) => React.CSSProperties | undefined;
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
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
