// src/components/Sections/Destination.tsx
"use client";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCheckInDate, setCheckOutDate } from "../../Redux/slices/pmsHotelCard.slice";
import { format, addDays } from "date-fns";
import { getExplorDestinations } from "./api";
import { IExplorDestination } from "./types";
import toast from "react-hot-toast";
import { getUniqueCities } from "./api/unique-cities.api";


export function Destination() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const [destinations, setDestinations] = useState<IExplorDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const fallbackImages = [
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1200&auto=format&fit=crop",
  ];

  const fetchCityFallbackDestinations = async (): Promise<IExplorDestination[]> => {
    const cities = await getUniqueCities();

    return cities
      .filter((item: any) => typeof item?.city === "string" && item.city.trim().length > 0)
      .map((item: any, index: number) => ({
        id: `city-${index + 1}`,
        destinationName: item.city.trim(),
        destinationImage: fallbackImages[index % fallbackImages.length],
        slNo: index + 1,
      }));
  };
  // Fetch unique cities from API
  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await getExplorDestinations();
      if(response.success && Array.isArray(response.data) && response.data.length > 0){
        setDestinations(response.data);
      } else {
        const fallbackDestinations = await fetchCityFallbackDestinations();
        setDestinations(fallbackDestinations);
        if (!fallbackDestinations.length && response?.message) {
          toast.error(response.message);
        }
      }
      } catch (err: any) {
        try {
          const fallbackDestinations = await fetchCityFallbackDestinations();
          setDestinations(fallbackDestinations);
          if (!fallbackDestinations.length) {
            const errorMessage =
              err.response?.data?.message ||
              err.message ||
              t("HomeSections.AllHotelLists.errorMessage", {
                defaultValue: "An error occurred while fetching destinations",
              });
            setError(errorMessage);
          } else {
            setError(null);
          }
        } catch (fallbackError: any) {
          const errorMessage =
            fallbackError?.response?.data?.message ||
            err?.response?.data?.message ||
            fallbackError?.message ||
            err?.message ||
            t("HomeSections.AllHotelLists.errorMessage", {
              defaultValue: "An error occurred while fetching destinations",
            });
          setError(errorMessage);
        }
      }finally{
        setLoading(false)
      }
    };
  const handleLocationClick = (destination: IExplorDestination) => {
    const checkin = format(addDays(new Date(), 1), "yyyy-MM-dd");
    const checkout = format(addDays(new Date(), 2), "yyyy-MM-dd");
    dispatch(setCheckInDate(checkin));
    dispatch(setCheckOutDate(checkout));

    const guestParams = "&rooms=1&adults=1&children=0&infant=0";

    const imageParam = destination.destinationImage ? `&image=${encodeURIComponent(destination.destinationImage)}` : '';

    router.push(
      `/destination?location=${encodeURIComponent(destination.destinationName)}&checkin=${encodeURIComponent(
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
                  <div className="relative mb-3 rounded-2xl overflow-hidden transform transition-transform duration-300 group-hover:scale-95">
                    <img
                      src={destination.destinationImage}
                      alt={destination.destinationName}
                      className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-tripswift-blue/20 transition-all duration-300"></div>
                  </div>

                  {/* Destination Info */}
                  <div>
                    <h3 className="text-base font-semibold text-tripswift-black mb-1 group-hover:text-tripswift-blue transition-colors">
                      {destination.destinationName}
                    </h3>
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
