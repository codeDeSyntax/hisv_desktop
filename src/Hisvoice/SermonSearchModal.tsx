import PropTypes from "prop-types";
import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SearchModalProps {
  showSearch: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  searchQuery?: string;
}

const SearchModal = ({
  showSearch,
  onClose,
  onSearch,
  searchQuery,
}: SearchModalProps) => {
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(searchValue);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className={`absolute h-screen overflow-hidden inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
        showSearch ? "opacity-100 z-50" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-start justify-center pt-16">
        <div
          className={`bg-[#202425] rounded-lg p-4 w-full max-w-2xl mx-4 transform transition-transform duration-300 ${
            showSearch ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex items-center gap-4">
            <Search className="text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search in sermon..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-lg"
            />
            <button
              onClick={() => onSearch(searchValue)}
              className="p-2 bg-gray-800 rounded-full text-text transition-colors italic"
            >
              Go
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="text-gray-400" size={20} />
            </button>
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-400">
              Press Enter to jump to matches
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

SearchModal.propTypes = {
  showSearch: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  searchQuery: PropTypes.string,
};

export default SearchModal;
