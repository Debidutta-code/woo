"use client";
import React, { useState, useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  FilterState,
  BEDROOM_OPTIONS,
  SORT_OPTIONS,
  SPECIAL_OPTIONS,
} from "../hotelBox/FilterModal";

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  activeFilterCount: number;
  hotelsData?: any[];
  allAmenities?: string[];
  propertyCategories?: string[]; // 👈 ADD THIS
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  activeFilterCount,
  hotelsData = [],
  allAmenities = [],
  propertyCategories = [], // 👈 ADD THIS
}) => {
  const { t } = useTranslation();

  // Local state for price inputs (immediate UI updates)
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || 0);
  const [localMaxPrice, setLocalMaxPrice] = useState(
    filters.maxPrice || 100000,
  );

  // Dynamic amenities state
  const [dynamicAmenities, setDynamicAmenities] = useState<
    { key: string; label: string }[]
  >([]);
  const [loadingAmenities, setLoadingAmenities] = useState(true);

  // Show more functionality for amenities
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const VISIBLE_AMENITIES_COUNT = 5;

  // Property categories state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.propertyCategories || [],
  );

  // Debounced values
  const debouncedMinPrice = useDebounce(localMinPrice, 500);
  const debouncedMaxPrice = useDebounce(localMaxPrice, 500);

  // Update filters when debounced values change
  const isFirstRender = useRef(true);

  // Use amenities from props (no API call)
  useEffect(() => {
    if (allAmenities && allAmenities.length > 0) {
      const amenitiesList = allAmenities.map((name: string) => ({
        key: name.toLowerCase().replace(/\s/g, ""),
        label: name,
      }));
      setDynamicAmenities(amenitiesList);
      setLoadingAmenities(false);
    } else {
      setLoadingAmenities(false);
    }
  }, [allAmenities]);

  // Update filters when debounced values change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (
      debouncedMinPrice !== filters.minPrice ||
      debouncedMaxPrice !== filters.maxPrice
    ) {
      onFilterChange({
        ...filters,
        minPrice: debouncedMinPrice,
        maxPrice: debouncedMaxPrice,
      });
    }
  }, [debouncedMinPrice, debouncedMaxPrice]);

  // Sync local state with external filter changes
  useEffect(() => {
    if (filters.minPrice !== undefined && filters.minPrice !== localMinPrice) {
      setLocalMinPrice(filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== localMaxPrice) {
      setLocalMaxPrice(filters.maxPrice);
    }
  }, [filters.minPrice, filters.maxPrice]);

  const toggleAmenity = (amenityKey: string) => {
    onFilterChange({
      ...filters,
      amenities: {
        ...filters.amenities,
        [amenityKey]: !filters.amenities[amenityKey],
      },
    });
  };

  const toggleRoomAmenity = (amenityKey: string) => {
    onFilterChange({
      ...filters,
      roomAmenities: {
        ...filters.roomAmenities,
        [amenityKey]: !filters.roomAmenities[amenityKey],
      },
    });
  };

  const toggleStarRating = (rating: number) => {
    const newRatings = filters.star_rating?.includes(rating)
      ? filters.star_rating.filter((r) => r !== rating)
      : [...(filters.star_rating || []), rating];
    onFilterChange({
      ...filters,
      star_rating: newRatings,
    });
  };

  const toggleSpecial = (
    special: "family" | "child" | "business" | "smoking",
  ) => {
    const newSpecial = filters.special?.includes(special)
      ? filters.special.filter((s) => s !== special)
      : [...(filters.special || []), special];
    onFilterChange({
      ...filters,
      special: newSpecial,
    });
  };

  const toggleBedroom = (bedroom: number) => {
    const newBedrooms = filters.bedrooms?.includes(bedroom)
      ? filters.bedrooms.filter((b) => b !== bedroom)
      : [...(filters.bedrooms || []), bedroom];
    onFilterChange({
      ...filters,
      bedrooms: newBedrooms,
    });
  };

  const togglePropertyCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
    onFilterChange({
      ...filters,
      propertyCategories: selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category],
    });
  };

  const togglePaymentMethod = (method: "payByCard" | "payAtHotel") => {
    onFilterChange({
      ...filters,
      paymentMethods: {
        ...filters.paymentMethods,
        [method]: !filters.paymentMethods?.[method],
      },
    });
  };

  const handleSortChange = (sortOrder: string) => {
    onFilterChange({
      ...filters,
      sortOrder,
    });
  };

  const handleReset = () => {
    setLocalMinPrice(0);
    setLocalMaxPrice(100000);
    setShowAllAmenities(false);
    setSelectedCategories([]);
    onFilterChange({
      amenities: {},
      roomAmenities: {},
      sortOrder: "",
      rating: null,
      bedType: [],
      roomType: [],
      star_rating: [],
      propertyTypes: [],
      propertyCategories: [],
      special: [],
      bedrooms: [],
      customerReview: [],
      paymentMethods: {},
      neighborhoods: [],
      touristAttractions: [],
      minPrice: undefined,
      maxPrice: undefined,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="px-5 py-4 bg-gradient-to-br from-tripswift-blue/10 via-tripswift-blue/5 to-transparent border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-tripswift-bold text-tripswift-black text-lg mb-0.5">
              {t("HotelBox.FilterModal.title", { defaultValue: "Filters" })}
            </h3>
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-tripswift-medium bg-tripswift-blue text-white">
                  {activeFilterCount}
                </span>
                <span className="text-xs text-gray-600">
                  {activeFilterCount === 1
                    ? "filter applied"
                    : "filters applied"}
                </span>
              </div>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={handleReset}
              className="text-sm text-tripswift-blue font-tripswift-medium hover:text-tripswift-blue/80 hover:underline transition-all px-3 py-1.5 rounded-lg hover:bg-tripswift-blue/5"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* PRICE RANGE */}
        <div>
          <h3 className="text-sm font-tripswift-bold text-tripswift-black mb-4">
            {t("HotelBox.FilterModal.priceRange", {
              defaultValue: "Your budget (per night)",
            })}
          </h3>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs font-tripswift-bold text-gray-700 mb-2 block uppercase tracking-wider">
                  Minimum
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-tripswift-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={localMinPrice}
                    onChange={(e) => {
                      const value = Math.max(
                        0,
                        Math.min(parseInt(e.target.value) || 0, 49999),
                      );
                      if (value < localMaxPrice) {
                        setLocalMinPrice(value);
                      }
                    }}
                    className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-3 text-sm font-tripswift-medium focus:outline-none focus:ring-2 focus:ring-tripswift-blue/40 focus:border-tripswift-blue transition-all hover:border-gray-300"
                    min="0"
                    max="49999"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="pt-7 text-gray-300 font-tripswift-bold text-lg">
                —
              </div>

              <div className="flex-1">
                <label className="text-xs font-tripswift-bold text-gray-700 mb-2 block uppercase tracking-wider">
                  Maximum
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-tripswift-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={localMaxPrice}
                    onChange={(e) => {
                      const value = Math.max(
                        1,
                        Math.min(parseInt(e.target.value) || 100000, 100000),
                      );
                      if (value > localMinPrice) {
                        setLocalMaxPrice(value);
                      }
                    }}
                    className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-3 text-sm font-tripswift-medium focus:outline-none focus:ring-2 focus:ring-tripswift-blue/40 focus:border-tripswift-blue transition-all hover:border-gray-300"
                    min="1"
                    max="100000"
                    placeholder="100000"
                  />
                </div>
              </div>
            </div>

            <div className="px-2 py-3">
              <div className="relative h-2">
                <div className="absolute w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full"></div>
                <div
                  className="absolute h-full bg-gradient-to-r from-tripswift-blue to-blue-500 rounded-full shadow-sm"
                  style={{
                    left: `${(localMinPrice / 100000) * 100}%`,
                    right: `${100 - (localMaxPrice / 100000) * 100}%`,
                  }}
                ></div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="100"
                  value={localMinPrice}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value < localMaxPrice - 100) {
                      setLocalMinPrice(value);
                    }
                  }}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-tripswift-blue [&::-webkit-slider-thumb]:shadow-lg"
                  style={{
                    zIndex: localMinPrice > localMaxPrice - 1000 ? 5 : 3,
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="100"
                  value={localMaxPrice}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > localMinPrice + 100) {
                      setLocalMaxPrice(value);
                    }
                  }}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:border-3 [&::-webkit-slider-thumb]:border-tripswift-blue [&::-webkit-slider-thumb]:shadow-lg"
                  style={{ zIndex: 4 }}
                />
              </div>
              <div className="flex justify-between mt-3 px-1">
                <span className="text-xs text-gray-600 font-tripswift-bold bg-gray-50 px-2 py-1 rounded-md">
                  ${localMinPrice.toLocaleString()}
                </span>
                <span className="text-xs text-gray-600 font-tripswift-bold bg-gray-50 px-2 py-1 rounded-md">
                  ${localMaxPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* STAR RATING */}
        <div>
          <h3 className="text-sm font-tripswift-bold text-tripswift-black mb-4">
            {t("HotelBox.FilterModal.propertyRating", {
              defaultValue: "Property Rating",
            })}
          </h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <label
                key={`rating-${rating}`}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gradient-to-r hover:from-tripswift-blue/5 hover:to-transparent p-1 rounded-lg transition-all group"
              >
                <input
                  type="checkbox"
                  checked={filters.star_rating?.includes(rating) || false}
                  onChange={() => toggleStarRating(rating)}
                  className="w-4 h-4 rounded border-2 border-gray-300 text-tripswift-blue focus:ring-2 focus:ring-tripswift-blue/30 cursor-pointer transition-all"
                />
                <div className="flex items-center gap-1">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-amber-400 fill-amber-400 drop-shadow-sm"
                    />
                  ))}
                  {Array.from({ length: 5 - rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gray-200" />
                  ))}
                </div>
              </label>
            ))}
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* PROPERTY AMENITIES - DYNAMIC with Show More */}
        <div>
          <h3 className="text-sm font-tripswift-bold text-tripswift-black mb-4">
            {t("HotelBox.FilterModal.amenities", {
              defaultValue: "Property Amenities",
            })}
          </h3>
          <div className="space-y-2">
            {loadingAmenities ? (
              <div className="text-center py-4 text-gray-500">
                Loading amenities...
              </div>
            ) : dynamicAmenities.length > 0 ? (
              <>
                {dynamicAmenities
                  .slice(
                    0,
                    showAllAmenities
                      ? dynamicAmenities.length
                      : VISIBLE_AMENITIES_COUNT,
                  )
                  .map(({ key, label }) => (
                    <label
                      key={key}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gradient-to-r hover:from-tripswift-blue/5 hover:to-transparent p-1 rounded-lg transition-all group"
                    >
                      <input
                        type="checkbox"
                        checked={filters.amenities[key] || false}
                        onChange={() => toggleAmenity(key)}
                        className="w-4 h-4 rounded border-2 border-gray-300 text-tripswift-blue focus:ring-2 focus:ring-tripswift-blue/30 cursor-pointer transition-all"
                      />
                      <span
                        className="text-sm text-tripswift-black font-tripswift-medium group-hover:text-tripswift-blue transition-colors"
                        style={{ textTransform: "none" }}
                      >
                        {label}
                      </span>
                    </label>
                  ))}

                {/* Show More / Show Less button */}
                {dynamicAmenities.length > VISIBLE_AMENITIES_COUNT && (
                  <button
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="text-sm text-tripswift-blue font-tripswift-medium hover:underline mt-2"
                  >
                    {showAllAmenities ? "Show less" : "Show more"}
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No amenities available
              </div>
            )}
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* PROPERTY CATEGORIES */}
        <div>
          <h3 className="text-sm font-tripswift-bold text-tripswift-black mb-4">
            Property Category
          </h3>
          <div className="space-y-2">
            {propertyCategories && propertyCategories.length > 0 ? (
              propertyCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-3 cursor-pointer hover:bg-gradient-to-r hover:from-tripswift-blue/5 hover:to-transparent p-1 rounded-lg transition-all group"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => togglePropertyCategory(category)}
                    className="w-4 h-4 rounded border-2 border-gray-300 text-tripswift-blue focus:ring-2 focus:ring-tripswift-blue/30 cursor-pointer transition-all"
                  />
                  <span
                    className="text-sm text-tripswift-black font-tripswift-medium group-hover:text-tripswift-blue transition-colors"
                    style={{ textTransform: "none" }}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </label>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No categories available
              </div>
            )}
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* BEDROOMS */}
        <div>
          <h3 className="text-sm font-tripswift-bold text-tripswift-black mb-4">
            {t("HotelBox.FilterModal.bedrooms", { defaultValue: "Bedrooms" })}
          </h3>
          <div className="space-y-2">
            {BEDROOM_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gradient-to-r hover:from-tripswift-blue/5 hover:to-transparent p-1 rounded-lg transition-all group"
              >
                <input
                  type="checkbox"
                  checked={filters.bedrooms?.includes(value) || false}
                  onChange={() => toggleBedroom(value)}
                  className="w-4 h-4 rounded border-2 border-gray-300 text-tripswift-blue focus:ring-2 focus:ring-tripswift-blue/30 cursor-pointer transition-all"
                />
                <span
                  className="text-sm text-tripswift-black font-tripswift-medium group-hover:text-tripswift-blue transition-colors"
                  style={{ textTransform: "none" }}
                >
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        {/* PAYMENT OPTIONS */}
        <div>
          <h3 className="text-sm font-tripswift-bold text-tripswift-black mb-4">
            Payment Options
          </h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer hover:bg-gradient-to-r hover:from-tripswift-blue/5 hover:to-transparent p-1 rounded-lg transition-all group">
              <input
                type="checkbox"
                checked={filters.paymentMethods?.payByCard || false}
                onChange={() => togglePaymentMethod("payByCard")}
                className="w-4 h-4 rounded border-2 border-gray-300 text-tripswift-blue focus:ring-2 focus:ring-tripswift-blue/30 cursor-pointer transition-all"
              />
              <span
                className="text-sm text-tripswift-black font-tripswift-medium group-hover:text-tripswift-blue transition-colors"
                style={{ textTransform: "none" }}
              >
                Pay by Card
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer hover:bg-gradient-to-r hover:from-tripswift-blue/5 hover:to-transparent p-1 rounded-lg transition-all group">
              <input
                type="checkbox"
                checked={filters.paymentMethods?.payAtHotel || false}
                onChange={() => togglePaymentMethod("payAtHotel")}
                className="w-4 h-4 rounded border-2 border-gray-300 text-tripswift-blue focus:ring-2 focus:ring-tripswift-blue/30 cursor-pointer transition-all"
              />
              <span
                className="text-sm text-tripswift-black font-tripswift-medium group-hover:text-tripswift-blue transition-colors"
                style={{ textTransform: "none" }}
              >
                Pay at Hotel
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
