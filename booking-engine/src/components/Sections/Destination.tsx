// src/components/Sections/Destination.tsx
"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCheckInDate, setCheckOutDate } from "../../Redux/slices/pmsHotelCard.slice";
import { format, addDays } from "date-fns";

interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  propertyCount?: number;
}

export function Destination() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Fetch unique cities from API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/unique-cities`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = response.data;
        if (data.status !== "success") {
          throw new Error(data.message || t("HomeSections.AllHotelLists.errorMessage", { defaultValue: "API error" }));
        }

        const curatedImages = [
          "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1513326738677-b964603b136d?w=800&h=600&fit=crop&crop=center&q=80",
          "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop&crop=center&q=80"
        ];

        const fetchedDestinations: Destination[] = data.data.map((cityObj: { city: string; propertyCount: number }, index: number) => {
          const cityName = cityObj.city;
          const translatedCityName = t(`HomeSections.ExploreDestinations.destinations.${cityName.toLowerCase()}.name`, {
            defaultValue: cityName,
          });

          const image = curatedImages[index % curatedImages.length];

          return {
            id: `${index + 1}`,
            name: translatedCityName,
            description: "",
            image,
            propertyCount: cityObj.propertyCount
          };
        });
        setDestinations(fetchedDestinations);
        setLoading(false);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          t("HomeSections.AllHotelLists.errorMessage", {
            defaultValue: "An error occurred while fetching destinations",
          });
        setError(errorMessage);
        setLoading(false);
      }
    };
    fetchDestinations();
  }, [t]);

  // ✅ UPDATED: Handle destination click with image
  const handleLocationClick = (destination: Destination) => {
    const checkin = format(addDays(new Date(), 1), "yyyy-MM-dd");
    const checkout = format(addDays(new Date(), 2), "yyyy-MM-dd");
    dispatch(setCheckInDate(checkin));
    dispatch(setCheckOutDate(checkout));

    const guestParams = "&rooms=1&adults=1&children=0&infant=0";

    // ✅ Pass the image URL as a query parameter
    const imageParam = destination.image ? `&image=${encodeURIComponent(destination.image)}` : '';

    router.push(
      `/destination?location=${encodeURIComponent(destination.name)}&checkin=${encodeURIComponent(
        checkin
      )}&checkout=${encodeURIComponent(checkout)}${guestParams}${imageParam}`
    );
  };

  // Check scroll position
  const checkScrollPosition = () => {
    const container = document.getElementById('explore-destinations-scroll-container');
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    const container = document.getElementById('explore-destinations-scroll-container');
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition(); // Initial check

      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [destinations]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('explore-destinations-scroll-container');
    if (container) {
      const scrollAmount = 300;
      const newPosition = direction === 'right'
        ? container.scrollLeft + scrollAmount
        : container.scrollLeft - scrollAmount;

      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-4 md:py-8 bg-tripswift-off-white font-noto-sans">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-[28px] font-bold text-gray-900">
            {t("HomeSections.ExploreDestinations.title", { defaultValue: "Explore Destinations" })}
          </h2>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-[200px] animate-pulse">
                <div className="bg-tripswift-off-white rounded-2xl h-[160px] mb-3"></div>
                <div className="bg-tripswift-off-white h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-tripswift-off-white h-3 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-tripswift-off-white rounded-lg">
            <p className="text-gray-600 font-noto-sans">
              {t("HomeSections.ExploreDestinations.noLocationsAvailable", {
                defaultValue: "No locations are currently available. Please try again later."
              })}
            </p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-16 bg-tripswift-off-white rounded-lg">
            <p className="text-gray-600 font-noto-sans">
              {t("HomeSections.AllHotelLists.noHotels", { defaultValue: "No destinations available." })}
            </p>
          </div>
        ) : (
          <div className="relative">
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
              id="explore-destinations-scroll-container"
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {destinations.map((destination) => (
                <div
                  key={destination.id}
                  className="flex-shrink-0 w-[200px] cursor-pointer group"
                  onClick={() => handleLocationClick(destination)}
                >
                  {/* Image Container with Hover Effect */}
                  <div className="relative mb-3 rounded-2xl overflow-hidden transform transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-tripswift-blue/20 transition-all duration-300"></div>
                  </div>

                  {/* Destination Info */}
                  <div>
                    <h3 className="text-base font-semibold text-tripswift-black mb-1 group-hover:text-tripswift-blue transition-colors">
                      {destination.name}
                    </h3>
                    {destination.propertyCount && (
                      <p className="text-sm text-gray-600">
                        {destination.propertyCount.toLocaleString()} {t("HomeSections.ExploreDestinations.accommodations", { defaultValue: "accommodations" })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons - Agoda Style */}
            {canScrollLeft && (
              <button
                onClick={() => handleScroll('left')}
                className="absolute left-0 top-[100px] -translate-y-1/2 -translate-x-5 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 z-20 border border-gray-200 hover:scale-110"
                style={{ transform: 'translateY(-50%) translateX(-24px)' }}
                aria-label="Previous"
              >
                <ChevronRight className="w-5 h-5 text-tripswift-black rotate-180" />
              </button>
            )}

            {canScrollRight && (
              <button
                onClick={() => handleScroll('right')}
                className="absolute right-0 top-[100px] -translate-y-1/2 translate-x-5 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 z-20 border border-gray-200 hover:scale-110"
                style={{ transform: 'translateY(-50%) translateX(24px)' }}
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-tripswift-black" />
              </button>
            )}
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