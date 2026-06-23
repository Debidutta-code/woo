// ==========================================
// Room and Property Types
// ==========================================

export interface Room {
  _id: string;
  currency_code: string;
  has_valid_rate: boolean;
  max_occupancy: number;
  propertyInfo_id: string;
  property_id?: string;
  propertyId?: string;
  rate_plan_code: string;
  room_name: string;
  room_size: number;
  room_type: string;
  baseAmount?: number; 
  currencyCode?: string; 
  room_price?: number | null;
  ratePlans?: RatePlan[];
  totalRatePlans?: number;
  baseByGuestAmts?: {
    amountBeforeTax: number;
    numberOfGuests: number;
    _id: string;
  }[];
  additionalGuestAmounts?: {
    ageQualifyingCode: string;
    amount: number;
    _id: string;
  }[];
  image?: string[];
  amenities?: (string | Amenity)[];
  description?: string;
  available_rooms?: number;
  availabilityCount?: number | null;
  max_number_of_adults?: number;
  max_number_of_children?: number;
  room_view?: string;
  room_unit?: string;
  number_of_nights?: number;
  total_price_for_stay?: number;
  video?: {
    url: string;
    thumbnail?: string | null;
  } | null;
}

export interface RatePlan {
  ratePlanCode: string;
  hotelCode: string;
  hotelName: string;
  currencyCode: string;
  dailyRate: number;
  totalPrice: number;
  cancellationPolicy?: string | null;
  baseByGuestAmts: {
    amountBeforeTax: number;
    numberOfGuests: number;
    _id: string;
  }[];
  additionalGuestAmounts?: {
    ageQualifyingCode: string;
    amount: number;
    _id: string;
  }[];
  dateWiseRates: {
    date: string;
    amountBeforeTax: number;
    currencyCode: string;
    baseByGuestAmts: any[];
    additionalGuestAmounts?: any[];
  }[];
  durationDays: number;
  packages: any[];
  depositPolicy?: string | null;
  guaranteePolicy?: string | null;
  originalDailyRate?: number;
  originalTotalPrice?: number;
  geoPricingApplied?: boolean;
  geoPricingDetails?: {
    country: string;
    incrementType: string;
    incrementValue: number;
    operationType: string;
  };
}

export interface PropertyDetails {
  id: string;
  propertyName: string;
  propertyCode: string;
  propertyEmail: string;
  propertyContact: string;
  starRating: number | null;
  description: string;
  images: string[];
  video: string | null;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    landmark: string;
  };
  amenities: Record<string, boolean>;
  propertyCategory: string | null;
  propertyType: string | null;
  availableRooms: Array<{
    id: string;
    roomName: string;
    roomType: string;
    roomSize: number;
    roomUnit: string;
    roomView: string;
    maxOccupancy: number;
    numberOfBedrooms: number;
    smokingPolicy: string;
    floor: number;
    images: string[];
    video: {
      url: string;
      thumbnail?: string | null;
    } | null;
    view360Link: string | null;
    amenities: string[];
    availabilityCount: number;
    baseAmount: number;
    currencyCode: string;
    ratePlans: Array<{
      ratePlanId: string;
      ratePlanCode: string;
      ratePlanName: string;
      baseAmountPerNight: number;
      totalAmount: number;
      currencyCode: string;
      cancellationPolicy: string | null;
      depositPolicy: string | null;
      guaranteePolicy: string | null;
      includedAddonIds?: string[];
    }>;
  }>;
  baseAmount: number;
  currencyCode: string;
  availabilityCount: number;
  paymentAcceptedMethods: {
    payByCard: boolean;
    payAtHotel: boolean;
  };
  nights: number;
  checkIn: string;
  checkOut: string;
}

export interface RoomResponse {
  success: boolean;
  data: Room[];
  unavailableRoomTypes?: { roomType: string; dates: string[] }[];
  qrCode?: string;
  couponCode?: string;
}

export interface GuestDetails {
  rooms: number;
  guests: number;
  children: number;
  infants: number;
  childAges: number[];
}

export interface QRCodeData {
  qrCode: string | null;
  couponCode: string | null;
}

export interface Amenity {
  icon: string;
  name: string;
}

export interface ConvertedRoom {
  _id: string;
  currency_code: string;
  has_valid_rate: boolean;
  max_occupancy: number;
  propertyInfo_id: string;
  property_id?: string;
  propertyId?: string;
  rate_plan_code: string;
  room_name: string;
  room_size: number;
  room_type: string;
  baseAmount?: number;
  room_price?: number | null;
  ratePlans?: RatePlan[];
  totalRatePlans?: number;
  baseByGuestAmts?: {
    amountBeforeTax: number;
    numberOfGuests: number;
    _id: string;
  }[];
  image?: string[];
  description?: string;
  available_rooms?: number;
  max_number_of_adults?: number;
  max_number_of_children?: number;
  room_view?: string;
  // Overridden types
  amenities: Amenity[];
  default_image_url: string;
}
