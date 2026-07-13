"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "../../Redux/store";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  FaThermometerHalf,
  FaPhone,
  FaTv,
  FaCouch,
  FaChair,
  FaDoorClosed,
  FaDesktop,
  FaWifi,
  FaSnowflake,
  FaBed,
  FaUser,
  FaTree,
  FaCheckCircle,
  FaTimes,
  FaInfoCircle,
  FaRulerCombined,
  FaBath,
  FaShieldAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUtensils,
  FaMugHot,
  FaFireExtinguisher,
  FaFan,
  FaLightbulb,
  FaSoap,
  FaWheelchair,
  FaPlug,
  FaEye,
  FaSpinner,
} from "react-icons/fa";
import { Card } from "../../components/ui/card";
import { Room, RatePlan, Amenity } from "../../types/room.types";
import {
  calculatePriceForGuests,
  calculateDiscountPercentage,
  formatCurrency,
} from "../../components/appComponent/transformUtils";
import {
  getAvailabilityCount,
  isRoomAvailable,
} from "../../components/appComponent/availabilityUtils";
import { AddonsModal } from "./AddonsModal";
import { AvailableAddon, fetchAvailableAddons } from "../../api/addon";
import toast from "react-hot-toast";

// Type guard to check if amenity is an object with icon and name
const isAmenityObject = (amenity: string | Amenity): amenity is Amenity => {
  return (
    typeof amenity === "object" &&
    amenity !== null &&
    "icon" in amenity &&
    "name" in amenity
  );
};

// Extended Room type for RoomCard data (same as Room for now)
export type RoomData = Room;

type BookingPolicySection = {
  key: "cancellationPolicy" | "depositPolicy" | "guaranteePolicy";
  label: string;
  policies: string[];
};

const getPolicyText = (policy: unknown): string => {
  if (!policy) return "";

  if (typeof policy === "string") {
    return policy.trim();
  }

  if (typeof policy === "object") {
    const policyObject = policy as Record<string, unknown>;
    const description = policyObject.description;
    const policyName = policyObject.policyName;

    if (typeof description === "string" && description.trim()) {
      return description.trim();
    }

    if (typeof policyName === "string" && policyName.trim()) {
      return policyName.trim();
    }
  }

  return "";
};

const getUniquePolicyTexts = (
  ratePlans: Array<RatePlan | Room | null>,
  key: BookingPolicySection["key"],
) => {
  return Array.from(
    new Set(
      ratePlans
        .map((plan) => getPolicyText((plan as any)?.[key]))
        .filter(Boolean),
    ),
  );
};

