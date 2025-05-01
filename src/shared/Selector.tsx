import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder,
  className,
}: {
  options: { value: string; text: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Find the selected option text
  const selectedOptionText =
    options.find((option) => option.value === value)?.text || placeholder;

  return (
    <div ref={selectRef} className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-bgray text-gray-900 dark:text-white ${className}`}
      >
        <span className="truncate">{selectedOptionText}</span>
        <ChevronDown
          size={18}
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } text-gray-500`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-bgray border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto no-scrollbar">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`
                px-3 py-2 cursor-pointer flex items-center justify-between 
                hover:bg-gray-100 dark:hover:bg-ltgray text-[12px]
                ${
                  value === option.value
                    ? "bg-gray-100 dark:bg-bgray/50 text-primary"
                    : "text-gray-900 dark:text-white"
                }
              `}
            >
              <span className="truncate">{option.text}</span>
              {value === option.value && (
                <Check size={16} className="text-primary" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};