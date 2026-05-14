"use client";
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Calendar,
  Loader2,
  X,
  ChevronRight,
  Users,
  RefreshCw,
} from "lucide-react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import DateRange from "./DestinationDateRange";
import GuestBox from "./DestinationGuestBox";
import { format, addDays } from "date-fns";
import { useSelector, useDispatch } from "../../Redux/store";
import { setGuestDetails as saveGuestDetails } from "../../Redux/slices/hotelcard.slice";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

interface RecentSearch {
  location: string;
  checkin: string;
  checkout: string;
  timestamp: number;
}

interface CompactSearchBarProps {
  initialLocation?: string;
  initialCheckin?: string;
  initialCheckout?: string;
  onSearch?: (
    location: string,
    checkin: string,
    checkout: string,
    guestDetails?: any,
  ) => void;
  onGuestChange?: (guestDetails: any) => void;
  isRoomPage?: boolean;
}

const CompactSearchBar: React.FC<CompactSearchBarProps> = ({
  initialLocation = "Colombo",
  initialCheckin = "",
  initialCheckout = "",
  onSearch,
  isRoomPage = false,
}) => {
  const [inputSearchOpen, setInputSearchOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(true);
  const [dateRangeCompleted, setDateRangeCompleted] = useState(false);
  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (!hasAutoOpened.current) {
      setDatePickerOpen(true);
      setDateRangeCompleted(false);
      hasAutoOpened.current = true;
    }
  }, []);
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const guestContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { guestDetails } = useSelector((state) => state.hotel);
  const { i18n } = useTranslation();
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const dayAfterTomorrow = format(addDays(new Date(), 2), "yyyy-MM-dd");

  // console.log("date range completed:", dateRangeCompleted);

  const currentLocation =
    initialLocation ||
    searchParams.get("location") ||
    searchParams.get("destination") ||
    "Colombo";
  const checkinDate = initialCheckin || searchParams.get("checkin") || tomorrow;
  const checkoutDate =
    initialCheckout || searchParams.get("checkout") || dayAfterTomorrow;
  const [searchQuery, setSearchQuery] = useState(currentLocation);
  const [dates, setDates] = useState<string[] | undefined>([
    checkinDate,
    checkoutDate,
  ]);
  const [loading, setLoading] = useState(false);
  // const [dropdownOpen, setDropdownOpen] = useState(false);
  const [guestDropdownOpen, setGuestDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [showAutocompleteSuggestions, setShowAutocompleteSuggestions] =
    useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const MAX_RECENT_SEARCHES = 5;

  // Update state when props change
  useEffect(() => {
    if (initialLocation) {
      setSearchQuery(initialLocation);
    }
    if (initialCheckin && initialCheckout) {
      setDates([initialCheckin, initialCheckout]);
    }
  }, [initialLocation, initialCheckin, initialCheckout]);

  // For room page, ensure dates always sync
  useEffect(() => {
    if (!isRoomPage) return;
    if (initialCheckin && initialCheckout) {
      setDates([initialCheckin, initialCheckout]);
    }
  }, [initialCheckin, initialCheckout, isRoomPage]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowRecentSearches(false);
        setShowAutocompleteSuggestions(false);
      }

      if (
        guestContainerRef.current &&
        !guestContainerRef.current.contains(event.target as Node) &&
        !(
          document.querySelector("[data-guestbox-portal]") as HTMLElement
        )?.contains(event.target as Node)
      ) {
        setGuestDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update dropdown position when it opens and on scroll/resize
  const updateDropdownPosition = () => {
    if (
      (showAutocompleteSuggestions || showRecentSearches) &&
      inputRef.current
    ) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    updateDropdownPosition();
  }, [showAutocompleteSuggestions, showRecentSearches]);

  // Handle scroll and resize to update dropdown position
  useEffect(() => {
    const handleScrollResize = () => {
      updateDropdownPosition();
    };

    window.addEventListener("scroll", handleScrollResize);
    window.addEventListener("resize", handleScrollResize);

    return () => {
      window.removeEventListener("scroll", handleScrollResize);
      window.removeEventListener("resize", handleScrollResize);
    };
  }, [showAutocompleteSuggestions, showRecentSearches]);

  const clearSearch = () => {
    setSearchQuery("");
    if (recentSearches.length > 0) {
      setShowRecentSearches(true);
      setShowAutocompleteSuggestions(true);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Save recent searches with dates
  const saveToRecentSearches = (location: string) => {
    if (!location || location.length < 3) return;

    const newSearch: RecentSearch = {
      location,
      checkin: dates?.[0] || "",
      checkout: dates?.[1] || "",
      timestamp: Date.now(),
    };

    const updatedSearches = [
      newSearch,
      ...recentSearches.filter(
        (item) => item.location.toLowerCase() !== location.toLowerCase(),
      ),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updatedSearches);
  };

  // Improved selection handler to prevent blur conflict
  const handleSelectSearch = (search: string) => {
    setIsSearchFocused(true);
    setSearchQuery(search);
    setShowAutocompleteSuggestions(false);
    setShowRecentSearches(false);
    setDatePickerOpen(true);
    setDateRangeCompleted(false);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(search.length, search.length);
      }
    }, 10);
  };

  const handleSearchButtonClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;

    // Validation - Check location first
    if (!searchQuery || searchQuery.length < 3) {
      toast.error(t("HotelListing.CompactSearchBar.errorInvalidLocation"));
      return;
    }

    if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
      toast.error(t("HotelListing.CompactSearchBar.errorSelectDates"));
      return;
    }

    if (dates[0] === dates[1]) {
      toast.error(t("HotelListing.CompactSearchBar.errorSameDates"));
      return;
    }

    // ✅ CRITICAL FIX: Ensure guest details are saved to Redux before navigation
    if (guestDetails) {
      dispatch(saveGuestDetails(guestDetails));
      console.log("✅ Guest details saved before navigation:", guestDetails);
    }

    // For room page - Check if location has changed
    if (isRoomPage) {
      // If location changed, redirect to destination page with new search
      if (searchQuery !== initialLocation) {
        saveToRecentSearches(searchQuery);
        setLoading(true);

        const checkinDate = encodeURIComponent(dates[0] || "");
        const checkoutDate = encodeURIComponent(dates[1] || "");
        const guestParams = guestDetails
          ? `&rooms=${guestDetails.rooms || 1}&adults=${guestDetails.guests || 1}&children=${guestDetails.children || 0}&infant=${guestDetails.infants || 0}`
          : "&rooms=1&adults=1&children=0&infant=0";

        // ✅ Wait a bit to ensure Redux state is persisted
        await new Promise((resolve) => setTimeout(resolve, 100));

        router.push(
          `/destination?location=${encodeURIComponent(searchQuery)}&checkin=${checkinDate}&checkout=${checkoutDate}${guestParams}`,
        );
        setLoading(false);
        return;
      }

      // Location same, just update dates and guests on current page
      if (onSearch) {
        setLoading(true);
        try {
          onSearch(searchQuery, dates[0], dates[1], guestDetails);
          toast.success(
            t("RoomsPage.searchUpdated", {
              defaultValue: "Search updated successfully",
            }),
          );
        } catch (error) {
          console.error("Error updating search:", error);
          toast.error(
            t("RoomsPage.searchUpdateError", {
              defaultValue: "Error updating search",
            }),
          );
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    // For listing page, do the normal search
    saveToRecentSearches(searchQuery);
    setLoading(true);
    const checkinDate = encodeURIComponent(dates[0] || "");
    const checkoutDate = encodeURIComponent(dates[1] || "");

    if (onSearch) {
      onSearch(searchQuery, dates[0], dates[1], guestDetails);
    } else {
      const guestParams = guestDetails
        ? `&rooms=${guestDetails.rooms || 1}&adults=${guestDetails.guests || 1}&children=${guestDetails.children || 0}&infant=${guestDetails.infants || 0}`
        : "&rooms=1&adults=1&children=0&infant=0";

      // ✅ Wait a bit to ensure Redux state is persisted
      await new Promise((resolve) => setTimeout(resolve, 100));

      router.push(
        `/destination?location=${encodeURIComponent(searchQuery)}&checkin=${checkinDate}&checkout=${checkoutDate}${guestParams}`,
      );
    }
    setLoading(false);
  };

  // NEW: Handle date picker open/close
  const handleDatePickerOpenChange = (open: boolean) => {
    setDatePickerOpen(open);
    // console.log("Date range selection completed.");
    // console.log("open:", open);
    setDateRangeCompleted(!open);
  };

  return (
    <div className="relative" ref={searchContainerRef}>
      <div className="bg-white/95 backdrop-blur-sm mb-16 sm:mb-0 rounded-xl shadow-lg border border-tripswift-black/5 p-3 font-noto-sans z-40">
        <div className="flex flex-col gap-2 md:flex-row items-center md:gap-3.5">
          {/* Location Input with Autocomplete */}
          <div className="w-[262px] sm:w-auto sm:flex-1 relative search-container-wrapper">
            <div className="relative group">
              <div
                className={`absolute inset-y-0 ${i18n.language === "ar" ? "right-3" : "left-3"} flex items-center pointer-events-none transition-colors duration-200 ${isSearchFocused ? "text-tripswift-blue" : "text-tripswift-black/40"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isSearchFocused ? "bg-tripswift-blue/10" : "bg-transparent"}`}
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 1) {
                    setShowRecentSearches(false);
                    setShowAutocompleteSuggestions(true);
                  } else if (e.target.value.length === 0 && isSearchFocused) {
                    setShowRecentSearches(recentSearches.length > 0);
                    setShowAutocompleteSuggestions(true);
                  }
                }}
                onFocus={() => {
                  setDateRangeCompleted(false);
                  setDatePickerOpen(false);
                  setIsSearchFocused(true);
                  setShowAutocompleteSuggestions(true);
                  setShowRecentSearches(
                    searchQuery.length === 0 && recentSearches.length > 0,
                  );
                  updateDropdownPosition();
                }}
                onBlur={() => {
                  setIsSearchFocused(false);
                  setTimeout(() => {
                    setShowRecentSearches(false);
                    setShowAutocompleteSuggestions(false);
                  }, 300);
                }}
                placeholder={t(
                  "HotelListing.CompactSearchBar.locationPlaceholder",
                )}
                className={`block w-[262px] md:w-full h-11 pl-10 pr-8 sm:pr-10 py-2 rounded-md border ${
                  isSearchFocused
                    ? "border-tripswift-blue ring-2 ring-tripswift-blue/10"
                    : "border-tripswift-black/10 hover:border-tripswift-blue/30"
                } outline-none text-tripswift-black transition duration-150 ease-in-out shadow-sm font-tripswift-medium text-sm px-2 tracking-normal`}
                style={{ textIndent: "16px" }}
                readOnly={false}
                aria-label={t(
                  "HotelListing.CompactSearchBar.locationPlaceholder",
                )}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className={`absolute inset-y-0 ${i18n.language === "ar" ? "left-3" : "right-3"} flex items-center text-tripswift-black/40 hover:text-tripswift-black transition-colors`}
                  aria-label={t(
                    "HotelListing.CompactSearchBar.ariaClearSearch",
                  )}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-tripswift-black/5 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="w-[262px] sm:flex-1">
            <div className="relative group">
              <div
                className={`absolute inset-y-0 ${i18n.language === "ar" ? "right-3" : "left-3"} flex items-center pointer-events-none`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-tripswift-blue/10 transition-colors duration-300">
                  <Calendar className="h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div
                className={`bg-tripswift-off-white border border-tripswift-black/10 text-[16px] hover:border-tripswift-blue/30 rounded-md shadow-sm transition-all duration-200 h-11 ${i18n.language === "ar" ? "pr-10" : "pl-12"} flex items-center`}
              >
                <DateRange
                  dates={dates}
                  setDates={setDates}
                  onOpenChange={handleDatePickerOpenChange}
                  autoOpen={datePickerOpen}
                />
              </div>
            </div>
          </div>

          {/* Guest Box */}
          <div className="w-[262px] sm:flex-1 z-50">
            <div className="relative group">
              <div
                className={`absolute inset-y-0 ${i18n.language === "ar" ? "right-3" : "left-3"} flex items-center pointer-events-none`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-tripswift-blue/10 transition-colors duration-300">
                  <Users className="h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div
                className={`bg-white border border-tripswift-black/10 hover:border-tripswift-blue/20 rounded-md shadow-sm transition-all duration-200 h-11 pl-12 flex items-center`}
              >
                <GuestBox
                  isOpen={guestDropdownOpen}
                  onToggle={() => setGuestDropdownOpen(!guestDropdownOpen)}
                  autoOpen={dateRangeCompleted}
                />
              </div>
            </div>
          </div>

          {/* Search/Update Button */}
          <div className="w-[262px] sm:w-auto">
            <button
              type="button"
              disabled={loading}
              onClick={handleSearchButtonClick}
              className="btn-tripswift-primary w-[262px] md:w-auto h-11 px-6 flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg relative overflow-hidden group"
              aria-label={
                loading
                  ? t("HotelListing.CompactSearchBar.ariaSearching")
                  : isRoomPage
                    ? t("RoomsPage.updateSearch", {
                        defaultValue: "Update Search",
                      })
                    : t("HotelListing.CompactSearchBar.ariaSearchHotels")
              }
            >
              <span className="relative z-10 flex items-center gap-2.5">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isRoomPage ? (
                      <RefreshCw className="w-5 h-5" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                    <span className="font-tripswift-semibold text-[14px]">
                      {isRoomPage
                        ? t("RoomsPage.updateButton", {
                            defaultValue: "Update",
                          })
                        : t("HotelListing.CompactSearchBar.searchButton")}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300 ${i18n.language === "ar" ? "rotate-180" : ""}`}
                    />
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactSearchBar;
