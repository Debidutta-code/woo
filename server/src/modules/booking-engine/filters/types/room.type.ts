import { CurrencyCode, DeviceType, DiscountType } from "../../../../../prisma/generated/prisma/enums";
import { IRoomVideo } from "./search.types";


export interface IBookingSearchPayload {
  startDate: string;
  endDate: string;
  guests: {
    adults: number;
    children: number;
    rooms: number;
    roomsArray?: { adults: number; children: number; childAges: number[] }[];
  };
  propertyCode: string;
  countryCode?: string;
  deviceType?: DeviceType;
  promocode?: string;
}

export interface IBaseByGuestAmount {
  numberOfGuests: number;
  amountBeforeTax: number;
}

export interface IAddonDetail { 
  id: string;
  name: string;
  code: string;
  price: number;
  postingRhythm: string;
  description?: string | null;
  images: string[];
  category?: { id: string; name: string; code: string } | null;
  subCategory?: { id: string; name: string; code: string } | null;
  addonVariant?: { id: string; name: string; code: string } | null;
}

export interface IPromotion {
  id: string;
  promotionName: string;
  promotionType: string;
  discountType: string;
  discountValue: number | null;
  minLos?: number;
  maxLos?: number;
  validFrom?: Date | null;
  validTo?: Date | null;
  advanceBookingDays: number | null;
  monApplicable?: boolean;
  tueApplicable?: boolean;
  wedApplicable?: boolean;
  thuApplicable?: boolean;
  friApplicable?: boolean;
  satApplicable?: boolean;
  sunApplicable?: boolean;
}

export interface IAppliedDiscount {
  id: string;
  promotionName: string;
  promotionType: string;
  discountType: string;
  discountValue: number;
  calculatedDiscountAmount: number;
}

export interface ITouristTax {
  id: string;
  name: string | null;
  discountType: DiscountType;
  discountValue: number | null;
  currencyCode: CurrencyCode | null;
  calculatedTaxAmount?: number;
}

export interface IRoomPrice {
  ratePlanName: string;
  ratePlanCode: string;
  comboLabel: string;
  totalAmount: number;
  currencyCode: string;
  baseByGuestAmts: IBaseByGuestAmount[];
  policy: {
    depositPolicy?: any;
    cancellationPolicy?: any;
    guaranteePolicy?: any;
  };
  addons: IAddonDetail[];
  availablePromotions: IPromotion[];
  appliedDiscounts: IAppliedDiscount[];
  touristTax?: ITouristTax | null;
}

export interface IFetchRoomsResponse {
  success: boolean;
  message: string;
  data?: {
    propertyDetails: {
      id: string;
      propertyName: string;
      propertyVideos: any;
      loyaltyProgramConfig: any;
      propertyCode: string;
      starRating: number | null;
      bookingEngineConfig: any;
      address: any;
    };
    rooms: IRoom[];
    searchCriteria: IBookingSearchPayload;
  };
}

export interface IRoom {
  id: string;
  roomName: string;
  roomType: string;
  roomSize: number;
  maxOccupancy: number;
  maxNumberOfAdults: number;
  maxNumberOfChildren: number;
  roomUnit: string;
  roomView: string;
  description: string;
  images: string[];
  amenities: any[];
  has_valid_rate: boolean;
  room_price: IRoomPrice[];
  roomVideos: IRoomVideo | null;
}