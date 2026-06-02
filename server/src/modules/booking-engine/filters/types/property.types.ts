// booking-engine/types/property.types.ts

import {
    IPropertyWithDetails,
    IInventoryItem,
    IChargeWithGuestAmounts,
    ISearchRatePlan,
} from './search.types';

// ============ Input Types ============

export interface IPropertyDetailQueryParams {
    propertyId: string;  // ✅ Changed from propertyCode to propertyId
    checkIn: Date;
    checkOut: Date;
    rooms: number;
    adults: number;
    children: number;
}

export interface IParsedPropertyDetailParams {
    propertyId: string;  // ✅ Changed from propertyCode to propertyId
    checkIn: Date;
    checkOut: Date;
    nights: number;
    rooms: number;
    adults: number;
    children: number;
}

// ============ Video Type ============

export interface IVideoDetail {
    url: string;
    thumbnail: string | null;
}

// ============ Room Type ============

export interface ISearchRoom {
    id: string;
    roomName: string;
    roomType: string;
    roomSize: number;
    roomUnit: string;
    roomView: string;
    maxOccupancy: number;
    numberOfBedrooms: number;
    smokingPolicy: string;
    floor: string;
    images: string[];
    video: IVideoDetail | null;
    view360Link: string | null;
    amenities: string[];
    availabilityCount: number;
    baseAmount: number;
    currencyCode: string;
    ratePlans: ISearchRatePlan[];
}

// ============ Property Detail Result ============

export interface IPropertyDetailResult {
    id: string;
    propertyName: string;
    propertyCode: string;
    propertyEmail: string;
    propertyContact: string;
    starRating: number | null;
    description: string;
    images: string[];
    video: IVideoDetail | null;
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
    availableRooms: ISearchRoom[];
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

// Re-export for convenience
export type {
    IPropertyWithDetails,
    IInventoryItem,
    IChargeWithGuestAmounts,
    ISearchRatePlan,
};
