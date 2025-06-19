import { useCallback, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export interface UseSearchOptions {
  onSearch: (searchTerm: string) => void;
  debounceMs?: number;
}

export function useSearch({ onSearch, debounceMs = 500 }: UseSearchOptions) {
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const trimmedValue = value.trim();
    setSearchTerm(trimmedValue);
    onSearch(trimmedValue);
  }, debounceMs);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const clearSearch = useCallback(() => {
    setInputValue("");
    debouncedSearch.cancel();
    setSearchTerm("");
    onSearch("");
  }, [debouncedSearch, onSearch]);

  return {
    inputValue,
    searchTerm,
    handleInputChange,
    clearSearch,
  };
}
