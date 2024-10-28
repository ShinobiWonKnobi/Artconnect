import { useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';

interface UseSearchOptions<T> {
  initialData?: T[];
  searchKeys: (keyof T)[];
  debounceMs?: number;
}

export function useSearch<T>({ initialData = [], searchKeys, debounceMs = 300 }: UseSearchOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const filteredData = useCallback(() => {
    if (!debouncedSearchTerm) return initialData;

    return initialData.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        }
        return false;
      })
    );
  }, [initialData, debouncedSearchTerm, searchKeys]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData: filteredData(),
  };
}