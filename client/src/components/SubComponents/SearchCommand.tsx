import React, { useState, useEffect, useRef } from "react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { Search } from "lucide-react";
// import { useLanguage } from '@/contexts/LanguageContext';
// import { toast } from "sonner";
// import { SearchHistory, SearchAlerts, SellerOptions } from './search';

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
  searchRef: React.RefObject<HTMLDivElement>;
}

const SearchCommand = ({ isOpen, onClose, searchRef }: SearchCommandProps) => {
  const commandRef = useRef<HTMLDivElement>(null);
  // const { t } = useLanguage();

  const [recentSearches, setRecentSearches] = useState<string[]>([
    "chaussure femme",
    "parfum",
    "table basse",
  ]);

  const [searchValue, setSearchValue] = useState("");

  // Handle search submission
  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    // Add to recent searches if not already included
    if (!recentSearches.includes(query)) {
      setRecentSearches((prevSearches) => [query, ...prevSearches.slice(0, 4)]);

      // Could store in localStorage for persistence
      localStorage.setItem(
        "recentSearches",
        JSON.stringify([query, ...recentSearches.slice(0, 4)])
      );
    }

    // In a real app, we would navigate to search results page
    // toast(`Searching for "${query}"...`);
    onClose();
  };

  // Handle search history item click
  const handleSearchHistoryItemClick = (search: string) => {
    setSearchValue(search);
    handleSearch(search);
  };

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      try {
        const parsedSearches = JSON.parse(savedSearches);
        if (Array.isArray(parsedSearches)) {
          setRecentSearches(parsedSearches);
        }
      } catch (e) {
        console.error("Failed to parse saved searches", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(event.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, searchRef]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && searchValue) {
        handleSearch(searchValue);
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, searchValue, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={commandRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-[85vh] overflow-y-auto"
      style={{ maxWidth: searchRef.current?.offsetWidth }}
    >
      <Command className="border-none">
        <CommandInput
          // placeholder={t('search.placeholder')}
          placeholder="Search for products, brands and more"
          value={searchValue}
          onValueChange={setSearchValue}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(searchValue);
            }
          }}
          className="px-4 py-3 focus:ring-2 focus:ring-cebleu-purple-200 text-base"
        />
        <CommandList className="max-h-[70vh] overflow-y-auto">
          <CommandEmpty className="py-6 text-center text-gray-500">
            {/* {t('search.noResults')}
             */}
            No results found.
          </CommandEmpty>

          <div className="p-4">
            <div className="flex flex-col md:flex-row md:gap-10">
              {/* Left Column - Recent Searches */}
              <div className="flex-1 mb-6 md:mb-0">
                {/* <SearchHistory
                  recentSearches={recentSearches}
                  setRecentSearches={setRecentSearches}
                  onSearchHistoryItemClick={handleSearchHistoryItemClick}
                /> */}

                {/* <SearchAlerts searchValue={searchValue} /> */}
              </div>

              {/* Right Column - Find Sellers & Premium Tools */}
              <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-10">
                {/* <SellerOptions /> */}
              </div>
            </div>
          </div>
        </CommandList>
      </Command>
    </div>
  );
};

export default SearchCommand;
