// src/components/hotelListingComponents/HotelCardItem.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Star,
  Coffee,
  Wifi,
  Car,
  Waves,
  Droplets,
  Briefcase,
  Utensils,
  BellRing,
  Dog,
  Bath,
  Accessibility,
  CigaretteOff,
  Users,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { wishlistAPI } from "@/api/wishlist";

export interface Hotel {
  id: string;
  propertyName: string;
  propertyEmail: string;
  propertyContact: string;
  starRating: number | null; // ✅ Allow null
  propertyCode: string;
  description: string;
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
}
export interface HotelCardItemProps {
  hotel: Hotel;
  location: string;
  onViewRoom: (id: string) => void;
  checkinDate?: string | null;
  checkoutDate?: string | null;
  isLoading?: boolean;
  onWishlistToggle?: (hotelId: string, newState: boolean) => void;
}

const HotelCardItem: React.FC<HotelCardItemProps> = ({
  hotel,
  location,
  onViewRoom,
  checkinDate,
  checkoutDate,
  isLoading = false,
  onWishlistToggle,
}) => {
  const { t, i18n } = useTranslation();
  const [isWishlisted, setIsWishlisted] = useState(hotel.isWishlisted || false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const isTogglingRef = useRef(false);

  const images =
    hotel.images && hotel.images.length > 0
      ? hotel.images
      : [
          "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
        ];
  const hasMultipleImages = images.length > 1;

  // Sync wishlist state
  useEffect(() => {
    if (!isTogglingRef.current) {
      setIsWishlisted(hotel.isWishlisted || false);
    }
  }, [hotel.isWishlisted]);

  // Reset image index when hotel changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [hotel.id]);

  // Handle wishlist toggle with optimistic UI and custom toast
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isTogglingRef.current || isWishlistLoading) {
      return;
    }

    try {
      isTogglingRef.current = true;
      setIsWishlistLoading(true);

      // Optimistic update
      const newWishlistState = !isWishlisted;
      setIsWishlisted(newWishlistState);

      const response = await wishlistAPI.toggleWishlist(hotel.id);

      if (onWishlistToggle) {
        onWishlistToggle(hotel.id, newWishlistState);
      }

      // Show custom toast near heart button
      setShowWishlistToast(true);
      setTimeout(() => {
        setShowWishlistToast(false);
      }, 2000);
    } catch (error: any) {
      console.error("Wishlist toggle error:", error);

      // Revert optimistic update on error
      setIsWishlisted(!isWishlisted);

      toast.error(
        error.message ||
          t("HotelListing.HotelCardItem.wishlistError", {
            defaultValue: "Failed to update wishlist",
          }),
      );
    } finally {
      setIsWishlistLoading(false);
      isTogglingRef.current = false;
    }
  };

  // Handle image navigation
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Function to get amenity icon
  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case "wifi":
        return <Wifi className="h-4 w-4 text-tripswift-blue" />;
      case "swimming_pool":
        return <Waves className="h-4 w-4 text-tripswift-blue" />;
      case "fitness_center":
        return <Droplets className="h-4 w-4 text-tripswift-blue" />;
      case "spa_and_wellness":
        return <Bath className="h-4 w-4 text-tripswift-blue" />;
      case "restaurant":
        return <Utensils className="h-4 w-4 text-tripswift-blue" />;
      case "room_service":
        return <BellRing className="h-4 w-4 text-tripswift-blue" />;
      case "bar_and_lounge":
        return <Coffee className="h-4 w-4 text-tripswift-blue" />;
      case "parking":
        return <Car className="h-4 w-4 text-tripswift-blue" />;
      case "pet_friendly":
        return <Dog className="h-4 w-4 text-tripswift-blue" />;
      case "business_facilities":
        return <Briefcase className="h-4 w-4 text-tripswift-blue" />;
      case "non_smoking_rooms":
        return <CigaretteOff className="h-4 w-4 text-tripswift-blue" />;
      case "facilities_for_disabled_guests":
        return <Accessibility className="h-4 w-4 text-tripswift-blue" />;
      case "family_rooms":
        return <Users className="h-4 w-4 text-tripswift-blue" />;
      default:
        return null;
    }
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Helper to render star rating with partial fills
  const renderStarRating = (rating: number): React.ReactElement[] => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />,
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <div key={i} className="relative h-4 w-4">
            <Star className="h-4 w-4 text-gray-300 fill-current absolute" />
            <div className="overflow-hidden absolute" style={{ width: "50%" }}>
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
            </div>
          </div>,
        );
      } else {
        stars.push(
          <Star key={i} className="h-4 w-4 text-gray-300 fill-current" />,
        );
      }
    }
    return stars;
  };

  // Get Google Maps URL
  const getGoogleMapsUrl = () => {
    const lat = hotel.coordinates?.latitude;
    const lng = hotel.coordinates?.longitude;
    if (!lat || !lng) return "#";
    const query = encodeURIComponent(`${lat},${lng}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const defaultHotelImage =
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80";

  // Get review data
  const averageRating = hotel.customerReviewData?.averageRating || 0;
  const totalReviews = hotel.customerReviewData?.totalReviews || 0;
  const hasReviews = totalReviews > 0;

  // Get pricing data
  const baseAmount = hotel.baseAmount || 0;
  const currencyCode = hotel.currencyCode || "USD";

  // Check availability
  const isSoldOut = hotel.availabilityCount === 0;
  const isLimitedAvailability =
    hotel.availabilityCount !== null &&
    hotel.availabilityCount !== undefined &&
    hotel.availabilityCount > 0 &&
    hotel.availabilityCount <= 5;

  return (
    <div
      className="bg-tripswift-off-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group font-noto-sans cursor-pointer"
      onClick={() => !isSoldOut && onViewRoom(hotel.id)}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Image Section - Enhanced */}
        <div className="lg:w-2/6 h-72 lg:h-64 relative overflow-hidden group/image bg-gray-100 m-5 rounded-lg">
          <img
            src={images[currentImageIndex]}
            alt={`${hotel.propertyName} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultHotelImage;
            }}
          />

          {/* Wishlist Button with custom toast */}
          <button
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
            className={`absolute top-3 right-3 z-30 rounded-full p-2.5 shadow-xl transition-all duration-300 ${
              isWishlistLoading
                ? "bg-white/90 cursor-not-allowed"
                : "bg-white/95 hover:bg-white hover:scale-110 active:scale-95"
            }`}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            {isWishlistLoading ? (
              <div className="h-5 w-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
            ) : (
              <Heart
                className={`h-5 w-5 transition-all duration-300 ${
                  isWishlisted
                    ? "fill-red-500 stroke-red-500"
                    : "fill-none stroke-gray-700 hover:stroke-red-500"
                }`}
                strokeWidth={2}
              />
            )}
          </button>

          {/* Custom Toast near Heart Button */}
          {showWishlistToast && (
            <div className="absolute top-3 right-16 z-40 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="bg-white rounded-lg shadow-xl border border-gray-200 px-4 py-2 flex items-center gap-2 whitespace-nowrap">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-tripswift-medium text-gray-700">
                  {isWishlisted
                    ? "Added to saved list"
                    : "Removed from saved list"}
                </span>
              </div>
            </div>
          )}

          {/* Navigation arrows - Enhanced visibility */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-300 shadow-xl backdrop-blur-sm opacity-0 group-hover/image:opacity-100 transform -translate-x-2 group-hover/image:translate-x-0 hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-300 shadow-xl backdrop-blur-sm opacity-0 group-hover/image:opacity-100 transform translate-x-2 group-hover/image:translate-x-0 hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dot navigation - Enhanced */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => handleDotClick(e, index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? "w-2 h-2 bg-white scale-125"
                      : "w-1.5 h-1.5 bg-white/60 hover:bg-white/80"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Middle section - Hotel details - Enhanced spacing */}
        <div className="lg:w-3/6 p-5 border-r border-gray-100">
          {/* Hotel name and star rating */}
          <div className="flex flex-col items-start mb-3">
            <h3 className="text-xl font-tripswift-bold text-gray-900 mb-2 leading-tight">
              {hotel.propertyName}
            </h3>
            <div className="flex items-center gap-1">
              {hotel.starRating ? (
                renderStarRating(hotel.starRating)
              ) : (
                <span className="text-xs text-gray-500">No rating</span>
              )}
            </div>
          </div>

          {/* Location with map link */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4 text-tripswift-blue mr-1.5 flex-shrink-0" />
            <span className="font-tripswift-medium mr-2">{location}</span>
            {hotel.coordinates && (
              <>
                <span className="text-gray-400">•</span>
                <a
                  href={getGoogleMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mx-2 text-tripswift-blue hover:text-tripswift-blue text-sm font-tripswift-medium hover:underline transition-colors"
                >
                  Show on map
                </a>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-tripswift-black/70 mb-4 line-clamp-2 font-tripswift-regular leading-relaxed">
            {hotel.description ||
              t("HotelListing.HotelCardItem.descriptionFallback", {
                defaultValue:
                  "Comfortable accommodation with excellent amenities",
              })}
          </p>

          {/* Amenities - Enhanced design */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(hotel.amenities || {})
              .filter(([_, hasAmenity]) => hasAmenity)
              .slice(0, 4)
              .map(([amenity]) => (
                <div
                  key={amenity}
                  className="flex items-center text-xs font-tripswift-medium text-tripswift-blue bg-tripswift-off-white border border-tripswift-off-white/30 px-3 py-1.5 rounded-lg hover:bg-tripswift-off-white/10 transition-colors"
                >
                  {getAmenityIcon(amenity)}
                  <span
                    className={`capitalize ${i18n.language === "ar" ? "mr-1.5" : "ml-1.5"}`}
                  >
                    {t(`HotelListing.HotelCardItem.amenitiesList.${amenity}`, {
                      defaultValue: amenity.replace(/_/g, " "),
                    })}
                  </span>
                </div>
              ))}
          </div>

          {/* Date badge at bottom */}
          {checkinDate && checkoutDate && (
            <div className="flex items-center text-xs text-tripswift-black/70 mt-auto font-tripswift-medium">
              <span className="text-white bg-tripswift-blue border border-tripswift-blue/30 px-3 py-1.5 rounded-lg shadow-sm">
                {i18n.language === "ar"
                  ? `${formatDate(checkoutDate)} - ${formatDate(checkinDate)}`
                  : `${formatDate(checkinDate)} - ${formatDate(checkoutDate)}`}
              </span>
            </div>
          )}
        </div>

        {/* Right section - Enhanced rating and pricing */}
        <div className="lg:w-1.5/6 p-5 bg-gray-50/50 flex flex-col justify-between">
          {/* Top section - Rating badge */}
          <div className="mb-4">
            <div className="inline-flex items-center justify-between gap-3 w-full">
              <div className="flex flex-col items-start">
                <div className="text-sm font-tripswift-bold text-gray-700 mb-0.5">
                  {hasReviews
                    ? t("HotelListing.HotelCardItem.average", {
                        defaultValue: "Average",
                      })
                    : t("HotelListing.HotelCardItem.noRating", {
                        defaultValue: "No rating",
                      })}
                </div>
                <div className="text-xs text-gray-500 font-tripswift-medium">
                  {totalReviews}{" "}
                  {totalReviews === 1
                    ? t("HotelListing.HotelCardItem.review", {
                        defaultValue: "review",
                      })
                    : t("HotelListing.HotelCardItem.reviews", {
                        defaultValue: "reviews",
                      })}
                </div>
              </div>
              <div className="bg-tripswift-blue text-white text-lg font-tripswift-extrabold rounded-br-xl rounded-t-xl rounded-bl-none px-2 py-1 text-center min-w-[50px] shadow-md">
                {averageRating.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Limited availability badge */}
          {isLimitedAvailability && (
            <div className="mb-3">
              <div className="inline-block">
                <div className="bg-red-600 text-white text-xs font-tripswift-bold px-3 py-1.5 rounded shadow-md animate-pulse">
                  ONLY {hotel.availabilityCount} LEFT
                </div>
              </div>
            </div>
          )}

          {/* Price section - Enhanced */}
          {baseAmount > 0 && (
            <div className="mb-4">
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-sm text-gray-700 font-tripswift-bold uppercase">
                  {currencyCode}
                </span>
                <span className="text-3xl font-tripswift-extrabold text-gray-900">
                  {baseAmount.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-600 leading-tight">
                {t("HotelListing.HotelCardItem.perNight", {
                  defaultValue: "Per night before taxes and fees",
                })}
              </div>
            </div>
          )}

          {/* CTA Button - Enhanced states */}
          <div className="">
            {isSoldOut ? (
              <button
                disabled
                className="w-full px-6 py-3 rounded-xl text-sm font-tripswift-bold bg-gray-300 text-gray-500 cursor-not-allowed"
              >
                {t("HotelListing.HotelCardItem.soldOut", {
                  defaultValue: "Sold out on your dates!",
                })}
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLoading) {
                    onViewRoom(hotel.id);
                  }
                }}
                disabled={isLoading}
                className={`w-full px-6 py-3.5 rounded-xl text-sm font-tripswift-bold transition-all duration-300 flex items-center justify-center shadow-md ${
                  isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "btn-tripswift-primary hover:shadow-xl hover:scale-105 active:scale-95"
                }`}
                aria-label={t("HotelListing.HotelCardItem.viewRoomButton")}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("HotelListing.loadingText", {
                      defaultValue: "Loading...",
                    })}
                  </>
                ) : (
                  t("HotelListing.HotelCardItem.viewRoomButton", {
                    defaultValue: "View Room",
                  })
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCardItem;
