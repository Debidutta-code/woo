// ==========================================
// Room Helper Functions
// ==========================================

import { Room, RatePlan, PropertyDetails, ConvertedRoom } from "../types/room.types";

// ==========================================
// Address Formatting
// ==========================================

export const getFormattedAddress = (addressObj: any): string => {
  if (!addressObj) return "";
  if (typeof addressObj === "string") return addressObj;

  const parts = [
    addressObj.address_line_1,
    addressObj.address_line_2,
    addressObj.city,
    addressObj.state,
    addressObj.country,
  ].filter(Boolean);

  return parts.join(", ");
};

// ==========================================
// Guest Count Display
// ==========================================

export interface GuestDetails {
  rooms?: number;
  guests?: number;
  children?: number;
  infants?: number;
}

export const getGuestCountDisplay = (
  guestDetails: GuestDetails | null,
  t: (key: string, options?: any) => string
): string => {
  if (!guestDetails)
    return t("GuestBox.defaultText", {
      defaultValue: "1 Room · 1 Adult · 0 Children",
    });

  const rooms = guestDetails.rooms || 1;
  const adults = guestDetails.guests || 1;
  const children = guestDetails.children || 0;
  const infants = guestDetails.infants || 0;

  let display = `${rooms} ${rooms === 1 ? t("GuestBox.roomSingular") : t("GuestBox.roomsPlural")} · ${adults} ${adults === 1 ? t("GuestBox.adultSingular") : t("GuestBox.adultsPlural")}`;

  if (children > 0) {
    display += ` · ${children} ${children === 1 ? t("GuestBox.childSingular") : t("GuestBox.childrenPlural")}`;
  }
  if (infants > 0) {
    display += ` · ${infants} ${infants === 1 ? t("GuestBox.infantSingular") : t("GuestBox.infantsPlural")}`;
  }

  return display;
};

// ==========================================
// Amenity Icon Helper
// ==========================================

export const getAmenityIcon = (amenity: string) => {
  const normalizedAmenity = amenity.toLowerCase();
  switch (normalizedAmenity) {
    case "wifi":
      return "wifi";
    case "swimming_pool":
      return "swimming_pool";
    case "fitness_center":
      return "fitness_center";
    case "spa_and_wellness":
      return "spa_and_wellness";
    case "restaurant":
      return "restaurant";
    case "room_service":
      return "room_service";
    case "bar_and_lounge":
      return "bar_and_lounge";
    case "parking":
      return "parking";
    case "concierge_services":
      return "concierge_services";
    case "pet_friendly":
      return "pet_friendly";
    case "business_facilities":
      return "business_facilities";
    case "laundry_services":
      return "laundry_services";
    case "child_friendly_facilities":
      return "child_friendly_facilities";
    case "non_smoking_rooms":
      return "non_smoking_rooms";
    case "facilities_for_disabled_guests":
      return "facilities_for_disabled_guests";
    case "family_rooms":
      return "family_rooms";
    default:
      return "check-circle";
  }
};

// ==========================================
// Room Amenity Conversion
// ==========================================

