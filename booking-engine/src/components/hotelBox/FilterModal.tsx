"use client";
import React, { useEffect, useRef, useState } from "react";
import { X, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "../ui/card";
import { useTranslation } from "react-i18next";

export interface FilterState {
  amenities: { [key: string]: boolean };
  roomAmenities: { [key: string]: boolean };
  sortOrder: string;
  rating: number | null;
  bedType: string[];
  roomType: string[];
  star_rating: number[];
  propertyTypes: string[];
  propertyCategories: string[];
  special: ("family" | "child" | "business" | "smoking")[];
  bedrooms: number[];
  customerReview: number[];
  paymentMethods: {
    payByCard?: boolean;
    payAtHotel?: boolean;
  };
  neighborhoods: string[];
  touristAttractions: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (filters: FilterState) => void;
  initialFilters: FilterState;
  hotelsData?: any[];
  allAmenities?: string[];
  propertyCategories?: string[];
  propertyTypes?: string[];
}

export const AMENITIES = [
  { key: "wifi", labelKey: "wifi" },
  { key: "swimming_pool", labelKey: "swimming_pool" },
  { key: "fitness_center", labelKey: "fitness_center" },
  { key: "spa_and_wellness", labelKey: "spa_and_wellness" },
  { key: "restaurant", labelKey: "restaurant" },
  { key: "room_service", labelKey: "room_service" },
  { key: "bar_and_lounge", labelKey: "bar_and_lounge" },
  { key: "parking", labelKey: "parking" },
  { key: "concierge_services", labelKey: "concierge_services" },
  { key: "pet_friendly", labelKey: "pet_friendly" },
  { key: "business_facilities", labelKey: "business_facilities" },
  { key: "laundry_services", labelKey: "laundry_services" },
  { key: "child_friendly_facilities", labelKey: "child_friendly_facilities" },
  { key: "non_smoking_rooms", labelKey: "non_smoking_rooms" },
  {
    key: "facilities_for_disabled_guests",
    labelKey: "facilities_for_disabled_guests",
  },
  { key: "family_rooms", labelKey: "family_rooms" },
] as const;
export const ROOM_AMENITIES_BY_CATEGORY = {
  "Basic Amenities": [
    { key: "bathroom", label: "Bathroom" },
    { key: "shower", label: "Shower" },
    { key: "toilet", label: "Toilet" },
    { key: "freeToiletries", label: "Free Toiletries" },
    { key: "linensBedding", label: "Linens & Bedding" },
  ],
  Furniture: [
    { key: "desk", label: "Desk" },
    { key: "tableChairs", label: "Table & Chairs" },
    { key: "dresserWardrobe", label: "Dresser/Wardrobe" },
  ],
  "Space & Layout": [
    { key: "balcony", label: "Balcony" },
    { key: "sittingArea", label: "Sitting Area" },
    { key: "diningArea", label: "Dining Area" },
  ],
  Technology: [
    { key: "wifiInternet", label: "WiFi/Internet" },
    { key: "television", label: "Television" },
    { key: "telephone", label: "Telephone" },
  ],
  "Climate Control": [
    { key: "airConditioning", label: "Air Conditioning" },
    { key: "heating", label: "Heating" },
  ],
};

export const BED_TYPES = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "king", label: "King" },
  { value: "twin", label: "Twin" },
  { value: "queen", label: "Queen" },
];

export const ROOM_TYPES = [
  { value: "single", label: "Single Room" },
  { value: "double", label: "Double Room" },
  { value: "suite", label: "Suite" },
  { value: "deluxe", label: "Deluxe" },
  { value: "standard", label: "Standard" },
];

export const SPECIAL_OPTIONS = [
  { value: "family", label: "Family Friendly" },
  { value: "child", label: "Child Friendly" },
  { value: "business", label: "Business Facilities" },
  { value: "smoking", label: "Smoking Allowed" },
];

