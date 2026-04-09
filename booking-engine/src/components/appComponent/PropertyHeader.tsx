// ==========================================
// Property Header Component
// ==========================================

import React from "react";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PropertyDetails } from "../../types/room.types";
import { getFormattedAddress } from "../../utils/roomHelpers";
import AvailabilitySearchWidget from "../hotelBox/SearchBar";
import { Star, Users, MapPin } from "lucide-react";

interface PropertyHeaderProps {
  propertyDetails: PropertyDetails | null;
  checkInDate: string;
  checkOutDate: string;
  guestDetails: any;
  onCheckAvailability: (
    checkin: string,
    checkout: string,
    guestDetails?: any,
  ) => void;
  isLoading: boolean;
  propertyCode: string;
  onViewReviews: () => void;
  onGoBack: () => void;
}

export const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  propertyDetails,
  checkInDate,
  checkOutDate,
  guestDetails,
  onCheckAvailability,
  isLoading,
  propertyCode,
  onViewReviews,
  onGoBack,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="bg-gradient-to-r from-tripswift-blue to-[#054B8F] text-tripswift-off-white">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <button
            onClick={onGoBack}
            className="inline-flex items-center text-sm font-tripswift-medium bg-white/20 px-3.5 py-2 rounded-full hover:bg-white/30 transition-colors mb-4 text-white backdrop-blur-sm"
          >
            <ChevronLeft
              className={`h-4 w-4 ${i18n.language === "ar" ? "ml-1.5" : "mr-1.5"}`}
            />
            {t("RoomsPage.backToSearch")}
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-3 items-center">
          <AvailabilitySearchWidget
            initialCheckin={checkInDate}
            initialCheckout={checkOutDate}
            onCheckAvailability={onCheckAvailability}
            loading={isLoading}
            hotelCode={propertyCode}
            guestDetails={guestDetails}
          />
          {propertyDetails?.starRating && (
            <div className="flex items-center bg-tripswift-off-white/10 backdrop-blur-sm pl-3.5 pr-4 py-2.5 rounded-xl">
              <Star
                className={`h-5 w-5 text-yellow-400 ${i18n.language === "ar" ? "ml-2.5" : "mr-2.5"}`}
              />
              <div>
                <div className="text-sm font-tripswift-medium">
                  {propertyDetails.starRating} {t("RoomsPage.starHotelRating")}
                </div>
              </div>
            </div>
          )}

          {propertyCode && (
            <button
              onClick={onViewReviews}
              className="flex items-center bg-tripswift-off-white/10 backdrop-blur-sm pl-3.5 pr-4 py-2.5 rounded-xl hover:bg-tripswift-off-white/20 transition-colors cursor-pointer"
            >
              <Users
                className={`h-5 w-5 text-tripswift-off-white/80 ${i18n.language === "ar" ? "ml-2.5" : "mr-2.5"}`}
              />
              <div>
                <div className="text-sm font-tripswift-medium">
                  {t("RoomsPage.viewReviews", {
                    defaultValue: "Guest Reviews",
                  })}
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