export const convertAmenities = (
  room: Room,
  roomAmenities: { [key: string]: any },
  t: (key: string, options?: any) => string
): ConvertedRoom => {
  let roomAmenitiesList: string[] = [];

  // Normalize room_type for case-insensitive matching
  const roomTypeLower = room.room_type.toLowerCase();
  const amenitiesKeys = Object.keys(roomAmenities).reduce((acc, key) => {
    acc[key.toLowerCase()] = roomAmenities[key];
    return acc;
  }, {} as { [key: string]: any });

  // Get amenities for the specific room type, fallback to default
  const amenitiesForRoomType =
    amenitiesKeys[roomTypeLower] || amenitiesKeys["default"] || {};

  // Log for debugging mismatches
  if (!amenitiesKeys[roomTypeLower] && !amenitiesKeys["default"]) {
    console.warn(
      `No amenities found for room type "${room.room_type}" and no default amenities available`
    );
  } else if (!amenitiesKeys[roomTypeLower]) {
    // Using default amenities
  } else {
    // Found amenities for room type
  }

  // Support both legacy nested-object amenities and array-based amenities from backend.
  if (Array.isArray(amenitiesForRoomType)) {
    roomAmenitiesList = amenitiesForRoomType
      .filter((item) => typeof item === "string" && item.trim() !== "")
      .map((item) => item.trim());
  } else if (
    amenitiesForRoomType &&
    typeof amenitiesForRoomType === "object"
  ) {
    Object.values(amenitiesForRoomType).forEach((category: any) => {
      if (!category || typeof category !== "object") return;
      Object.entries(category).forEach(([key, value]) => {
        if (value === true || (typeof value === "string" && value !== "")) {
          // Handle special case for 'bed' which has string values like "double" or "single"
          const readableName =
            key === "bed"
              ? `Bed: ${value}`
              : key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim();
          roomAmenitiesList.push(readableName);
        }
      });
    });
  }

  // Final fallback: use room-level amenities if mapping by room type didn't produce values.
  if (roomAmenitiesList.length === 0 && Array.isArray(room.amenities)) {
    roomAmenitiesList = room.amenities
      .map((item) =>
        typeof item === "string"
          ? item
          : item && typeof item === "object" && "name" in item
            ? String((item as any).name || "")
            : ""
      )
      .filter((item) => item.trim() !== "");
  }

  // Remove duplicates (e.g., combine similar amenities)
  roomAmenitiesList = Array.from(new Set(roomAmenitiesList));

  const convertedAmenities = roomAmenitiesList.map((amenity) => {
    const getIconName = (amenityName: string) => {
      const amenityLower = amenityName.toLowerCase();
      // Comprehensive icon mappings based on Postman data
      if (amenityLower.includes("wifi") || amenityLower.includes("internet"))
        return "wifi";
      if (amenityLower.includes("air") || amenityLower.includes("ac"))
        return "snowflake";
      if (amenityLower.includes("smoking")) return "smoking-ban";
      if (amenityLower.includes("bed")) return "bed";
      if (
        amenityLower.includes("bathroom") ||
        amenityLower.includes("bidet") ||
        amenityLower.includes("toilet") ||
        amenityLower.includes("shower")
      )
        return "bathroom";
      if (
        amenityLower.includes("towels") ||
        amenityLower.includes("towels sheets")
      )
        return "towels";
      if (
        amenityLower.includes("linens") ||
        amenityLower.includes("linens bedding")
      )
        return "linens";
      if (
        amenityLower.includes("toiletries") ||
        amenityLower.includes("shampoo") ||
        amenityLower.includes("conditioner") ||
        amenityLower.includes("soap")
      )
        return "toiletries";
      if (
        amenityLower.includes("hairdryer") ||
        amenityLower.includes("hair dryer")
      )
        return "hairDryer";
      if (
        amenityLower.includes("table") ||
        amenityLower.includes("chairs") ||
        amenityLower.includes("dining table")
      )
        return "tableChairs";
      if (amenityLower.includes("desk") || amenityLower.includes("work desk"))
        return "desk";
      if (
        amenityLower.includes("dresser") ||
        amenityLower.includes("wardrobe")
      )
        return "dresserWardrobe";
      if (
        amenityLower.includes("seating") ||
        amenityLower.includes("sofa") ||
        amenityLower.includes("reading chair")
      )
        return "sofaSeating";
      if (
        amenityLower.includes("television") ||
        amenityLower.includes("flat screen tv") ||
        amenityLower.includes("satellite") ||
        amenityLower.includes("cable")
      )
        return "television";
      if (amenityLower.includes("telephone")) return "telephone";
      if (amenityLower.includes("heating")) return "heating";
      if (
        amenityLower.includes("refrigerator") ||
        amenityLower.includes("microwave") ||
        amenityLower.includes("kitchenware") ||
        amenityLower.includes("oven") ||
        amenityLower.includes("stovetop")
      )
        return "kitchenette";
      if (
        amenityLower.includes("coffee") ||
        amenityLower.includes("tea") ||
        amenityLower.includes("coffee maker") ||
        amenityLower.includes("electric kettle")
      )
        return "coffeeMaker";
      if (amenityLower.includes("smoke detectors")) return "smokeDetectors";
      if (amenityLower.includes("fire extinguisher"))
        return "fireExtinguisher";
      if (amenityLower.includes("safe")) return "safe";
      if (
        amenityLower.includes("accessible") ||
        amenityLower.includes("wheelchair") ||
        amenityLower.includes("elevator")
      )
        return "accessibility";
      if (amenityLower.includes("ironing")) return "ironing";
      if (
        amenityLower.includes("dining area") ||
        amenityLower.includes("sitting area")
      )
        return "sofaSeating";
      if (amenityLower.includes("balcony")) return "balcony";
      return "check-circle";
    };

    return {
      icon: getIconName(amenity),
      name: t(`RoomsPage.amenitiesList.${amenity.toLowerCase()}`, {
        defaultValue: amenity,
      }),
    };
  });

  return {
    ...room,
    amenities: convertedAmenities,
    default_image_url: room.image?.[0] || "",
  };
};

// ==========================================
// Price Formatting
// ==========================================

export const formatRoomPrice = (
  hasValidRate: boolean,
  price: number | null | undefined,
  currencyCode: string,
  t: (key: string, options?: any) => string
): string => {
  if (!hasValidRate || price == null) {
    return t("RoomsPage.priceNotAvailable");
  }
  return `${currencyCode} ${price.toFixed(2)}`;
};

// ==========================================
// Unavailable Room Check
// ==========================================

export const isRoomUnavailable = (
  room: ConvertedRoom,
  unavailableRoomTypes: { roomType: string; dates: string[] }[]
): boolean => {
  return unavailableRoomTypes.some(
    (unavailable) => unavailable.roomType === room.room_type
  );
};

// ==========================================
// Room Filtering
// ==========================================

export const filterRooms = (
  rooms: Room[] | null,
  filterType: string,
  searchQuery: string
): Room[] => {
  if (!rooms) return [];
  return rooms.filter((room) => {
    if (filterType !== "all" && room.room_type !== filterType) return false;
    if (
      searchQuery &&
      !room.room_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
};

// ==========================================
// Room Types Extraction
// ==========================================

export const getRoomTypes = (rooms: Room[] | null): string[] => {
  if (!rooms) return [];
  const types = new Set(rooms.map((room) => room.room_type));
  return ["all", ...Array.from(types)];
};
