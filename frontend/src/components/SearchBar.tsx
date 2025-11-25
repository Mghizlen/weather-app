import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../lib/api';
import { useDebounce } from '../hooks/useUtils';
import type { GeocodingResult } from '../types/weather';

interface SearchBarProps {
  onLocationSelect: (lat: number, lon: number, city: string, country: string) => void;
  className?: string;
}

/**
 * SearchBar component with autocomplete for city search
 */
export const SearchBar: React.FC<SearchBarProps> = ({ onLocationSelect, className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Search for cities
  useEffect(() => {
    const searchCities = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await apiClient.searchCities(debouncedQuery);
        setResults(data);
        setShowDropdown(data.length > 0);
      } catch (err: any) {
        console.error('Search error:', err);
        setError('Failed to search cities');
        setResults([]);
        setShowDropdown(false);
      } finally {
        setIsLoading(false);
      }
    };

    searchCities();
  }, [debouncedQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (location: GeocodingResult) => {
    onLocationSelect(location.lat, location.lon, location.name, location.country);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a city..."
          className="w-full px-5 py-3 pl-12 pr-4 text-gray-900 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
          aria-label="Search for a city"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={showDropdown}
        />

        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-full mt-2 w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Search Results Dropdown */}
      {showDropdown && results.length > 0 && (
        <div
          id="search-results"
          className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-up"
          role="listbox"
        >
          {results.map((location, index) => (
            <button
              key={`${location.lat}-${location.lon}-${index}`}
              onClick={() => handleSelect(location)}
              className="w-full px-5 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
              role="option"
              aria-selected="false"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">
                    {location.name}
                    {location.state && `, ${location.state}`}
                  </div>
                  <div className="text-sm text-gray-600">{location.country}</div>
                </div>
                <div className="text-xs text-gray-400">
                  📍 {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showDropdown && results.length === 0 && !isLoading && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-100 px-5 py-4 text-gray-600 text-center">
          No cities found for "{query}"
        </div>
      )}
    </div>
  );
};
