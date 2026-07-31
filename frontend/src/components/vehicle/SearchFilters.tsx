import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui';

export interface FilterValues {
  make: string;
  model: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy?: 'price' | 'year' | 'make' | 'model' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface SearchFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  isLoading?: boolean;
  totalCount?: number;
}

const CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Sedan', value: 'SEDAN' },
  { label: 'SUV', value: 'SUV' },
  { label: 'Truck', value: 'TRUCK' },
  { label: 'Hatchback', value: 'HATCHBACK' },
  { label: 'Convertible', value: 'CONVERTIBLE' },
  { label: 'Coupe', value: 'COUPE' },
  { label: 'Van', value: 'VAN' },
  { label: 'Motorcycle', value: 'MOTORCYCLE' },
  { label: 'Supercar', value: 'SUPERCAR' },
];

const SORT_OPTIONS = [
  { label: 'Newest Listed', sortBy: 'createdAt', sortOrder: 'desc' },
  { label: 'Price: Low to High', sortBy: 'price', sortOrder: 'asc' },
  { label: 'Price: High to Low', sortBy: 'price', sortOrder: 'desc' },
  { label: 'Year: Newest', sortBy: 'year', sortOrder: 'desc' },
  { label: 'Year: Oldest', sortBy: 'year', sortOrder: 'asc' },
  { label: 'Make: A to Z', sortBy: 'make', sortOrder: 'asc' },
] as const;

const INITIAL_FILTERS: FilterValues = {
  make: '',
  model: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  onFilterChange,
  isLoading = false,
  totalCount,
}) => {
  // Local state for immediate responsiveness when typing
  const [localFilters, setLocalFilters] = useState<FilterValues>(INITIAL_FILTERS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce the entire filter object with a 400ms delay before firing backend query
  const debouncedFilters = useDebounce(localFilters, 400);

  // Trigger parent filter callback whenever debounced values change
  useEffect(() => {
    onFilterChange(debouncedFilters);
  }, [debouncedFilters, onFilterChange]);

  const handleInputChange = (field: keyof FilterValues, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = SORT_OPTIONS[Number(e.target.value)];
    if (selected) {
      setLocalFilters((prev) => ({
        ...prev,
        sortBy: selected.sortBy,
        sortOrder: selected.sortOrder,
      }));
    }
  };

  const handleReset = () => {
    setLocalFilters(INITIAL_FILTERS);
  };

  const activeFilterCount = [
    localFilters.make,
    localFilters.model,
    localFilters.category,
    localFilters.minPrice,
    localFilters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Primary Search & Quick Filter Controls */}
      <div className="glass p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Make Filter Input */}
          <div className="md:col-span-4 relative">
            <label className="text-[11px] font-medium uppercase tracking-wider text-surface-400 block mb-1">
              Make / Manufacturer
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Tesla, BMW, Toyota..."
                value={localFilters.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                className="input pr-8"
              />
              {localFilters.make && (
                <button
                  type="button"
                  onClick={() => handleInputChange('make', '')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Model Filter Input */}
          <div className="md:col-span-3 relative">
            <label className="text-[11px] font-medium uppercase tracking-wider text-surface-400 block mb-1">
              Model
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Model 3, X5..."
                value={localFilters.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="input pr-8"
              />
              {localFilters.model && (
                <button
                  type="button"
                  onClick={() => handleInputChange('model', '')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <label className="text-[11px] font-medium uppercase tracking-wider text-surface-400 block mb-1">
              Category
            </label>
            <select
              value={localFilters.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="input cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-surface-900 text-white">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Filter Toggle & Reset */}
          <div className="md:col-span-2 flex items-end justify-end gap-2 pt-5 md:pt-0">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className={`btn-ghost text-xs py-2.5 px-3 flex-1 md:flex-none justify-center ${
                showAdvanced || activeFilterCount > 0 ? 'border-brand-500/50 text-brand-400' : ''
              }`}
            >
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters (Price Range & Sort) */}
        {showAdvanced && (
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-center animate-in">
            {/* Min Price */}
            <div className="md:col-span-3">
              <label className="text-[11px] font-medium uppercase tracking-wider text-surface-400 block mb-1">
                Min Price ($)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 10000"
                value={localFilters.minPrice}
                onChange={(e) => handleInputChange('minPrice', e.target.value)}
                className="input"
              />
            </div>

            {/* Max Price */}
            <div className="md:col-span-3">
              <label className="text-[11px] font-medium uppercase tracking-wider text-surface-400 block mb-1">
                Max Price ($)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 100000"
                value={localFilters.maxPrice}
                onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                className="input"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-4">
              <label className="text-[11px] font-medium uppercase tracking-wider text-surface-400 block mb-1">
                Sort By
              </label>
              <select
                onChange={handleSortChange}
                className="input cursor-pointer"
                defaultValue={0}
              >
                {SORT_OPTIONS.map((opt, idx) => (
                  <option key={idx} value={idx} className="bg-surface-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear All Action */}
            <div className="md:col-span-2 flex items-end">
              <Button
                variant="ghost"
                onClick={handleReset}
                disabled={activeFilterCount === 0}
                className="w-full text-xs py-2.5"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Active Filter Pills Bar & Results Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterCount > 0 && (
            <span className="text-surface-400 font-medium mr-1">Active filters:</span>
          )}

          {localFilters.make && (
            <span className="badge-blue flex items-center gap-1.5 py-1 px-2.5">
              Make: <strong className="text-white">{localFilters.make}</strong>
              <button onClick={() => handleInputChange('make', '')} className="hover:text-red-400 ml-1">
                ✕
              </button>
            </span>
          )}

          {localFilters.model && (
            <span className="badge-blue flex items-center gap-1.5 py-1 px-2.5">
              Model: <strong className="text-white">{localFilters.model}</strong>
              <button onClick={() => handleInputChange('model', '')} className="hover:text-red-400 ml-1">
                ✕
              </button>
            </span>
          )}

          {localFilters.category && (
            <span className="badge-blue flex items-center gap-1.5 py-1 px-2.5">
              Category: <strong className="text-white">{localFilters.category}</strong>
              <button onClick={() => handleInputChange('category', '')} className="hover:text-red-400 ml-1">
                ✕
              </button>
            </span>
          )}

          {(localFilters.minPrice || localFilters.maxPrice) && (
            <span className="badge-blue flex items-center gap-1.5 py-1 px-2.5">
              Price:{' '}
              <strong className="text-white">
                ${localFilters.minPrice || '0'} – ${localFilters.maxPrice || '∞'}
              </strong>
              <button
                onClick={() => {
                  handleInputChange('minPrice', '');
                  handleInputChange('maxPrice', '');
                }}
                className="hover:text-red-400 ml-1"
              >
                ✕
              </button>
            </span>
          )}

          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="text-surface-400 hover:text-brand-300 underline font-medium ml-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Results Counter & Loading Indicator */}
        <div className="flex items-center gap-2 text-surface-400 font-medium ml-auto">
          {isLoading && <span className="spinner w-3.5 h-3.5 text-brand-400" aria-hidden="true" />}
          {totalCount !== undefined && (
            <span>
              Showing <strong className="text-white">{totalCount}</strong> matching vehicle{totalCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
