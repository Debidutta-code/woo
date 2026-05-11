"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios"; // 👈 ADD THIS IMPORT
import { getHotelsByCity } from "../../api/hotel";
import { wishlistAPI } from "@/api/wishlist";
import FilterModal, { FilterState } from "../hotelBox/FilterModal";
import {
  setPropertyId,
  setCheckInDate,
  setCheckOutDate,
} from "../../Redux/slices/pmsHotelCard.slice";
import {
  Filter,
  Calendar,
  MapPin,
  Search,
  CreditCard,
  Star,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "../../Redux/store";
import { formatDate, calculateNights } from "../../utils/dateUtils";
import { useTranslation } from "react-i18next";

import CompactSearchBar from "../hotelBox/CompactSearchBar";
import HotelCardItem from "../hotelListingComponents/HotelCardItem";
import ActiveFilters from "../hotelListingComponents/ActiveFilters";
import FilterSidebar from "../hotelListingComponents/FilterSidebar";
import MobileFilterDrawer from "../hotelListingComponents/MobileFilterDrawer";
import LoadingSkeleton from "../hotelListingComponents/LoadingSkeleton";
import EmptyState from "../hotelListingComponents/EmptyState";

export interface Hotel {
  id: string;
  propertyName: string;
  propertyEmail: string;
  propertyContact: string;
  starRating: number | null;
  propertyCode: string;
  description: string;
  propertyCategory?: string;
  propertyType?: string;
  images: string[];
  amenities: { [key: string]: boolean };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isWishlisted?: boolean;
  baseAmount?: number;
  currencyCode?: string;
  customerReviewData?: {
    averageRating: number;
    totalReviews: number;
    distribution?: {
      "1": number;
      "2": number;
      "3": number;
      "4": number;
      "5": number;
    };
  };
  availabilityCount?: number | null;
  address?: {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    landmark: string;
  };
  nights?: number;
  checkIn?: string;
  checkOut?: string;
}

interface HotelData {
  success: boolean;
  message: string;
  data: Hotel[];
}

const HotelListing: React.FC = () => {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [params, setParams] = useState<{
    location?: string;
    destination?: string;
    url?: string;
  }>({});
  const [hotelData, setHotelData] = useState<HotelData>({
    success: false,
    message: "",
    data: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [errorToastShown, setErrorToastShown] = useState<boolean>(false);

  // State for hotels data (used for dynamic amenities)
  const [hotelsData, setHotelsData] = useState<Hotel[]>([]);

  // 👇 ADD THIS: State for all amenities (from master table)
  const [allAmenities, setAllAmenities] = useState<string[]>([]);
  const [amenitiesLoaded, setAmenitiesLoaded] = useState(false);
  const [propertyCategories, setPropertyCategories] = useState<string[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [propertyTypesLoaded, setPropertyTypesLoaded] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
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
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { guestDetails } = useSelector((state) => state.hotel);
  const destination = searchParams.get("destination");

  const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value || ""
    );
  const location = searchParams.get("location");
  const checkinDate = searchParams.get("checkin");
  const checkoutDate = searchParams.get("checkout");
  const [viewRoomLoading, setViewRoomLoading] = useState<string | null>(null);

  // Initialize search params
  useEffect(() => {
    if (location) {
      setParams({ location, url: "search" });
    } else if (destination) {
      setParams({ destination, url: "search-amenities" });
    }
  }, [destination, location]);

  // 👇 ADD THIS: Fetch all amenities once when page loads
  useEffect(() => {
    const fetchAllAmenities = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/filters/search/amenities`,
        );
        if (response.data.success) {
          setAllAmenities(response.data.data);
          setAmenitiesLoaded(true);
          console.log(
            "All amenities loaded in HotelListing:",
            response.data.data,
          );
        }
      } catch (error) {
        console.error("Error fetching all amenities:", error);
      }
    };

    if (!amenitiesLoaded) {
      fetchAllAmenities();
    }
  }, [amenitiesLoaded]);

  // Fetch hotels when params or filters change
  useEffect(() => {
    if (params.location) {
      fetchHotels(params.location);
    } else if (params.destination) {
      fetchHotels(params.destination);
    }
  }, [params, checkinDate, checkoutDate, filters]);

  // 👇 ADD THIS: Fetch property categories once when page loads
  useEffect(() => {
    const fetchPropertyCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/filters/search/property-categories`,
        );
        if (response.data.success) {
          setPropertyCategories(response.data.data);
          setCategoriesLoaded(true);
          console.log("Property categories loaded:", response.data.data);
        }
      } catch (error) {
        console.error("Error fetching property categories:", error);
      }
    };

    if (!categoriesLoaded) {
      fetchPropertyCategories();
    }
  }, [categoriesLoaded]);

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/filters/search/property-types`,
        );
        if (response.data.success) {
          setPropertyTypes(response.data.data);
          setPropertyTypesLoaded(true);
          console.log("Property types loaded:", response.data.data);
        }
      } catch (error) {
        console.error("Error fetching property types:", error);
      }
    };

    if (!propertyTypesLoaded) {
      fetchPropertyTypes();
    }
  }, [propertyTypesLoaded]);

  const handleGuestChange = (guestData: any) => {
    //console.log("Guest details updated:", guestData);
  };

  // Fetch hotels with filters
  const fetchHotels = async (searchTerm: string) => {
    setIsLoading(true);
    setError(null);
    setErrorToastShown(false);

    try {
      if (!checkinDate || !checkoutDate) {
        toast.error(
          t("HotelListing.selectDatesError", {
            defaultValue: "Please select check-in and check-out dates",
          }),
        );
        setIsLoading(false);
        return;
      }

      // Build filter object for API call
      const apiFilters: any = {
        startDate: checkinDate,
        endDate: checkoutDate,
      };

      // Add amenities filter
      const activeAmenities = Object.entries(filters.amenities)
        .filter(([_, isActive]) => isActive)
        .reduce((acc, [key, _]) => ({ ...acc, [key]: true }), {});
      if (Object.keys(activeAmenities).length > 0) {
        apiFilters.amenities = activeAmenities;
      }

      // Add room amenities filter
      const activeRoomAmenities = Object.entries(filters.roomAmenities)
        .filter(([_, isActive]) => isActive)
        .reduce((acc, [key, _]) => ({ ...acc, [key]: true }), {});
      if (Object.keys(activeRoomAmenities).length > 0) {
        apiFilters.roomAmenities = activeRoomAmenities;
      }

      // Add star rating filter
      if (filters.star_rating && filters.star_rating.length > 0) {
        apiFilters.star_rating = filters.star_rating;
      }

      // Add bed type filter
      if (filters.bedType && filters.bedType.length > 0) {
        apiFilters.bedType = filters.bedType;
      }

      // Add room type filter
      if (filters.roomType && filters.roomType.length > 0) {
        apiFilters.roomType = filters.roomType;
      }

      // Add special features filter
      if (filters.special && filters.special.length > 0) {
        apiFilters.special = filters.special;
      }

      // Add bedrooms filter
      if (filters.bedrooms && filters.bedrooms.length > 0) {
        apiFilters.bedrooms = filters.bedrooms;
      }

      // Add customer review filter
      if (filters.customerReview && filters.customerReview.length > 0) {
        apiFilters.customerReview = filters.customerReview;
      }
      if (filters.minPrice !== undefined && filters.minPrice !== null) {
        apiFilters.minPrice = filters.minPrice;
      }

      if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
        apiFilters.maxPrice = filters.maxPrice;
      }
      // Add sort filter
      if (filters.sortOrder) {
        apiFilters.sort = filters.sortOrder;
      }

      // Add payment methods filter
      if (filters.paymentMethods) {
        const paymentMethods: any = {};
        if (filters.paymentMethods.payByCard !== undefined) {
          paymentMethods.payByCard = filters.paymentMethods.payByCard;
        }
        if (filters.paymentMethods.payAtHotel !== undefined) {
          paymentMethods.payAtHotel = filters.paymentMethods.payAtHotel;
        }
        if (Object.keys(paymentMethods).length > 0) {
          apiFilters.paymentAcceptedMethods = paymentMethods;
        }
      }
      if (filters.propertyCategories && filters.propertyCategories.length > 0) {
        apiFilters.propertyCategories = filters.propertyCategories;
        console.log(
          "Property categories being sent:",
          filters.propertyCategories,
        );
      }

      if (filters.propertyTypes && filters.propertyTypes.length > 0) {
        apiFilters.propertyTypes = filters.propertyTypes;
        console.log("Selected propertyType:", filters.propertyTypes);
      }

      //console.log("🔍 Fetching hotels with filters:", apiFilters);

      const hotelsResponse = await getHotelsByCity(searchTerm, apiFilters);
      let mergedHotels = hotelsResponse.data || [];
      try {
        const wishlistItems = await wishlistAPI.getWishlistGrouped();
        const wishlistPropertyIds = new Set(
          (wishlistItems || []).map((item: any) => item?.propertyId).filter(Boolean),
        );
        mergedHotels = mergedHotels.map((hotel) => ({
          ...hotel,
          isWishlisted:
            wishlistPropertyIds.has(hotel.id) ||
            wishlistPropertyIds.has((hotel as any).propertyId),
        }));
      } catch (_error) {
        // Ignore wishlist sync failure for non-authenticated users.
      }

      setHotelData({
        ...hotelsResponse,
        data: mergedHotels,
      });
      // Store hotels data for dynamic amenities
      setHotelsData(mergedHotels);

      //console.log(`Hotels fetched for ${searchTerm}:`, hotelsResponse.data);

      // if (hotelsResponse.data.length === 0) {
      //   toast.error(
      //     t("HotelListing.noHotelsError", { defaultValue: "No hotels found." }),
      //   );
      // }
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error("An unknown error occurred"),
      );
      setHotelData({ success: false, message: "", data: [] });
      setHotelsData([]); // Clear hotels data on error

      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";

      if (!errorToastShown) {
        let toastMessage = t("HotelListing.tryModifyingSearch", {
          defaultValue: "Try modifying your search.",
        });

        if (errorMessage.includes("No hotels found")) {
          toastMessage = t("HotelCard.errorNoHotels", {
            defaultValue: "No hotels available for the selected location.",
          });
        }

        toast.error(toastMessage);
        setErrorToastShown(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (
    newLocation: string,
    checkin: string,
    checkout: string,
    guestData?: any,
  ) => {
    const guestToUse = guestData || guestDetails;
    const guestParams = guestToUse
      ? `&rooms=${guestToUse.rooms || 1}&adults=${
          guestToUse.guests || 1
        }&children=${guestToUse.children || 0}&infant=${
          guestToUse.infants || 0
        }`
      : "";
    router.push(
      `/hotel-listing?location=${encodeURIComponent(
        newLocation,
      )}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(
        checkout,
      )}${guestParams}`,
    );
  };

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    //console.log("🎯 Filters changed:", newFilters);
    setFilters(newFilters);
    // Fetching will be triggered by useEffect
  }, []);

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleRatingChange = (rating: number | null) => {
    setRatingFilter(rating);
    const newStarRatings = rating !== null ? [rating] : [];
    setFilters({ ...filters, star_rating: newStarRatings });
  };

  const handleViewRoom = async (hotelId: string) => {
    try {
      setViewRoomLoading(hotelId);

      const matchedHotel = hotelData.data.find(
        (hotel: any) => hotel.id === hotelId || hotel.propertyCode === hotelId
      );
      const resolvedPropertyId =
        (isUuid(hotelId) && hotelId) ||
        (matchedHotel && isUuid((matchedHotel as any).id)
          ? (matchedHotel as any).id
          : "") ||
        (matchedHotel && isUuid((matchedHotel as any).propertyId)
          ? (matchedHotel as any).propertyId
          : "");

      if (!resolvedPropertyId) {
        toast.error("Invalid property id. Please retry from listing.");
        return;
      }

      if (resolvedPropertyId) {
        dispatch(setPropertyId(resolvedPropertyId));
      }
      if (checkinDate) {
        dispatch(setCheckInDate(checkinDate));
      }
      if (checkoutDate) {
        dispatch(setCheckOutDate(checkoutDate));
      }

      if (guestDetails && Object.keys(guestDetails).length > 0) {
        localStorage.setItem("guest_details", JSON.stringify(guestDetails));
        if (guestDetails.rooms) {
          localStorage.setItem("rooms", guestDetails.rooms.toString());
        }
      }

      const guestParams = guestDetails
        ? `&rooms=${guestDetails.rooms || 1}&adults=${
            guestDetails.guests || 1
          }&children=${guestDetails.children || 0}&infant=${
            guestDetails.infants || 0
          }`
        : "";

      await new Promise((resolve) => setTimeout(resolve, 500));

      router.push(`/hotel?id=${resolvedPropertyId}&${guestParams}`);
    } catch (error) {
      console.error("Error navigating to hotel:", error);
      toast.error("Failed to view room. Please try again.");
    } finally {
      setViewRoomLoading(null);
    }
  };

  const handleWishlistToggle = (hotelId: string, newState: boolean) => {
    setHotelData((prevData) => ({
      ...prevData,
      data: prevData.data.map((hotel) =>
        hotel.id === hotelId ? { ...hotel, isWishlisted: newState } : hotel,
      ),
    }));
  };

  const applyFilters = (hotels: Hotel[]): Hotel[] => {
    let filteredHotels = [...hotels];

    if (filters.propertyCategories && filters.propertyCategories.length > 0) {
      filteredHotels = filteredHotels.filter((hotel) => {
        const hotelCategory = hotel.propertyCategory?.toLowerCase() || "";
        return filters.propertyCategories.some(
          (category) => category.toLowerCase() === hotelCategory,
        );
      });
    }

    // ✅ Minimum Price Filter (show hotels with price >= user input)
    const minPrice = filters.minPrice ?? 0;

    if (minPrice > 0) {
      filteredHotels = filteredHotels.filter((hotel) => {
        const hotelPrice = hotel.baseAmount || 0;
        return hotelPrice >= minPrice;
      });
    }

    // ✅ Frontend Amenities Filter (AND logic - must have ALL selected amenities)
    const selectedAmenities = Object.entries(filters.amenities)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => key);

    if (selectedAmenities.length > 0) {
      filteredHotels = filteredHotels.filter((hotel) => {
        const hotelAmenities = hotel.amenities || {};
        // Check if hotel has ALL selected amenities
        return selectedAmenities.every(
          (amenity) => hotelAmenities[amenity] === true,
        );
      });
    }

    // Search query filter
    if (searchQuery) {
      filteredHotels = filteredHotels.filter((hotel) =>
        hotel.propertyName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Remove duplicates
    return filteredHotels.reduce((acc: Hotel[], currentHotel: Hotel) => {
      if (
        !acc.find((hotel) => hotel.propertyName === currentHotel.propertyName)
      ) {
        acc.push(currentHotel);
      }
      return acc;
    }, []);
  };

  const toggleAmenityFilter = (key: string) => {
    const newAmenities = { ...filters.amenities };
    newAmenities[key] = !newAmenities[key];
    setFilters({ ...filters, amenities: newAmenities });
  };

  const handleSortChange = (sortOrder: string) => {
    setFilters({ ...filters, sortOrder });
  };

  const resetFilters = () => {
    setFilters({
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
    });
    setSearchQuery("");
    setRatingFilter(null);
  };

  const filteredHotels = applyFilters(hotelData.data);

  const activeFilterCount =
    Object.values(filters.amenities).filter(Boolean).length +
    Object.values(filters.roomAmenities).filter(Boolean).length +
    (filters.star_rating?.length || 0) +
    (filters.bedType?.length || 0) +
    (filters.roomType?.length || 0) +
    (filters.special?.length || 0) +
    (filters.bedrooms?.length || 0) +
    (filters.customerReview?.length || 0) +
    (filters.sortOrder ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="bg-[#F5F7FA] min-h-screen font-noto-sans">
      <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] relative">
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-pattern-dots"></div>
        </div>
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-6">
          <div className="text-tripswift-off-white mb-6 flex-col items-center">
            <h1 className="text-2xl md:text-3xl font-tripswift-bold text-tripswift-off-white">
              {t("HotelListing.heroTitle", {
                defaultValue: "Find Your Perfect Stay",
              })}
            </h1>
            <p className="mt-2 font-tripswift-regular opacity-90">
              {t("HotelListing.heroSubtitle", {
                defaultValue: "Book accommodations at the best prices",
              })}
            </p>
          </div>

          <div className="w-[290px] md:w-full">
            <CompactSearchBar
              initialLocation={location || destination || ""}
              initialCheckin={checkinDate || ""}
              initialCheckout={checkoutDate || ""}
              onSearch={handleSearch}
              onGuestChange={handleGuestChange}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl  mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between ml-2">
          <div>
            <div className="flex items-center">
              <MapPin
                className={`h-5 w-5 text-tripswift-blue ${
                  i18n.language === "ar" ? "ml-3" : "mr-3"
                }`}
              />
              <h1 className="text-xl font-tripswift-bold text-tripswift-black">
                {i18n.language === "hi"
                  ? `${params.location || params.destination} ${t(
                      "HotelListing.hotelsIn",
                    )}`
                  : `${t("HotelListing.hotelsIn")} ${
                      params.location || params.destination
                    }`}
              </h1>
            </div>

            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center text-xs sm:text-sm font-tripswift-regular text-tripswift-black/70 mt-2 gap-2 md:gap-2">
              <div className="flex items-start md:items-center pl-0.5">
                <Calendar
                  className={`h-4 w-4 text-tripswift-blue flex-shrink-0 mt-0.5 md:mt-0 ${
                    i18n.language === "ar" ? "ml-3 md:ml-3" : "mr-4 md:mr-3"
                  }`}
                />
                <div className="flex flex-col md:flex-row md:items-center md:gap-2 min-w-0 flex-1">
                  <div className="leading-tight min-w-0">
                    {checkinDate && checkoutDate ? (
                      <span className="text-sm md:text-sm font-medium whitespace-nowrap">
                        {i18n.language === "ar"
                          ? `${formatDate(checkoutDate, {
                              month: "short",
                              day: "numeric",
                            })} - ${formatDate(checkinDate, {
                              month: "short",
                              day: "numeric",
                            })}`
                          : `${formatDate(checkinDate, {
                              month: "short",
                              day: "numeric",
                            })} - ${formatDate(checkoutDate, {
                              month: "short",
                              day: "numeric",
                            })}`}
                      </span>
                    ) : (
                      <span className="text-sm md:text-sm whitespace-nowrap">
                        {t("HotelListing.selectDates", {
                          defaultValue: "Select dates",
                        })}
                      </span>
                    )}
                  </div>

                  {checkinDate && checkoutDate && (
                    <div className="flex items-center gap-2">
                      <span className="text-tripswift-black/40 text-sm hidden md:inline">
                        •
                      </span>
                      <span className="text-sm md:text-sm font-medium leading-tight whitespace-nowrap">
                        {calculateNights(checkinDate, checkoutDate)}{" "}
                        {t("HotelListing.nights", { defaultValue: "nights" })}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-tripswift-black/40 text-sm hidden md:inline">
                      •
                    </span>
                    <span className="text-sm md:text-sm font-medium leading-tight whitespace-nowrap">
                      {filteredHotels.length}{" "}
                      {t("HotelListing.propertiesFound", {
                        defaultValue: "properties found",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-5">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-tripswift-medium text-tripswift-black hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center"
          >
            <Filter
              className={`h-4 w-4 text-tripswift-blue ${
                i18n.language === "ar" ? "ml-2" : "mr-2"
              }`}
            />
            <span>
              {t("HotelListing.filters", { defaultValue: "Filters" })}
            </span>
            {activeFilterCount > 0 && (
              <span
                className={`bg-tripswift-blue text-tripswift-off-white px-2 py-0.5 rounded-full text-xs font-tripswift-medium ${
                  i18n.language === "ar" ? "mr-2" : "ml-2"
                }`}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <ActiveFilters
          amenities={filters.amenities}
          sortOrder={filters.sortOrder}
          searchQuery={searchQuery}
          toggleAmenityFilter={toggleAmenityFilter}
          handleSortChange={handleSortChange}
          setSearchQuery={setSearchQuery}
          resetFilters={resetFilters}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar - FilterSidebar with hotelsData and allAmenities */}
          <div className="hidden lg:block lg:w-1/4">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              activeFilterCount={activeFilterCount}
              hotelsData={hotelsData}
              allAmenities={allAmenities}
              propertyCategories={propertyCategories}
              propertyTypes={propertyTypes}
            />
          </div>

          {/* Mobile FilterModal with hotelsData and allAmenities */}
          <FilterModal
            isOpen={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            onSave={handleFilterChange}
            initialFilters={filters}
            hotelsData={hotelsData}
            allAmenities={allAmenities}
            propertyCategories={propertyCategories}
            propertyTypes={propertyTypes}
          />
          <div className="lg:w-3/4">
            <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-grow max-w-xs">
                <div
                  className={`absolute inset-y-0 ${
                    i18n.language === "ar" ? "right-0 pr-3" : "left-0 pl-3"
                  } flex items-center pointer-events-none`}
                >
                  <Search className="h-4 w-4 text-tripswift-black/50" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("HotelListing.searchPropertyName", {
                    defaultValue: "Search property by name",
                  })}
                  className={`${
                    i18n.language === "ar" ? "pr-10" : "pl-10"
                  } w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm bg-tripswift-off-white focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue transition-all duration-300`}
                />
              </div>

              <div className="flex items-center">
                <span
                  className={`text-sm font-tripswift-medium text-tripswift-black/70 ${
                    i18n.language === "ar" ? "ml-3" : "mr-3"
                  }`}
                >
                  {t("HotelListing.sortBy", { defaultValue: "Sort by" })}
                </span>
                <div className="relative">
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className={`appearance-none border border-gray-200 rounded-md py-1.5 text-sm bg-tripswift-off-white focus:outline-none focus:ring-2 focus:ring-tripswift-blue/20 focus:border-tripswift-blue transition-all duration-300 ${
                      i18n.language === "ar"
                        ? "pr-3 pl-8 text-right"
                        : "pl-3 pr-8 text-left"
                    }`}
                  >
                    <option value="">
                      {t("HotelListing.recommended", {
                        defaultValue: "Recommended",
                      })}
                    </option>
                    <option value="rating_desc">
                      {t("HotelListing.highestRating", {
                        defaultValue: "Highest Rating",
                      })}
                    </option>
                    <option value="rating_asc">
                      {t("HotelListing.lowestRating", {
                        defaultValue: "Lowest Rating",
                      })}
                    </option>
                    <option value="price_desc">
                      {t("HotelListing.highestPrice", {
                        defaultValue: "Highest Price",
                      })}
                    </option>
                    <option value="price_asc">
                      {t("HotelListing.lowestPrice", {
                        defaultValue: "Lowest Price",
                      })}
                    </option>
                  </select>

                  <div
                    className={`pointer-events-none absolute inset-y-0 flex items-center px-2 text-gray-500 ${
                      i18n.language === "ar" ? "left-0" : "right-0"
                    }`}
                  >
                    <svg
                      className="h-4 w-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <LoadingSkeleton />
            ) : filteredHotels.length === 0 ? (
              <EmptyState resetFilters={resetFilters} />
            ) : (
              <div className="space-y-5">
                {filteredHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="hotel-card-container transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]"
                  >
                    <HotelCardItem
                      hotel={hotel}
                      location={params.location || params.destination || ""}
                      onViewRoom={handleViewRoom}
                      checkinDate={checkinDate}
                      checkoutDate={checkoutDate}
                      isLoading={viewRoomLoading === hotel.id}
                      onWishlistToggle={handleWishlistToggle}
                    />
                  </div>
                ))}
              </div>
            )}
            {filteredHotels.length > 0 && !isLoading && (
              <div className="mt-6 bg-tripswift-off-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-tripswift-bold text-lg text-tripswift-black mb-4">
                  {t("HotelListing.whyBookWithAlhajz", {
                    defaultValue: "Why Book With Woohoo-Trip",
                  })}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start">
                    <div
                      className={`bg-tripswift-blue/10 p-1 rounded-full mt-0.5 ${
                        i18n.language === "ar" ? "ml-3" : "mr-3"
                      }`}
                    >
                      <CreditCard className="h-5 w-5 text-tripswift-blue" />
                    </div>
                    <div className="mt-1">
                      <h4 className="font-tripswift-medium text-tripswift-black">
                        {t("HotelListing.freeCancellation", {
                          defaultValue: "Free Cancellation",
                        })}
                      </h4>
                      <p className="text-sm text-tripswift-black/60 mt-1">
                        {t("HotelListing.freeCancellationDesc", {
                          defaultValue:
                            "Cancel your booking without any charges.",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div
                      className={`bg-tripswift-blue/10 p-1 rounded-full mt-0.5 ${
                        i18n.language === "ar" ? "ml-3" : "mr-3"
                      }`}
                    >
                      <Star className="h-5 w-5 text-tripswift-blue" />
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-tripswift-medium text-tripswift-black">
                        {t("HotelListing.bestPriceGuarantee", {
                          defaultValue: "Best Price Guarantee",
                        })}
                      </h4>
                      <p className="text-sm text-tripswift-black/60 mt-1">
                        {t("HotelListing.bestPriceGuaranteeDesc", {
                          defaultValue:
                            "Find a better price, and we'll match it.",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div
                      className={`bg-tripswift-blue/10 p-1 rounded-full mt-0.5 ${
                        i18n.language === "ar" ? "ml-3" : "mr-3"
                      }`}
                    >
                      <Shield className="h-5 w-5 text-tripswift-blue" />
                    </div>
                    <div className="mt-1">
                      <h4 className="font-tripswift-medium text-tripswift-black">
                        {t("HotelListing.secureBooking", {
                          defaultValue: "Secure Booking",
                        })}
                      </h4>
                      <p className="text-sm text-tripswift-black/60 mt-1">
                        {t("HotelListing.secureBookingDesc", {
                          defaultValue: "Your information is safe with us.",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelListing;
