// ==========================================
// Property Info Component
// ==========================================

import React, { useState } from "react";
import {
  MapPin,
  CheckCircle,
  Wifi,
  Waves,
  Droplets,
  Bath,
  Utensils,
  BellRing,
  Coffee,
  Car,
  Dog,
  Briefcase,
  Ban,
  Accessibility,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PropertyDetails } from "../../types/room.types";
import { getFormattedAddress } from "../../utils/roomHelpers";
import { PropertyGallery } from "./PropertyGallery";

interface PropertyInfoProps {
  propertyDetails: PropertyDetails | null;
  isLoading: boolean;
}

export const PropertyInfo: React.FC<PropertyInfoProps> = ({
  propertyDetails,
  isLoading,
}) => {
  const { t, i18n } = useTranslation();
  const [showFullDescription, setShowFullDescription] =
    useState<boolean>(false);

  const getAmenityIcon = (amenity: string) => {
    const normalizedAmenity = amenity.toLowerCase();

    switch (normalizedAmenity) {
      case "wifi":
        return <Wifi className="h-4 w-4 text-tripswift-blue" />;
      case "swimmingpool":
      case "swimming_pool":
      case "pool":
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
        return <Ban className="h-4 w-4 text-tripswift-blue" />;
      case "facilities_for_disabled_guests":
        return <Accessibility className="h-4 w-4 text-tripswift-blue" />;
      case "family_rooms":
        return <Users className="h-4 w-4 text-tripswift-blue" />;
      // ✅ ADD THESE FOR YOUR SPECIFIC AMENITIES
      case "transport":
        return <Car className="h-4 w-4 text-tripswift-blue" />;
      case "telephone":
        return <BellRing className="h-4 w-4 text-tripswift-blue" />;
      case "footballground":
      case "football ground":
        return <Users className="h-4 w-4 text-tripswift-blue" />;
      default:
        return <CheckCircle className="h-4 w-4 text-tripswift-blue" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        <div className="h-16 bg-gray-200" />
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="h-[280px] bg-gray-200 rounded-xl" />
              <div className="h-6 bg-gray-200 rounded mt-4 w-1/3" />
              <div className="h-4 bg-gray-200 rounded mt-2 w-2/3" />
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded-xl" />
              <div className="h-32 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Collapsible header */}
      <div
        className="flex justify-between items-center bg-tripswift-blue/5 p-4 cursor-pointer"
        onClick={() => {}}
      >
        <div>
          <h1 className="text-property-title">
            {propertyDetails?.propertyName ||
              t("RoomsPage.viewPropertyDetails")}
          </h1>
          {propertyDetails?.address && (
            <div className="text-location flex items-center text-gray-600 mt-1.5">
              <MapPin
                className={`h-4 w-4 text-tripswift-blue flex-shrink-0 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`}
              />
              <span className="font-tripswift-regular text-sm">
                {getFormattedAddress(propertyDetails.address)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-3 pb-4">
        {/* Gallery */}
        <PropertyGallery
          propertyDetails={propertyDetails}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
          {/* Property description */}
          {propertyDetails?.description && (
            <div className="bg-tripswift-off-white p-4 rounded-xl border border-gray-100 mb-4">
              <h3 className="text-section-heading mb-2">
                {t("RoomsPage.aboutThisProperty")}
              </h3>
              <p className="text-description leading-relaxed whitespace-pre-wrap">
                {propertyDetails.description.split(" ").length > 10 ? (
                  <>
                    {showFullDescription
                      ? propertyDetails.description
                      : propertyDetails.description
                          .split(" ")
                          .slice(0, 10)
                          .join(" ") + "..."}
                    <button
                      type="button"
                      className="text-tripswift-blue font-tripswift-medium text-sm ml-1"
                      onClick={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                    >
                      {showFullDescription
                        ? t("RoomsPage.showLess")
                        : t("RoomsPage.showMore")}
                    </button>
                  </>
                ) : (
                  propertyDetails.description
                )}
              </p>
            </div>
          )}
          {/* Contact information */}
          <div className="bg-tripswift-off-white rounded-xl border p-4 border-gray-100">
            <h3 className="text-section-heading mb-3">
              {t("RoomsPage.contactInformation")}
            </h3>
            <div className="space-y-2">
              {propertyDetails?.propertyContact && (
                <div className="flex items-center text-description">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-tripswift-blue flex-shrink-0 ${i18n.language === "ar" ? "ml-3" : "mr-3"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="break-all">
                    +{propertyDetails.propertyContact}
                  </span>
                </div>
              )}
              {propertyDetails?.propertyEmail && (
                <div className="flex items-center text-description">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-tripswift-blue flex-shrink-0 ${i18n.language === "ar" ? "ml-3" : "mr-3"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="break-all">
                    {propertyDetails.propertyEmail}
                  </span>
                </div>
              )}
              {propertyDetails?.address && (
                <div className="flex items-start text-description">
                  <MapPin
                    className={`h-4 w-4 text-tripswift-blue flex-shrink-0 mt-0.5 ${i18n.language === "ar" ? "ml-3" : "mr-3"}`}
                  />
                  <span className="leading-relaxed">
                    {getFormattedAddress(propertyDetails.address)}
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Property amenities section */}
          <div className="bg-tripswift-off-white rounded-xl border p-4 border-gray-100">
            <h3 className="text-section-heading mb-3">
              {t("RoomsPage.propertyAmenities")}
            </h3>
            {propertyDetails?.amenities &&
            Object.keys(propertyDetails.amenities).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {Object.entries(propertyDetails.amenities)
                  .filter(([_, hasAmenity]) => hasAmenity)
                  .map(([amenity]) => (
                    <div
                      key={amenity}
                      className="flex items-center text-xs font-tripswift-medium text-tripswift-blue bg-tripswift-blue/5 border border-tripswift-blue/20 px-2 py-1 rounded-md"
                    >
                      {getAmenityIcon(amenity)}
                      <span
                        className={`capitalize ${i18n.language === "ar" ? "mr-2" : "ml-2"}`}
                      >
                        {amenity
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())
                          .trim()}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-description">
                {t("RoomsPage.noAmenitiesSpecified")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
