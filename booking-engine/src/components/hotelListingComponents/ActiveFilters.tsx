"use client";

import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ActiveFiltersProps {
  amenities: { [key: string]: boolean };
  sortOrder: string;
  searchQuery: string;
  toggleAmenityFilter: (key: string) => void;
  handleSortChange: (sortOrder: string) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  amenities,
  sortOrder,
  searchQuery,
  toggleAmenityFilter,
  handleSortChange,
  setSearchQuery,
  resetFilters,
}) => {
  const activeFilterCount =
    Object.values(amenities).filter(Boolean).length +
    (sortOrder ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const { i18n, t } = useTranslation();

  if (activeFilterCount === 0) return null;

  // ✅ Standalone function - NO AMENITIES dependency
  const getAmenityLabel = (key: string) => {
    // Convert camelCase or snake_case to readable format
    let label = key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim();
    
    label = label.charAt(0).toUpperCase() + label.slice(1);
    
    // Handle special cases
    const specialCases: { [key: string]: string } = {
      'swimmingpool': 'Swimming Pool',
      'footballground': 'Football Ground',
      'cricketground': 'Cricket Ground',
      'extrabed': 'Extra Bed',
      'wifi': 'WiFi',
      'parking': 'Parking',
      'telephone': 'Telephone',
      'transport': 'Transport',
      'gym': 'Gym',
      'restaurant': 'Restaurant',
      'roomservice': 'Room Service',
    };
    
    const normalizedKey = key.toLowerCase().replace(/[\s_]/g, '');
    return specialCases[normalizedKey] || label;
  };

  const getSortLabel = (sortValue: string) => {
    switch (sortValue) {
      case 'rating_desc':
        return t('HotelListing.highestRating', { defaultValue: 'Highest Rating' });
      case 'rating_asc':
        return t('HotelListing.lowestRating', { defaultValue: 'Lowest Rating' });
      case 'price_desc':
        return t('HotelListing.highestPrice', { defaultValue: 'Highest Price' });
      case 'price_asc':
        return t('HotelListing.lowestPrice', { defaultValue: 'Lowest Price' });
      default:
        return t('HotelListing.recommended', { defaultValue: 'Recommended' });
    }
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 py-2">
      <span className="text-xs text-gray-600 font-tripswift-medium">
        Active filters:
      </span>

      {Object.entries(amenities)
        .filter(([, isSelected]) => isSelected)
        .map(([amenityKey]) => (
          <div
            key={amenityKey}
            className="flex items-center bg-tripswift-blue/5 border border-tripswift-blue/20 rounded-full px-3 py-1 text-xs text-tripswift-blue font-tripswift-regular"
          >
            <span>{getAmenityLabel(amenityKey)}</span>
            <button
              onClick={() => toggleAmenityFilter(amenityKey)}
              className={`text-tripswift-blue/80 hover:text-tripswift-blue ${i18n.language === "ar" ? "mr-1.5" : "ml-1.5"}`}
              aria-label={`Remove ${getAmenityLabel(amenityKey)} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

      {sortOrder && (
        <div className="flex items-center bg-tripswift-blue/5 border border-tripswift-blue/20 rounded-full px-3 py-1 text-xs text-tripswift-blue font-tripswift-regular">
          <span>{getSortLabel(sortOrder)}</span>
          <button
            onClick={() => handleSortChange('')}
            className={`text-tripswift-blue/80 hover:text-tripswift-blue ${i18n.language === "ar" ? "mr-1.5" : "ml-1.5"}`}
            aria-label="Remove sort filter"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {searchQuery && (
        <div className="flex items-center bg-tripswift-blue/5 border border-tripswift-blue/20 rounded-full px-3 py-1 text-xs text-tripswift-blue font-tripswift-regular">
          <span>Name: {searchQuery}</span>
          <button
            onClick={() => setSearchQuery('')}
            className={`text-tripswift-blue/80 hover:text-tripswift-blue ${i18n.language === "ar" ? "mr-1.5" : "ml-1.5"}`}
            aria-label="Remove search filter"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="text-xs text-tripswift-blue font-tripswift-medium hover:underline ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default ActiveFilters;