interface RoomCardProps {
  data: Room;
  ratePlans?: RatePlan[];
  onBookNow: (
    ratePlan: RatePlan | Room,
    parsedAddons?: any[],
    includedAddons?: string[]
  ) => void;
  isLoadingPrice?: boolean;
  guestDetails?: any;
  roomAmenities?: any;
  propertyCode?: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  data,
  ratePlans,
  onBookNow,
  guestDetails,
  propertyCode,
}) => {
  const { checkInDate, checkOutDate } = useSelector((state: any) => state.pmsHotelCard);
  const { t } = useTranslation();
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllRatePlans, setShowAllRatePlans] = useState(false);
  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [loadingRatePlans, setLoadingRatePlans] = useState<{
    [key: string]: boolean;
  }>({});
  const [selectedAddons, setSelectedAddons] = useState<AvailableAddon[]>([]);
  const [addonsModalClosedViaAddButton, setAddonsModalClosedViaAddButton] = useState(false);
  const isContinuingWithAddonsRef = useRef(false);

  const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1617104678098-de229db51175?q=80&w=1514&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const allRatePlans = [...(ratePlans || []), ...(data.ratePlans || [])];
  const bookingPolicySections: BookingPolicySection[] = [
    {
      key: "cancellationPolicy" as const,
      label: t("RoomsPage.RoomCard.policies.cancellationPolicy"),
      policies: getUniquePolicyTexts(allRatePlans, "cancellationPolicy"),
    },
    {
      key: "depositPolicy" as const,
      label: "Deposit Policy",
      policies: getUniquePolicyTexts(allRatePlans, "depositPolicy"),
    },
    {
      key: "guaranteePolicy" as const,
      label: "Guarantee Policy",
      policies: getUniquePolicyTexts(allRatePlans, "guaranteePolicy"),
    },
  ].filter((section) => section.policies.length > 0);
  const hasBookingPolicies = bookingPolicySections.length > 0;

  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[:\-/]/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\b(t v|tv)\b/g, "tv")
      .trim();
  };

  const getAmenityTranslationKey = (displayName: string): string | null => {
    const normalizedDisplayName = normalizeString(displayName);
    if (displayName.startsWith("Bed:")) {
      const bedType = displayName.split(":")[1]?.trim().toLowerCase();
      if (bedType) {
        return `RoomsPage.RoomCard.roomAmenities.basic.bedTypes.${bedType}`;
      }
      return "RoomsPage.RoomCard.roomAmenities.basic.bed";
    }
    const normalizedMap: Record<string, string> = {
      bed: "RoomsPage.RoomCard.roomAmenities.basic.bed",
      "private bathroom": "RoomsPage.RoomCard.roomAmenities.basic.bathroom",
      bathroom: "RoomsPage.RoomCard.roomAmenities.basic.bathroom",
      "linens bedding": "RoomsPage.RoomCard.roomAmenities.basic.linensBedding",
      "fresh linens": "RoomsPage.RoomCard.roomAmenities.basic.linens",
      linens: "RoomsPage.RoomCard.roomAmenities.basic.linens",
      bidet: "RoomsPage.RoomCard.roomAmenities.basic.bidet",
      "toilet paper": "RoomsPage.RoomCard.roomAmenities.basic.toiletPaper",
      "towels sheets": "RoomsPage.RoomCard.roomAmenities.basic.towelsSheets",
      "free toiletries":
        "RoomsPage.RoomCard.roomAmenities.basic.freeToiletries",
      shower: "RoomsPage.RoomCard.roomAmenities.basic.shower",
      toilet: "RoomsPage.RoomCard.roomAmenities.basic.toilet",
      "table and chairs":
        "RoomsPage.RoomCard.roomAmenities.furniture.tableChairs",
      "table chairs": "RoomsPage.RoomCard.roomAmenities.furniture.tableChairs",
      "work desk": "RoomsPage.RoomCard.roomAmenities.furniture.desk",
      desk: "RoomsPage.RoomCard.roomAmenities.furniture.desk",
      "dresser and wardrobe":
        "RoomsPage.RoomCard.roomAmenities.furniture.dresserWardrobe",
      "dresser wardrobe":
        "RoomsPage.RoomCard.roomAmenities.furniture.dresserWardrobe",
      "sofa seating": "RoomsPage.RoomCard.roomAmenities.furniture.sofaSeating",
      "dining table": "RoomsPage.RoomCard.roomAmenities.furniture.diningTable",
      "reading chair":
        "RoomsPage.RoomCard.roomAmenities.furniture.readingChair",
      "dining area": "RoomsPage.RoomCard.roomAmenities.spaceLayout.diningArea",
      "sitting area":
        "RoomsPage.RoomCard.roomAmenities.spaceLayout.sittingArea",
      balcony: "RoomsPage.RoomCard.roomAmenities.spaceLayout.balcony",
      television: "RoomsPage.RoomCard.roomAmenities.technology.television",
      telephone: "RoomsPage.RoomCard.roomAmenities.technology.telephone",
      "wifi internet":
        "RoomsPage.RoomCard.roomAmenities.technology.wifiInternet",
      "flat screen tv":
        "RoomsPage.RoomCard.roomAmenities.technology.flatScreenTV",
      "satellite channels":
        "RoomsPage.RoomCard.roomAmenities.technology.satelliteChannels",
      "cable channels":
        "RoomsPage.RoomCard.roomAmenities.technology.cableChannels",
      "air conditioning":
        "RoomsPage.RoomCard.roomAmenities.climateControl.airConditioning",
      heating: "RoomsPage.RoomCard.roomAmenities.climateControl.heating",
      "mini refrigerator":
        "RoomsPage.RoomCard.roomAmenities.kitchenetteMiniBar.smallRefrigerator",
      "small refrigerator":
        "RoomsPage.RoomCard.roomAmenities.kitchenetteMiniBar.smallRefrigerator",
      refrigerator:
        "RoomsPage.RoomCard.roomAmenities.kitchenetteMiniBar.refrigerator",
      microwave:
        "RoomsPage.RoomCard.roomAmenities.kitchenetteMiniBar.microwave",
      kitchenware:
        "RoomsPage.RoomCard.roomAmenities.kitchenetteMiniBar.kitchenware",
      "electric kettle":
        "RoomsPage.RoomCard.roomAmenities.kitchenetteMiniBar.electricKettle",
      oven: "RoomsPage.RoomCard.roomAmenities.kitchenetteMiniBar.oven",
      stovetop: "RoomsPage.RoomCard.roomAmenities.kitchenetteMiniBar.stovetop",
      "tea coffee maker":
        "RoomsPage.RoomCard.roomAmenities.kitchenetteMiniBar.teaCoffeeMaker",
      "in room safe": "RoomsPage.RoomCard.roomAmenities.safetySecurity.safe",
      safe: "RoomsPage.RoomCard.roomAmenities.safetySecurity.safe",
      "smoke detectors":
        "RoomsPage.RoomCard.roomAmenities.safetySecurity.smokeDetectors",
      "fire extinguisher":
        "RoomsPage.RoomCard.roomAmenities.safetySecurity.fireExtinguisher",
      "shampoo conditioner":
        "RoomsPage.RoomCard.roomAmenities.toiletries.shampooConditioner",
      soap: "RoomsPage.RoomCard.roomAmenities.toiletries.soap",
      "hair dryer": "RoomsPage.RoomCard.roomAmenities.toiletries.hairDryer",
      "additional lighting":
        "RoomsPage.RoomCard.roomAmenities.workLeisure.additionalLighting",
      "ironing facilities":
        "RoomsPage.RoomCard.roomAmenities.workLeisure.ironingFacilities",
      "accessible bathroom":
        "RoomsPage.RoomCard.roomAmenities.accessibilityFeatures.accessibleBathroom",
      "wheelchair accessibility":
        "RoomsPage.RoomCard.roomAmenities.accessibilityFeatures.wheelchairAccessibility",
      "upper floors accessible by elevator":
        "RoomsPage.RoomCard.roomAmenities.accessibilityFeatures.upperFloorsAccessibleByElevator",
      "entire unit wheelchair accessible":
        "RoomsPage.RoomCard.roomAmenities.accessibilityFeatures.entireUnitWheelchairAccessible",
    };
    return normalizedDisplayName in normalizedMap
      ? normalizedMap[normalizedDisplayName]
      : null;
  };

  const getRoomAmenities = () => {
    if (data.amenities && data.amenities.length > 0) {
      return data.amenities.map((amenity) => {
        // Check if amenity is an object with icon and name
        if (isAmenityObject(amenity)) {
          const category = amenity.icon;
          const displayName = amenity.name;

          let translatedName;

          if (displayName.startsWith("Bed:")) {
            const bedType = displayName.split(":")[1]?.trim().toLowerCase();
            const bedLabel = t("RoomsPage.RoomCard.roomAmenities.basic.bed");

            if (bedType) {
              const translationKey = `RoomsPage.RoomCard.roomAmenities.basic.bedTypes.${bedType}`;
              const bedTypeTranslation = t(translationKey);

              if (bedTypeTranslation !== translationKey) {
                translatedName = `${bedLabel}: ${bedTypeTranslation}`;
              } else {
                translatedName = displayName;
              }
            } else {
              translatedName = bedLabel;
            }
          } else {
            const translationKey = getAmenityTranslationKey(displayName);

            if (translationKey) {
              translatedName = t(translationKey);
              if (translatedName === translationKey) {
                translatedName = displayName;
              }
            } else {
              translatedName = displayName;
            }
          }

          return {
            icon: getIconComponent(category, displayName),
            name: translatedName,
          };
        }

        // Handle string amenities (legacy format)
        const displayName =
          typeof amenity === "string" ? amenity : String(amenity);
        let translatedName;

        if (displayName.startsWith("Bed:")) {
          const bedType = displayName.split(":")[1]?.trim().toLowerCase();
          const bedLabel = t("RoomsPage.RoomCard.roomAmenities.basic.bed");

          if (bedType) {
            const translationKey = `RoomsPage.RoomCard.roomAmenities.basic.bedTypes.${bedType}`;
            const bedTypeTranslation = t(translationKey);

            if (bedTypeTranslation !== translationKey) {
              translatedName = `${bedLabel}: ${bedTypeTranslation}`;
            } else {
              translatedName = displayName;
            }
          } else {
            translatedName = bedLabel;
          }
        } else {
          const translationKey = getAmenityTranslationKey(displayName);

          if (translationKey) {
            translatedName = t(translationKey);
            if (translatedName === translationKey) {
              translatedName = displayName;
            }
          } else {
            translatedName = displayName;
          }
        }

        return {
          icon: getIconComponent("", displayName),
          name: translatedName,
        };
      });
    }

    return [];
  };

  const getIconComponent = (category: string, displayName: string) => {
    const iconClass = "h-3 w-3 text-tripswift-blue";
    switch (displayName) {
      case "Bed":
        return <FaBed className={iconClass} />;
      case "Private Bathroom":
      case "Bathroom":
      case "Shower":
      case "Toilet":
      case "Towels and Sheets":
      case "Fresh Linens":
      case "Linens":
      case "Linens and Bedding":
      case "Bidet":
      case "Toilet Paper":
      case "Free Toiletries":
        return <FaBath className={iconClass} />;
      case "Table and Chairs":
      case "Table Chairs":
      case "Dining Table":
        return <FaChair className={iconClass} />;
      case "Work Desk":
      case "Desk":
        return <FaDesktop className={iconClass} />;
      case "Dresser and Wardrobe":
      case "Dresser Wardrobe":
        return <FaDoorClosed className={iconClass} />;
      case "Sofa Seating":
      case "Reading Chair":
        return <FaCouch className={iconClass} />;
      case "Dining Area":
      case "Sitting Area":
        return <FaCouch className={iconClass} />;
      case "Balcony":
        return <FaTree className={iconClass} />;
      case "Television":
      case "Flat-Screen TV":
      case "Flat Screen TV":
      case "Satellite Channels":
      case "Cable Channels":
        return <FaTv className={iconClass} />;
      case "Telephone":
        return <FaPhone className={iconClass} />;
      case "Wi-Fi Internet":
      case "Wifi Internet":
      case "WiFi Internet":
        return <FaWifi className={iconClass} />;
      case "Air Conditioning":
        return <FaSnowflake className={iconClass} />;
      case "Heating":
        return <FaThermometerHalf className={iconClass} />;
      case "Mini Refrigerator":
      case "Small Refrigerator":
      case "Refrigerator":
        return <FaSnowflake className={iconClass} />;
      case "Microwave":
      case "Oven":
      case "Stovetop":
        return <FaUtensils className={iconClass} />;
      case "Kitchenware":
      case "Electric Kettle":
      case "Tea/Coffee Maker":
      case "Tea Coffee Maker":
        return <FaMugHot className={iconClass} />;
      case "In-Room Safe":
      case "Safe":
        return <FaShieldAlt className={iconClass} />;
      case "Smoke Detectors":
      case "Fire Extinguisher":
        return <FaFireExtinguisher className={iconClass} />;
      case "Shampoo & Conditioner":
      case "Shampoo Conditioner":
      case "Soap":
        return <FaSoap className={iconClass} />;
      case "Hair Dryer":
        return <FaFan className={iconClass} />;
      case "Additional Lighting":
        return <FaLightbulb className={iconClass} />;
      case "Ironing Facilities":
        return <FaPlug className={iconClass} />;
      case "Accessible Bathroom":
      case "Wheelchair Accessible":
      case "Wheelchair Accessibility":
      case "Upper Floors Accessible by Elevator":
      case "Upper Floors Accessible By Elevator":
      case "Entire Unit Wheelchair Accessible":
        return <FaWheelchair className={iconClass} />;
      default:
        return <FaCheckCircle className={iconClass} />;
    }
  };

  const roomAmenitiesList = getRoomAmenities();
  const topRateRowAmenities = roomAmenitiesList
    .map((amenity) => amenity?.name)
    .filter(Boolean)
    .slice(0, 2);
  const roomVideoUrl =
    data.video && typeof data.video === "object" ? data.video.url : "";
  const mediaItems = [
    ...(data.image && data.image.length > 0
      ? data.image.map((url) => ({ type: "image" as const, url }))
      : [{ type: "image" as const, url: DEFAULT_IMAGE }]),
    ...(roomVideoUrl ? [{ type: "video" as const, url: roomVideoUrl }] : []),
  ];
  const currentMedia = mediaItems[currentImageIndex] || mediaItems[0];

  useEffect(() => {
    if (showPolicyModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showPolicyModal]);

  useEffect(() => {
    if (currentImageIndex >= mediaItems.length) {
      setCurrentImageIndex(0);
    }
  }, [currentImageIndex, mediaItems.length]);

  // Use ratePlans if provided, otherwise use single null for room
  const displayRatePlans =
    ratePlans && ratePlans.length > 0 ? ratePlans : [null];
  // Show all rate plans by default to ensure all rate plans are visible
  const visibleRatePlans = displayRatePlans;
  const handleBookNow = async (ratePlan: RatePlan | Room) => {
    const key =
      "ratePlanCode" in ratePlan ? ratePlan.ratePlanCode : data.room_name;
    setLoadingRatePlans((prev) => ({ ...prev, [key]: true }));
    
    // Reset the flag for new booking flow
    setAddonsModalClosedViaAddButton(false);

    // Extract includedAddonIds from the rate plan (addons linked via extranet "Manage Addons")
    const includedAddonIds: string[] = (ratePlan as any).includedAddonIds || [];

    try {
      // Store the selected rate plan temporarily for booking
      (window as any).__selectedRatePlan = ratePlan;
      
      // Check if there are any addons available before showing the modal
      if (checkInDate && checkOutDate && propertyCode) {
        const ratePlanCode = "ratePlanCode" in ratePlan ? ratePlan.ratePlanCode : undefined;
        const addons = await fetchAvailableAddons(
          propertyCode,
          checkInDate,
          checkOutDate,
          ratePlanCode
        );
        
        // Only show modal if there are addons available
        if (addons && addons.length > 0) {
          setShowAddonsModal(true);
        } else {
          // No addons available, proceed directly to booking with includedAddons
          await onBookNow(ratePlan, [], includedAddonIds);
          delete (window as any).__selectedRatePlan;
          setLoadingRatePlans((prev) => ({ ...prev, [key]: false }));
        }
      } else {
        // Missing required data, proceed directly to booking with includedAddons
        await onBookNow(ratePlan, [], includedAddonIds);
        delete (window as any).__selectedRatePlan;
        setLoadingRatePlans((prev) => ({ ...prev, [key]: false }));
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
      setLoadingRatePlans((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleAddonsSelected = async (addons: AvailableAddon[]) => {
    const ratePlan = (window as any).__selectedRatePlan;
    const key =
      "ratePlanCode" in ratePlan ? ratePlan.ratePlanCode : data.room_name;

    // Extract includedAddonIds from the rate plan
    const includedAddonIds: string[] = (ratePlan as any)?.includedAddonIds || [];

    try {
      isContinuingWithAddonsRef.current = true;
      // Store selected addons in session/context before proceeding
      setSelectedAddons(addons);

      const groupedAddons = addons.reduce((acc, addon) => {
        if (!acc[addon.addonId]) {
          acc[addon.addonId] = {};
        }
        const dateKey = new Date(addon.date).toISOString();
        acc[addon.addonId][dateKey] = (acc[addon.addonId][dateKey] || 0) + 1;
        return acc;
      }, {} as Record<string, Record<string, number>>);

      const parsedAddons = Object.entries(groupedAddons).map(
        ([addOnId, availabilityMap]) => ({
          addOnId,
          availability: Object.entries(availabilityMap).map(
            ([date, quantity]) => ({
              date,
              quantity,
            })
          ),
        })
      );
      
      // Mark that modal was closed via Add button to prevent duplicate booking
      setAddonsModalClosedViaAddButton(true);
      
      // Call the original onBookNow with both parsedAddons and includedAddonIds
      await onBookNow(ratePlan, parsedAddons, includedAddonIds);
      
      // Clear the temporary storage
      delete (window as any).__selectedRatePlan;
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoadingRatePlans((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleAddonsModalClose = async () => {
    setShowAddonsModal(false);
    if (isContinuingWithAddonsRef.current) {
      isContinuingWithAddonsRef.current = false;
      return;
    }
    const ratePlan = (window as any).__selectedRatePlan;
    const key =
      "ratePlanCode" in (ratePlan || {})
        ? ratePlan.ratePlanCode
        : data.room_name;
    
    // Extract includedAddonIds from the rate plan
    const includedAddonIds: string[] = (ratePlan as any)?.includedAddonIds || [];

    try {
      // Only proceed with booking if modal was not closed via Add button
      // (Add button already calls onBookNow via handleAddonsSelected)
      if (ratePlan && !addonsModalClosedViaAddButton) {
        await onBookNow(ratePlan, [], includedAddonIds);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoadingRatePlans((prev) => ({ ...prev, [key]: false }));
      delete (window as any).__selectedRatePlan;
      setAddonsModalClosedViaAddButton(false);
    }
  };

  return (
    <>
      <Card className="w-full shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white border border-gray-200 rounded-lg overflow-hidden font-noto-sans">
        <div className="flex flex-col lg:flex-row">
          {/* LEFT: Image Section */}
          <div className="w-full lg:w-[280px] xl:w-[320px] flex-shrink-0">
            <div className="relative w-full h-[200px] sm:h-[220px] md:h-[240px] lg:h-[220px] bg-gray-100">
              {(() => {
                const availCount = getAvailabilityCount(data);
                return (
                  availCount !== null &&
                  availCount <= 5 &&
                  availCount > 0 && (
                    <div className="absolute top-2 left-2 z-20 bg-red-500 text-white text-[10px] sm:text-xs font-bold py-1 px-2 rounded shadow-md">
                      Only {availCount} room{availCount !== 1 ? "s" : ""} left!
                    </div>
                  )
                );
              })()}

              {currentMedia?.type === "video" ? (
                <video
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                  src={currentMedia.url}
                />
              ) : (
                <Image
                  src={currentMedia?.url || DEFAULT_IMAGE}
                  alt={`${data.room_name || "Room"} image ${currentImageIndex + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = DEFAULT_IMAGE;
                  }}
                />
              )}

              {mediaItems.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? mediaItems.length - 1 : prev - 1,
                      );
                    }}
                    className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-gray-700 rounded-full p-1.5 sm:p-2 shadow-lg transition-colors duration-300 z-10"
                    aria-label="Previous image"
                  >
                    <FaChevronLeft className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) =>
                        prev === mediaItems.length - 1 ? 0 : prev + 1,
                      );
                    }}
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-gray-700 rounded-full p-1.5 sm:p-2 shadow-lg transition-colors duration-300 z-10"
                    aria-label="Next image"
                  >
                    <FaChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </button>
                </>
              )}

              {mediaItems.length > 1 && (
                <div className="absolute bottom-2 right-2 z-20 bg-black/80 text-white text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full">
                  {currentImageIndex + 1}/{mediaItems.length}
                </div>
              )}

              <div className="absolute bottom-2 left-2 z-20">
                <button className="bg-white/95 hover:bg-white text-tripswift-blue text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full shadow-md transition-colors">
                  See photos
                </button>
              </div>

            </div>

            {/* Room Details Below Image */}
            <div className="p-3 sm:p-4 bg-white">
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {data.room_name}
              </h3>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FaRulerCombined className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  <span className="whitespace-nowrap">
                    {data.room_size} {data.room_unit || "m²"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUser className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  <span className="whitespace-nowrap">
                    Max occupancy {data.max_occupancy || data.max_number_of_adults || 0}
                  </span>
                </div>
                {data.room_view && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600 text-xs sm:text-sm">
                      • {
                        typeof data.room_view === 'string' 
                          ? data.room_view 
                          : Array.isArray(data.room_view as any) 
                            ? (data.room_view as any[]).map((v: any) => v?.MasterRoomView?.viewName || v?.viewName || "").filter(Boolean).join(", ")
                            : (data.room_view as any)?.MasterRoomView?.viewName || (data.room_view as any)?.viewName || ""
                      }
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-2 sm:mb-3">
                {roomAmenitiesList.length > 0 ? (
                  roomAmenitiesList
                    .slice(0, 6)
                    .map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-700"
                      >
                        {React.cloneElement(amenity.icon, {
                          className: "h-3 w-3 text-gray-500 flex-shrink-0",
                        })}
                        <span className="truncate">{amenity.name}</span>
                      </div>
                    ))
                ) : (
                  <p className="col-span-2 text-xs text-gray-500">
                    {t("RoomsPage.noAmenitiesSpecified", {
                      defaultValue: "No amenities available for this room.",
                    })}
                  </p>
                )}
              </div>

              <button
                onClick={() => setShowFacilitiesModal(true)}
                className="text-tripswift-blue hover:underline text-xs sm:text-sm font-medium flex items-center gap-1"
              >
                <FaEye className="h-3 w-3 sm:h-4 sm:w-4" />
                See details
              </button>

              {showFacilitiesModal && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
                  onClick={() => setShowFacilitiesModal(false)}
                >
                  <div
                    className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden my-4 sm:my-8 max-h-[90vh] sm:max-h-[85vh]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between bg-tripswift-blue text-white px-4 sm:px-6 py-3 sm:py-4">
                      <h3 className="text-base sm:text-lg font-semibold">
                        Room Facilities
                      </h3>
                      <button
                        onClick={() => setShowFacilitiesModal(false)}
                        className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors"
                        aria-label="Close"
                      >
                        <FaTimes className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>

                    <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-60px)] sm:max-h-[75vh]">
                      {data.description && (
                        <div className="mb-4 sm:mb-5">
                          <div 
                            className="text-xs sm:text-sm text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: data.description }} 
                          />
                        </div>
                      )}

                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                          Amenities
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {roomAmenitiesList.length > 0 ? (
                            roomAmenitiesList.map((amenity, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-xs sm:text-sm text-gray-700"
                              >
                                {React.cloneElement(amenity.icon, {
                                  className:
                                    "h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0",
                                })}
                                <span className="break-words">
                                  {amenity.name}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-500">
                              {t("RoomsPage.noAmenitiesSpecified", {
                                defaultValue: "No amenities available for this room.",
                              })}
                            </p>
                          )}
                        </div>
                      </div>

                      {hasBookingPolicies && (
                        <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowFacilitiesModal(false);
                              setShowPolicyModal(true);
                            }}
                            className="text-tripswift-blue hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center gap-1"
                          >
                            <FaInfoCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {t("RoomsPage.RoomCard.viewBookingPolicies")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Rate Plans List (Agoda Style) */}
          <div className="w-full lg:w-auto lg:flex-1 bg-gray-50">
            {visibleRatePlans.map((ratePlan, index) => {
              const guestCount = guestDetails?.guests || 1;
              const currentRatePlan = ratePlan || data;

              // Calculate price for current guest count
              const price =
                ratePlan &&
                ((ratePlan as any).totalAmount ||
                  (ratePlan as any).baseAmountPerNight ||
                  (ratePlan as any).totalPrice)
                  ? Number(
                      (ratePlan as any).totalAmount ||
                        (ratePlan as any).baseAmountPerNight ||
                        (ratePlan as any).totalPrice
                    )
                  : data.baseAmount || data.room_price || 0;

              const isRoomAvail = isRoomAvailable(data);
              const isPriceAvailable = ratePlan
                ? true
                : (data.has_valid_rate ?? (price > 0));

              const isAvailable = isRoomAvail && isPriceAvailable;

              // Find all prices for discount calculation
              // Find all prices for discount calculation
              const allPrices = displayRatePlans.map((rp) =>
                rp &&
                ((rp as any).totalAmount ||
                  (rp as any).baseAmountPerNight ||
                  (rp as any).totalPrice)
                  ? Number(
                      (rp as any).totalAmount ||
                        (rp as any).baseAmountPerNight ||
                        (rp as any).totalPrice
                    )
                  : data.baseAmount || data.room_price || 0,
              );
              const lowestPrice = Math.min(...allPrices);
              const highestPrice = Math.max(...allPrices);
              const isLowestPrice = price === lowestPrice && index === 0;

              // Calculate discount
              const hasDiscount = price < highestPrice;
              const discountPercentage = calculateDiscountPercentage(
                highestPrice,
                price,
              );

              // Check cancellation policy
              const ratePlanCode =
                "ratePlanCode" in currentRatePlan
                  ? currentRatePlan.ratePlanCode
                  : currentRatePlan.rate_plan_code;
              const rawRatePlanDisplayName =
                "ratePlanName" in currentRatePlan &&
                currentRatePlan.ratePlanName
                  ? currentRatePlan.ratePlanName
                  : ratePlanCode;
              const ratePlanDisplayName =
                typeof rawRatePlanDisplayName === "string"
                  ? rawRatePlanDisplayName
                  : String(rawRatePlanDisplayName ?? "");
              const isNonRefundable =
                (ratePlanCode || "").toLowerCase().includes("non-refundable") ||
                (ratePlanCode || "").toLowerCase().includes("nonrefundable");

              // Generate a safe unique key
              const uniqueKey = ratePlan
                ? `${ratePlan.ratePlanCode}-${index}`
                : `room-${
                    data.room_name?.replace(/\s+/g, "-") || "default"
                  }-${index}`;

              return (
                <div
                  key={uniqueKey}
                  className={`flex flex-col md:flex-row items-stretch justify-between border-b border-gray-200 ${
                    isLowestPrice
                      ? "bg-blue-50 border-l-4 md:border-l-2 border-l-blue-500"
                      : "bg-white border-l-4 md:border-l-2 border-l-gray-300"
                  }`}
                >
                  {/* Left: Rate Plan Details */}
                  <div className="flex-1 p-3 md:p-4 lg:p-5 border-b md:border-b-0 border-gray-200">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">
                        {guestCount} {guestCount === 1 ? "adult" : "adults"}
                      </span>
                      {isLowestPrice && (
                        <span className="bg-blue-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap">
                          Lowest price!
                        </span>
                      )}
                      {hasDiscount && discountPercentage > 0 && (
                        <span className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded">
                          -{discountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    {/* Benefits/Features */}
                    <div className="space-y-1 mb-2">
                      {isNonRefundable && (
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-red-600">
                          <FaTimes className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                          <span className="font-medium">Non-refundable</span>
                        </div>
                      )}

                      {ratePlanCode?.toLowerCase().includes("prepayment") && (
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-tripswift-blue">
                          <FaCheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                          <span className="font-medium">
                            No prepayment needed
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 text-[10px] sm:text-xs text-gray-600">
                      {topRateRowAmenities.map((amenityName, amenityIndex) => (
                        <span
                          key={`${uniqueKey}-amenity-${amenityIndex}`}
                          className="whitespace-nowrap"
                        >
                          ✓ {amenityName}
                        </span>
                      ))}
                      {data?.number_of_nights && (
                        <span className="whitespace-nowrap">
                          • {data.number_of_nights} night
                          {(data.number_of_nights ?? 0) > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setShowFacilitiesModal(true)}
                      className="text-tripswift-blue hover:underline text-[10px] sm:text-xs font-medium mt-2"
                    >
                      See details
                    </button>

                    {/* Rate Plan Name */}
                    <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-700">
                        Rate Plan:
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-[10px] sm:text-xs text-gray-600 break-all">
                          {ratePlanDisplayName || "Standard"}
                        </span>
                      </div>
                    </div>

                    {/* Guest breakdown if multiple guest rates */}
                    {(() => {
                      const guestAmts =
                        ratePlan?.baseByGuestAmts ||
                        currentRatePlan.baseByGuestAmts;
                      return (
                        guestAmts &&
                        guestAmts.length > 1 && (
                          <div className="mt-2 text-[10px] sm:text-xs text-gray-500">
                            <details className="cursor-pointer">
                              <summary className="hover:text-gray-700">
                                View pricing for different guest counts per day
                              </summary>
                              <div className="mt-1 space-y-0.5 pl-3 sm:pl-4">
                                {guestAmts.map((guestRate) => (
                                  <div key={guestRate._id}>
                                    {guestRate.numberOfGuests} guest
                                    {guestRate.numberOfGuests > 1
                                      ? "s"
                                      : ""}:{" "}
                                    {formatCurrency(
                                      guestRate.amountBeforeTax,
                                      data?.currency_code || "USD",
                                    )}
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        )
                      );
                    })()}
                  </div>

                  {/* Right: Price and Book Button */}
                  <div
                    className={`flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center p-3 md:p-4 lg:p-5 min-w-full md:min-w-[180px] lg:min-w-[200px] border-t md:border-t-0 md:border-l border-gray-200 ${
                      isLowestPrice
                        ? "md:border-l-2 md:border-l-blue-500"
                        : "md:border-l-2 md:border-l-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-start md:items-end">
                      {/* Original price with discount */}
                      {hasDiscount && discountPercentage > 0 && (
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                          <span className="text-xs sm:text-sm text-gray-500 line-through">
                            {data?.currency_code || "USD"}{" "}
                            {highestPrice.toFixed(2)}
                          </span>
                          <span className="bg-red-100 text-red-700 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded">
                            Save {discountPercentage}%
                          </span>
                        </div>
                      )}

                      {/* Current price */}
                      <div className="flex items-baseline gap-1 mb-0.5 sm:mb-1">
                        <span className="text-xs sm:text-sm text-gray-600">
                          {data?.currency_code || "USD"}
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-gray-900">
                          {price ? price.toFixed(2) : "0.00"}
                        </span>
                      </div>
                      {/* Total for stay */}
                      {(data?.number_of_nights ?? 0) > 1 && (
                        <div className="text-[10px] sm:text-xs text-gray-600 mb-0.5 sm:mb-1">
                          Total: {data?.currency_code || "USD"}{" "}
                          {(price * (data?.number_of_nights ?? 1)).toFixed(2)}
                        </div>
                      )}

                      {/* <div className="text-[10px] sm:text-xs text-gray-600 mb-2 sm:mb-3">
                        Per night • Taxes excluded
                      </div> */}
                    </div>

                    <div className="flex flex-col items-end w-auto md:w-full">
                      {/* Book Button */}
                      <button
                        onClick={() => handleBookNow(currentRatePlan)}
                        disabled={
                          !isAvailable ||
                          loadingRatePlans[ratePlanCode || "default"]
                        }
                        className={`w-auto md:w-full px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg whitespace-nowrap ${
                          isAvailable
                            ? "bg-tripswift-blue text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {loadingRatePlans[ratePlanCode || "default"] ? (
                          <div className="flex items-center justify-center gap-2">
                            <FaSpinner className="animate-spin h-4 w-4" />
                            Processing...
                          </div>
                        ) : isAvailable ? (
                          "Book Now"
                        ) : (
                          "Sold Out"
                        )}
                      </button>

                      {/* Secure Payment */}
                      {isAvailable && (
                        <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-600">
                          <FaShieldAlt className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span>Secure payment</span>
                        </div>
                      )}

                      {/* Limited Availability */}
                      {(() => {
                        const availCount = getAvailabilityCount(data);
                        return (
                          availCount !== null &&
                          availCount <= 10 &&
                          availCount > 0 && (
                            <div className="text-[10px] sm:text-xs text-blue-600 font-medium mt-1 whitespace-nowrap">
                              Only {availCount} room
                              {availCount !== 1 ? "s" : ""} left!
                            </div>
                          )
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Show More Offers Button */}
            {ratePlans && ratePlans.length > 2 && (
              <button
                onClick={() => setShowAllRatePlans(!showAllRatePlans)}
                className="w-full py-2.5 sm:py-3 text-center text-tripswift-blue hover:bg-gray-100 font-medium text-xs sm:text-sm border-t border-gray-200 bg-gray-100"
              >
                {showAllRatePlans
                  ? "⌃ Show less"
                  : `⌄ Show more offers (${ratePlans.length - 2} more)`}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Policy Modal */}
      {showPolicyModal && hasBookingPolicies && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setShowPolicyModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden my-4 sm:my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-tripswift-blue text-white px-4 py-3">
              <h3 className="text-base sm:text-lg font-semibold">
                {t("RoomsPage.RoomCard.policies.title")}
              </h3>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors"
                aria-label="Close"
              >
                <FaTimes className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-5 sm:space-y-6">
                {bookingPolicySections.map((section) => (
                  <div key={section.key}>
                    <h4 className="text-sm sm:text-base font-semibold flex items-center mb-3">
                      <FaInfoCircle className="mr-2 text-tripswift-blue h-4 w-4 sm:h-5 sm:w-5" />
                      {section.label}
                    </h4>

                    <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-gray-700">
                      {section.policies.map((policy, idx) => (
                        <li key={`${section.key}-${idx}`} className="leading-relaxed whitespace-pre-wrap">
                          {policy}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowPolicyModal(false)}
                className="mt-4 w-full bg-tripswift-blue hover:bg-blue-700 text-white font-semibold py-2 sm:py-2.5 px-4 rounded-lg transition-colors shadow-sm text-sm sm:text-base"
              >
                {t("RoomsPage.RoomCard.policies.gotIt")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Addons Modal */}
      <AddonsModal
        isOpen={showAddonsModal}
        onClose={handleAddonsModalClose}
        propertyCode={propertyCode || data.propertyInfo_id || ""}
        roomCode={data.room_name}
        ratePlanCode={
          "ratePlanCode" in ((window as any).__selectedRatePlan || {})
            ? (window as any).__selectedRatePlan.ratePlanCode
            : undefined
        }
        startDate={checkInDate || ""}
        endDate={checkOutDate || ""}
        numberOfNights={data.number_of_nights || 1}
        currencyCode={data.currency_code || "USD"}
        onAddonsSelected={handleAddonsSelected}
      />
    </>
  );
};
