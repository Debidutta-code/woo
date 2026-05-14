"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  setCheckInDate,
  setCheckOutDate,
  setPropertyId,
} from "../../Redux/slices/pmsHotelCard.slice";
import { format, addDays } from "date-fns";
import { getHotelsByCity } from "../../api/hotel";
import { getUniqueCities } from "./api/unique-cities.api";
interface PropertyAmenities {
  wifi?: boolean;
  restaurant?: boolean;
  parking?: boolean;
  business_facilities?: boolean;
  non_smoking_rooms?: boolean;
  family_rooms?: boolean;
}

interface Property {
  id: string;
  propertyName: string;
  propertyEmail: string;
  propertyContact: string;
  starRating: number | null;
  propertyCode: string;
  images: string[];
  description: string;
  amenities: Record<string, boolean>;
  address: {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    landmark: string;
  };
  video: {
    url: string;
    thumbnail: string | null;
  } | null;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  baseAmount: number;
  currencyCode: string;
  availabilityCount: number;
  nights: number;
  checkIn: string;
  checkOut: string;
}
interface City {
  city: string;
  propertyCount: number;
}

export function PopularHotels() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch cities on mount
  useEffect(() => {
    fetchCities();
  }, []);

  // Fetch properties whenever city changes (including initial default city)
  useEffect(() => {
    if (!selectedCity) return;
    fetchProperties(selectedCity);
  }, [selectedCity]);

  const fetchCities = async () => {
    try {
      const data = await getUniqueCities();
      setCities(data);
      if (data.length > 0) {
        setSelectedCity(data[0].city);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchProperties = async (city: string) => {
    setLoading(true);
    try {
      const checkin = format(addDays(new Date(), 1), "yyyy-MM-dd");
      const checkout = format(addDays(new Date(), 2), "yyyy-MM-dd");
      const data = await getHotelsByCity(city, {
        startDate: checkin,
        endDate: checkout,
      });
      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check scroll position for city tabs
  const checkScrollPosition = () => {
    const container = document.getElementById("city-tabs-scroll-container");
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft <
          container.scrollWidth - container.clientWidth - 10,
      );
    }
  };

  useEffect(() => {
    const container = document.getElementById("city-tabs-scroll-container");
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition(); // Initial check

      return () => container.removeEventListener("scroll", checkScrollPosition);
    }
  }, [cities]);

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("city-tabs-scroll-container");
    if (container) {
      const scrollAmount = 300;
      const newPosition =
        direction === "right"
          ? container.scrollLeft + scrollAmount
          : container.scrollLeft - scrollAmount;

      container.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
    }
  };

  const handleSeeMoreClick = async () => {
    setLoading(true);
    try {
      const checkin = format(addDays(new Date(), 1), "yyyy-MM-dd");
      const checkout = format(addDays(new Date(), 2), "yyyy-MM-dd");
      const data = await getHotelsByCity(selectedCity, {
        startDate: checkin,
        endDate: checkout,
      });
      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };
  const handlePropertyClick = (propertyId: string, propertyCode: string) => {
    const checkin = format(addDays(new Date(), 1), "yyyy-MM-dd");
    const checkout = format(addDays(new Date(), 2), "yyyy-MM-dd");

    // Set dates and property ID in Redux
    dispatch(setCheckInDate(checkin));
    dispatch(setCheckOutDate(checkout));
    dispatch(setPropertyId(propertyId));

    // Navigate to hotel page with only guest params (no property_code in URL)
    const guestParams = "rooms=1&adults=1&children=0&infant=0";
    router.push(`/hotel?${guestParams}`);
  };

  return (
    <section className="py-8 md:py-10 bg-tripswift-off-white font-noto-sans">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-[28px] font-tripswift-bold text-tripswift-black">
            Featured homes recommended for you
          </h2>
        </div>

        {/* City Tabs with Scroll */}
        <div className="relative mb-6">
          {/* Left Fade Gradient */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-tripswift-off-white to-transparent z-10 pointer-events-none"></div>
          )}

          {/* Right Fade Gradient */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-tripswift-off-white to-transparent z-10 pointer-events-none"></div>
          )}

          {/* Scroll Container */}
          <div
            id="city-tabs-scroll-container"
            className="flex items-center gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {cities.slice(0, 5).map((city) => (
              <button
                key={city.city}
                onClick={() => setSelectedCity(city.city)}
                className={`whitespace-nowrap px-4 py-2 rounded-none border-b-2 transition-all font-noto-sans ${
                  selectedCity === city.city
                    ? "border-tripswift-blue text-tripswift-blue font-tripswift-semibold"
                    : "border-transparent text-gray-600 hover:text-tripswift-black"
                }`}
              >
                {city.city}
              </button>
            ))}
            <button
              onClick={handleSeeMoreClick}
              className="text-tripswift-blue hover:text-tripswift-blue whitespace-nowrap ml-auto font-noto-sans flex items-center text-sm font-tripswift-bold"
            >
              {loading ? "Loading..." : `See more (${selectedCity}) properties`}
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Navigation Buttons for City Tabs */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 z-20 border border-tripswift-off-white"
              style={{ transform: "translateY(-50%) translateX(-16px)" }}
              aria-label="Previous"
            >
              <ChevronRight className="w-4 h-4 text-tripswift-blue rotate-180" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => handleScroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 z-20 border border-tripswift-off-white"
              style={{ transform: "translateY(-50%) translateX(16px)" }}
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4 text-tripswift-blue" />
            </button>
          )}
        </div>

        {/* Properties Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gradient-to-br from-tripswift-off-white to-tripswift-off-white/50 rounded-2xl h-48 mb-3"></div>
                <div className="bg-tripswift-off-white/30 h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-tripswift-off-white/30 h-3 rounded w-1/2 mb-2"></div>
                <div className="bg-tripswift-off-white/30 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <p className="text-tripswift-black/60 font-noto-sans">
              No properties found in {selectedCity}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.slice(0, 4).map((property) => (
              <div
                key={property.id}
                className="cursor-pointer group"
                // NEW
                onClick={() =>
                  handlePropertyClick(property.id, property.propertyCode)
                }
              >
                {/* Property Image with Rating Badge */}
                <div className="relative mb-3 rounded-2xl overflow-hidden">
                  <img
                    src={
                      property.images[0] ||
                      "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop"
                    }
                    alt={property.propertyName}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {property.starRating && (
                    <span className="absolute top-3 right-3 bg-tripswift-blue text-white font-tripswift-bold px-2 py-1 text-sm rounded">
                      {property.starRating}
                    </span>
                  )}
                </div>

                {/* Property Info */}
                <div>
                  {/* Property Name */}
                  <h3 className="text-base font-tripswift-semibold text-tripswift-black mb-2 line-clamp-2 min-h-[28px]">
                    {property.propertyName}
                  </h3>

                  {/* Star Rating and Location in one line */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* Star Rating */}
                    <div className="flex items-center">
                      {[...Array(property.starRating || 0)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5 text-tripswift-blue fill-tripswift-blue"
                        />
                      ))}
                    </div>

                    {/* Location */}
                    {property.address && (
                      <div className="flex items-center text-xs text-tripswift-blue gap-0.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">
                          {property.address.city || selectedCity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
