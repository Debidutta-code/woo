import axios from "axios";
import Cookies from "js-cookie";

// ========================================================================================================================================================
// TYPES & INTERFACES
// 

export interface HotelFilters {
  startDate: string;
  endDate: string;
  star_rating?: number[];
  amenities?: Record<string, boolean>;
  roomAmenities?: Record<string, boolean>;
  bedType?: ("single" | "double" | "king" | "twin" | "queen")[];
  roomType?: string[];
  propertyTypes?: string[];
  propertyCategories?: string[];
  special?: ("family" | "child" | "business" | "smoking")[];
  bedrooms?: number[];
  customerReview?: number[];
  minPrice?: number;
  maxPrice?: number;
  sort?:
    | "asc"
    | "desc"
    | "rating_asc"
    | "rating_desc"
    | "review_asc"
    | "review_desc"
    | "price_asc"
    | "price_desc";
  sortBy?: string;
  paymentAcceptedMethods?: {
    payByCard?: boolean;
    payAtHotel?: boolean;
  };
}

export interface Hotel {
  id: string;
  propertyName: string;
  propertyEmail: string;
  propertyContact: string;
  starRating: number | null;
  propertyCode: string;
  description: string;
  images: string[];
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
  isWishlisted?: boolean;
  customerReviewData?: {
    averageRating: number;
    totalReviews: number;
  };
}

export interface HotelData {
  success: boolean;
  message: string;
  data: Hotel[];
}

const getAuthHeaders = () => {
  return token
    ? {
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
};

// ============================================================================
// buildQueryString - sends amenities as JSON OBJECT (backend expects this)
// ============================================================================
const buildQueryString = (filters: HotelFilters): string => {
  const queryParts: string[] = [];

  // Required parameters
  queryParts.push(`checkin=${filters.startDate}`);
  queryParts.push(`checkout=${filters.endDate}`);

  // Star rating filter
  if (filters.star_rating && filters.star_rating.length > 0) {
    queryParts.push(`star_rating=${JSON.stringify(filters.star_rating)}`);
  }

  // ✅ Amenities filter - send as JSON OBJECT (AND logic)
  if (filters.amenities && Object.keys(filters.amenities).length > 0) {
    const activeAmenities = Object.fromEntries(
      Object.entries(filters.amenities).filter(([_, value]) => value === true),
    );
    if (Object.keys(activeAmenities).length > 0) {
      queryParts.push(`amenities=${JSON.stringify(activeAmenities)}`);
    }
  }

  // ✅ Room amenities filter - send as JSON OBJECT
  if (filters.roomAmenities && Object.keys(filters.roomAmenities).length > 0) {
    const activeRoomAmenities = Object.fromEntries(
      Object.entries(filters.roomAmenities).filter(([_, value]) => value === true),
    );
    if (Object.keys(activeRoomAmenities).length > 0) {
      queryParts.push(`roomAmenities=${JSON.stringify(activeRoomAmenities)}`);
    }
  }

  // Bed type filter
  if (filters.bedType && filters.bedType.length > 0) {
    queryParts.push(`bedType=${JSON.stringify(filters.bedType)}`);
  }

  // Room type filter
  if (filters.roomType && filters.roomType.length > 0) {
    queryParts.push(`roomType=${JSON.stringify(filters.roomType)}`);
  }

  // Property types filter
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    queryParts.push(`propertyTypes=${JSON.stringify(filters.propertyTypes)}`);
  }

  // Property categories filter
  if (filters.propertyCategories && filters.propertyCategories.length > 0) {
    queryParts.push(
      `propertyCategories=${JSON.stringify(filters.propertyCategories)}`,
    );
  }

  // Special features filter
  if (filters.special && filters.special.length > 0) {
    queryParts.push(`special=${JSON.stringify(filters.special)}`);
  }

  // Bedrooms filter
  if (filters.bedrooms && filters.bedrooms.length > 0) {
    queryParts.push(`bedrooms=${JSON.stringify(filters.bedrooms)}`);
  }

  // Customer review filter
  if (filters.customerReview && filters.customerReview.length > 0) {
    queryParts.push(`customerReview=${JSON.stringify(filters.customerReview)}`);
  }

  // Price range filters
  if (filters.minPrice !== undefined && filters.minPrice !== null) {
    queryParts.push(`minPrice=${filters.minPrice}`);
  }

  if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
    queryParts.push(`maxPrice=${filters.maxPrice}`);
  }

  // Sort filter
  if (filters.sort) {
    queryParts.push(`sort=${filters.sort}`);
  }

  if (filters.sortBy) {
    queryParts.push(`sortBy=${filters.sortBy}`);
  }

  // Payment methods filter
  if (filters.paymentAcceptedMethods) {
    const paymentMethods = {
      ...(filters.paymentAcceptedMethods.payByCard !== undefined && {
        payByCard: filters.paymentAcceptedMethods.payByCard,
      }),
      ...(filters.paymentAcceptedMethods.payAtHotel !== undefined && {
        payAtHotel: filters.paymentAcceptedMethods.payAtHotel,
      }),
    };
    if (Object.keys(paymentMethods).length > 0) {
      queryParts.push(
        `paymentAcceptedMethods=${JSON.stringify(paymentMethods)}`,
      );
    }
  }

  return queryParts.join("&");
};

// ============================================================================
// HOTEL SEARCH API
// ============================================================================

export const getHotelsByCity = async (
  cityCode: string,
  filters: HotelFilters,
): Promise<HotelData> => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("Backend URL is not defined in environment variables.");
    }

    if (!filters.startDate || !filters.endDate) {
      throw new Error("Both startDate and endDate are required.");
    }

    const queryString = buildQueryString(filters);

    const response = await axios.get(
      `${backendUrl}/booking-engine/filters/search?location=${encodeURIComponent(cityCode)}&${queryString}`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (response.data.success === true) {
      return response.data;
    } else {
      return {
        success: false,
        message: response.data.message || "No hotels found",
        data: [],
      };
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message || "Failed to fetch hotels.";

      console.error("❌ API Error:", { status, message });

      if (status === 400 || status === 404) {
        return {
          success: false,
          message: message || "No hotels found matching the provided location",
          data: [],
        };
      } else if (status === 401) {
        throw new Error("Session expired. Please log in again.");
      }

      throw new Error(message);
    } else {
      throw new Error(
        error.message || "Something went wrong while fetching hotels.",
      );
    }
  }
};

export const getHotelsByLocationWithoutFilters = async (
  cityCode: string,
  startDate: string,
  endDate: string,
): Promise<HotelData> => {
  return getHotelsByCity(cityCode, { startDate, endDate });
};