export const BEDROOM_OPTIONS = [
  { value: 1, label: "1+ Bedroom" },
  { value: 2, label: "2+ Bedrooms" },
  { value: 3, label: "3+ Bedrooms" },
  { value: 4, label: "4+ Bedrooms" },
];

export const SORT_OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "rating_desc", label: "Highest Rating" },
  { value: "rating_asc", label: "Lowest Rating" },
  { value: "price_desc", label: "Highest Price" },
  { value: "price_asc", label: "Lowest Price" },
];

// ============================================================================
// FILTER MODAL COMPONENT
// ============================================================================

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFilters,
  hotelsData = [],
  allAmenities = [],
  propertyCategories = [],
  propertyTypes = [],
}) => {
  const [selectedAmenities, setSelectedAmenities] = useState<{
    [key: string]: boolean;
  }>(initialFilters.amenities || {});
  const [selectedRoomAmenities, setSelectedRoomAmenities] = useState<{
    [key: string]: boolean;
  }>(initialFilters.roomAmenities || {});
  const [selectedBedTypes, setSelectedBedTypes] = useState<string[]>(
    initialFilters.bedType || [],
  );
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>(
    initialFilters.roomType || [],
  );
  const [selectedStarRatings, setSelectedStarRatings] = useState<number[]>(
    initialFilters.star_rating || [],
  );
  const [minPrice, setMinPrice] = useState<number>(
    initialFilters.minPrice || 0,
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    initialFilters.maxPrice || 100000,
  );
  const [selectedSpecial, setSelectedSpecial] = useState<
    ("family" | "child" | "business" | "smoking")[]
  >(initialFilters.special || []);
  const [selectedBedrooms, setSelectedBedrooms] = useState<number[]>(
    initialFilters.bedrooms || [],
  );
  const [selectedCustomerReview, setSelectedCustomerReview] = useState<
    number[]
  >(initialFilters.customerReview || []);
  const [sortOrder, setSortOrder] = useState<string>(
    initialFilters.sortOrder || "",
  );
  const [paymentMethods, setPaymentMethods] = useState<{
    payByCard?: boolean;
    payAtHotel?: boolean;
  }>(initialFilters.paymentMethods || {});

  // Dynamic amenities state
  const [dynamicAmenities, setDynamicAmenities] = useState<
    { key: string; label: string }[]
  >([]);
  const [loadingAmenities, setLoadingAmenities] = useState(true);

  // Show more functionality
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const VISIBLE_AMENITIES_COUNT = 5;

  const [amenitiesCurrentPage, setAmenitiesCurrentPage] = useState(0);
  const AMENITIES_PER_PAGE = 5;

  // Property categories state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters.propertyCategories || [],
  );

  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    initialFilters.propertyTypes || [],
  );

  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    priceRange: true,
    propertyAmenities: true,
    propertyCategories: false,
    propertyTypes: false,
    roomAmenities: false,
    bedType: false,
    roomType: false,
    rating: true,
    special: false,
    bedrooms: false,
    customerReview: false,
    payment: false,
    sort: false,
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const { t, ready } = useTranslation();

  // Use amenities from props (no API call)
  useEffect(() => {
    if (allAmenities && allAmenities.length > 0) {
      const amenitiesList = allAmenities.map((name: string) => ({
        key: name
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()),
        label: name,
      }));
      setDynamicAmenities(amenitiesList);
      setLoadingAmenities(false);
    } else {
      setLoadingAmenities(false);
    }
  }, [allAmenities]);

  useEffect(() => {
    setSelectedAmenities(initialFilters.amenities || {});
    setSelectedRoomAmenities(initialFilters.roomAmenities || {});
    setSelectedBedTypes(initialFilters.bedType || []);
    setSelectedRoomTypes(initialFilters.roomType || []);
    setSelectedStarRatings(initialFilters.star_rating || []);
    setSelectedSpecial(initialFilters.special || []);
    setSelectedBedrooms(initialFilters.bedrooms || []);
    setSelectedCustomerReview(initialFilters.customerReview || []);
    setSortOrder(initialFilters.sortOrder || "");
    setPaymentMethods(initialFilters.paymentMethods || {});
    setMinPrice(initialFilters.minPrice || 0);
    setMaxPrice(initialFilters.maxPrice || 100000);
  }, [initialFilters]);

  const togglePropertyCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const togglePropertyType = (type: string) => {
    setSelectedPropertyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const handleSave = () => {
    onSave({
      amenities: selectedAmenities,
      roomAmenities: selectedRoomAmenities,
      bedType: selectedBedTypes,
      roomType: selectedRoomTypes,
      star_rating: selectedStarRatings,
      propertyTypes: selectedPropertyTypes,
      propertyCategories: selectedCategories,
      special: selectedSpecial,
      bedrooms: selectedBedrooms,
      customerReview: selectedCustomerReview,
      sortOrder: sortOrder,
      rating: null,
      paymentMethods: paymentMethods,
      neighborhoods: initialFilters.neighborhoods || [],
      touristAttractions: initialFilters.touristAttractions || [],
      minPrice: minPrice,
      maxPrice: maxPrice,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedAmenities({});
    setSelectedRoomAmenities({});
    setSelectedBedTypes([]);
    setSelectedRoomTypes([]);
    setSelectedStarRatings([]);
    setSelectedSpecial([]);
    setSelectedBedrooms([]);
    setSelectedCustomerReview([]);
    setSortOrder("");
    setPaymentMethods({});
    setMinPrice(0);
    setMaxPrice(100000);
    setShowAllAmenities(false);
    setSelectedCategories([]);
    setSelectedPropertyTypes([]);
  };

  const toggleAmenity = (amenityKey: string) => {
    setSelectedAmenities((prev) => ({
      ...prev,
      [amenityKey]: !prev[amenityKey],
    }));
  };

  const toggleRoomAmenity = (amenityKey: string) => {
    setSelectedRoomAmenities((prev) => ({
      ...prev,
      [amenityKey]: !prev[amenityKey],
    }));
  };

  const toggleBedType = (bedType: string) => {
    setSelectedBedTypes((prev) =>
      prev.includes(bedType)
        ? prev.filter((b) => b !== bedType)
        : [...prev, bedType],
    );
  };

  const toggleRoomType = (roomType: string) => {
    setSelectedRoomTypes((prev) =>
      prev.includes(roomType)
        ? prev.filter((r) => r !== roomType)
        : [...prev, roomType],
    );
  };

  const toggleStarRating = (rating: number) => {
    setSelectedStarRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
  };

  const toggleSpecial = (
    special: "family" | "child" | "business" | "smoking",
  ) => {
    setSelectedSpecial((prev) =>
      prev.includes(special)
        ? prev.filter((s) => s !== special)
        : [...prev, special],
    );
  };

  const toggleBedroom = (bedroom: number) => {
    setSelectedBedrooms((prev) =>
      prev.includes(bedroom)
        ? prev.filter((b) => b !== bedroom)
        : [...prev, bedroom],
    );
  };

  const toggleCustomerReview = (review: number) => {
    setSelectedCustomerReview((prev) =>
      prev.includes(review)
        ? prev.filter((r) => r !== review)
        : [...prev, review],
    );
  };

  const togglePaymentMethod = (method: "payByCard" | "payAtHotel") => {
    setPaymentMethods((prev) => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!ready) {
    return <div>Loading translations...</div>;
  }

  if (!isOpen) return null;

  // Count active filters
  const activeFilterCount =
    Object.values(selectedAmenities).filter(Boolean).length +
    Object.values(selectedRoomAmenities).filter(Boolean).length +
    selectedStarRatings.length +
    selectedBedTypes.length +
    selectedRoomTypes.length +
    selectedSpecial.length +
    selectedBedrooms.length +
    selectedCustomerReview.length +
    Object.values(paymentMethods).filter(Boolean).length +
    (sortOrder ? 1 : 0);

  return (
    <div className="fixed inset-0 bg-tripswift-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card
        ref={modalRef}
        className="w-full max-w-3xl h-[90vh] bg-tripswift-off-white rounded-xl shadow-lg flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-tripswift-bold text-tripswift-black">
              {t("HotelBox.FilterModal.title", { defaultValue: "Filters" })}
            </h2>
            {activeFilterCount > 0 && (
              <p className="text-sm text-tripswift-black/60 mt-1">
                {activeFilterCount}{" "}
                {activeFilterCount === 1 ? "filter" : "filters"} active
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={t("HotelBox.FilterModal.ariaCloseModal", {
              defaultValue: "Close modal",
            })}
          >
            <X className="h-6 w-6 text-tripswift-black" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* PRICE RANGE */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("priceRange")}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <h3 className="font-tripswift-medium text-tripswift-black">
                  {t("HotelBox.FilterModal.priceRange", {
                    defaultValue: "Your budget (per night)",
                  })}
                </h3>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    expandedSections.priceRange ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.priceRange && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1.5 block font-tripswift-medium">
                        MIN
                      </label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) =>
                          setMinPrice(parseInt(e.target.value) || 0)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-tripswift-medium focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 focus:border-tripswift-blue transition-all"
                        min="0"
                        max="49999"
                      />
                    </div>
                    <div className="pt-6 text-gray-300 font-tripswift-bold">
                      —
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1.5 block font-tripswift-medium">
                        MAX
                      </label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) =>
                          setMaxPrice(parseInt(e.target.value) || 100000)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-tripswift-medium focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 focus:border-tripswift-blue transition-all"
                        min="1"
                        max="100000"
                      />
                    </div>
                  </div>
                  <div className="px-1 py-2">
                    <div className="relative h-1.5">
                      <div className="absolute w-full h-full bg-gray-200 rounded-full"></div>
                      <div
                        className="absolute h-full bg-tripswift-blue rounded-full"
                        style={{
                          left: `${(minPrice / 100000) * 100}%`,
                          right: `${100 - (maxPrice / 100000) * 100}%`,
                        }}
                      ></div>
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="100"
                        value={minPrice}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value < maxPrice - 100) {
                            setMinPrice(value);
                          }
                        }}
                        className="absolute w-full h-1.5 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-tripswift-blue [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                        style={{ zIndex: minPrice > maxPrice - 1000 ? 5 : 3 }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="100"
                        value={maxPrice}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value > minPrice + 100) {
                            setMaxPrice(value);
                          }
                        }}
                        className="absolute w-full h-1.5 bg-transparent appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-tripswift-blue [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                        style={{ zIndex: 4 }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-500 font-tripswift-medium">
                        USD {minPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 font-tripswift-medium">
                        USD {maxPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PROPERTY AMENITIES - DYNAMIC with Pagination */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("propertyAmenities")}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <h3 className="font-tripswift-medium text-tripswift-black">
                  {t("HotelBox.FilterModal.amenities", {
                    defaultValue: "Property Amenities",
                  })}
                </h3>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    expandedSections.propertyAmenities ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.propertyAmenities && (
                <div className="p-4">
                  {loadingAmenities ? (
                    <div className="text-center py-4 text-gray-500">
                      Loading amenities...
                    </div>
                  ) : dynamicAmenities.length > 0 ? (
                    <>
                      {/* Up Arrow - Only show if not on first page */}
                      {amenitiesCurrentPage > 0 && (
                        <div className="flex justify-center pb-2">
                          <button
                            onClick={() =>
                              setAmenitiesCurrentPage(amenitiesCurrentPage - 1)
                            }
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <ChevronUp className="h-5 w-5 text-tripswift-blue" />
                          </button>
                        </div>
                      )}

                      {/* Amenities Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {dynamicAmenities
                          .slice(
                            amenitiesCurrentPage * AMENITIES_PER_PAGE,
                            (amenitiesCurrentPage + 1) * AMENITIES_PER_PAGE,
                          )
                          .map(({ key, label }) => (
                            <label
                              key={key}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedAmenities[key] || false}
                                onChange={() => toggleAmenity(key)}
                                className="w-4 h-4 rounded border-gray-300 text-tripswift-blue cursor-pointer"
                              />
                              <span
                                className="text-sm text-tripswift-black normal-case"
                                style={{ textTransform: "none" }}
                              >
                                {label}
                              </span>
                            </label>
                          ))}
                      </div>

                      {/* Down Arrow - Only show if not on last page */}
                      {(amenitiesCurrentPage + 1) * AMENITIES_PER_PAGE <
                        dynamicAmenities.length && (
                        <div className="flex justify-center pt-2">
                          <button
                            onClick={() =>
                              setAmenitiesCurrentPage(amenitiesCurrentPage + 1)
                            }
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <ChevronDown className="h-5 w-5 text-tripswift-blue" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No amenities available
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PROPERTY CATEGORIES */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("propertyCategories")}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <h3 className="font-tripswift-medium text-tripswift-black">
                  Property Category
                </h3>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    expandedSections.propertyCategories ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.propertyCategories && (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {propertyCategories && propertyCategories.length > 0 ? (
                    propertyCategories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => togglePropertyCategory(category)}
                          className="w-4 h-4 rounded border-gray-300 text-tripswift-blue cursor-pointer"
                        />
                        <span
                          className="text-sm text-tripswift-black normal-case"
                          style={{ textTransform: "none" }}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 col-span-2 sm:col-span-3">
                      No categories available
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PROPERTY TYPES */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("propertyTypes")}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
              >
                <h3 className="font-tripswift-medium text-tripswift-black">
                  Property Type
                </h3>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    expandedSections.propertyTypes ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedSections.propertyTypes && (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {propertyTypes && propertyTypes.length > 0 ? (
                    propertyTypes.map((type) => (
                      <label
                        key={type}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPropertyTypes.includes(type)}
                          onChange={() => togglePropertyType(type)}
                          className="w-4 h-4 rounded border-gray-300 text-tripswift-blue cursor-pointer"
                        />
                        <span
                          className="text-sm text-tripswift-black normal-case"
                          style={{ textTransform: "none" }}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 col-span-2 sm:col-span-3">
                      No property types available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ROOM AMENITIES */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("roomAmenities")}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="font-tripswift-medium text-tripswift-black">
                {t("HotelBox.FilterModal.roomAmenities", {
                  defaultValue: "Room Amenities",
                })}
              </h3>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  expandedSections.roomAmenities ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.roomAmenities && (
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {Object.entries(ROOM_AMENITIES_BY_CATEGORY).map(
                  ([category, amenities]) => (
                    <div key={category}>
                      <p className="text-xs font-tripswift-medium text-tripswift-black/60 mb-2 uppercase">
                        {category}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {amenities.map((amenity) => (
                          <label
                            key={amenity.key}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={
                                selectedRoomAmenities[amenity.key] || false
                              }
                              onChange={() => toggleRoomAmenity(amenity.key)}
                              className="w-4 h-4 rounded border-gray-300 text-tripswift-blue cursor-pointer"
                            />
                            <span
                              className="text-sm text-tripswift-black"
                              style={{ textTransform: "none" }}
                            >
                              {amenity.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* STAR RATING */}
          {/* <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("rating")}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="font-tripswift-medium text-tripswift-black">
                {t("HotelBox.FilterModal.propertyRating", {
                  defaultValue: "Property Rating",
                })}
              </h3>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  expandedSections.rating ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.rating && (
              <div className="p-4 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <label
                    key={`rating-${rating}`}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStarRatings.includes(rating)}
                      onChange={() => toggleStarRating(rating)}
                      className="w-4 h-4 rounded border-gray-300 text-tripswift-blue cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      {Array.from({ length: rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-yellow-400 fill-current"
                        />
                      ))}
                      {Array.from({ length: 5 - rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-gray-300" />
                      ))}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div> */}

          {/* BEDROOMS */}
          {/* <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("bedrooms")}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="font-tripswift-medium text-tripswift-black">
                {t("HotelBox.FilterModal.bedrooms", {
                  defaultValue: "Bedrooms",
                })}
              </h3>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  expandedSections.bedrooms ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.bedrooms && (
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BEDROOM_OPTIONS.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBedrooms.includes(value)}
                      onChange={() => toggleBedroom(value)}
                      className="w-4 h-4 rounded border-gray-300 text-tripswift-blue cursor-pointer"
                    />
                    <span
                      className="text-sm text-tripswift-black"
                      style={{ textTransform: "none" }}
                    >
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div> */}

          {/* CUSTOMER REVIEW */}
          {/* <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("customerReview")}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="font-tripswift-medium text-tripswift-black">
                Guest Rating
              </h3>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  expandedSections.customerReview ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.customerReview && (
              <div className="p-3 space-y-2">
                {[5, 4, 3, 2, 1].map((review) => (
                  <label
                    key={`review-${review}`}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCustomerReview.includes(review) || false}
                      onChange={() => toggleCustomerReview(review)}
                      className="w-4 h-4 rounded border-gray-300 text-tripswift-blue cursor-pointer"
                    />
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review }).map((_, i) => (
                        <Star
                          key={`filled-${i}`}
                          className="h-3.5 w-3.5 text-yellow-400 fill-current"
                        />
                      ))}
                      {Array.from({ length: 5 - review }).map((_, i) => (
                        <Star
                          key={`empty-${i}`}
                          className="h-3.5 w-3.5 text-gray-300"
                        />
                      ))}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div> */}

          {/* PAYMENT OPTIONS */}
          {/* <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("payment")}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="font-tripswift-medium text-tripswift-black">
                Payment Options
              </h3>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  expandedSections.payment ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.payment && (
              <div className="p-4 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.payByCard || false}
                    onChange={() => togglePaymentMethod("payByCard")}
                    className="w-4 h-4 rounded border-gray-300 text-tripswift-blue cursor-pointer"
                  />
                  <span
                    className="text-sm text-tripswift-black"
                    style={{ textTransform: "none" }}
                  >
                    Pay by Card
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.payAtHotel || false}
                    onChange={() => togglePaymentMethod("payAtHotel")}
                    className="w-4 h-4 rounded border-gray-300 text-tripswift-blue cursor-pointer"
                  />
                  <span
                    className="text-sm text-tripswift-black"
                    style={{ textTransform: "none" }}
                  >
                    Pay at Hotel
                  </span>
                </label>
              </div>
            )}
          </div> */}

          {/* SORT BY */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection("sort")}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
              <h3 className="font-tripswift-medium text-tripswift-black">
                {t("HotelBox.FilterModal.sortBy", { defaultValue: "Sort By" })}
              </h3>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  expandedSections.sort ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.sort && (
              <div className="p-4">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-tripswift-blue focus:ring-1 focus:ring-tripswift-blue font-tripswift-regular text-tripswift-black"
                  aria-label={t("HotelBox.FilterModal.ariaSortOrder", {
                    defaultValue: "Sort order",
                  })}
                >
                  {SORT_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-tripswift-off-white">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-tripswift-blue font-tripswift-medium hover:bg-tripswift-blue/5 rounded-lg transition-colors"
          >
            Reset All
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-tripswift-black font-tripswift-medium hover:bg-gray-50 transition-colors"
            >
              {t("HotelBox.FilterModal.cancel", { defaultValue: "Cancel" })}
            </button>
            <button
              onClick={handleSave}
              className="btn-tripswift-primary px-6 py-2.5 rounded-lg"
            >
              Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FilterModal;
