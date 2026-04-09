// booking-engine/types/availability.types.ts

export interface DayAvailability {
    checkIn:        string;
    minPriceFormat: string;
    currencyCode:   string;
    available:      boolean;
}

export interface AvailabilityMapData {
    available:    boolean;
    availability: number;
}

export interface RateMapData {
    price:        string;
    currencyCode: string;
}

export interface GetAvailabilityParams {
    hotelCode: string;
    checkIn?:  string;
    checkOut?: string;
}

export interface AvailabilityResult {
    success:    boolean;
    error?:     string;
    hotelCode?: string;
    totalDays?: number;
    days?:      DayAvailability[];
}

export interface AvailabilityResponse {
    success:    boolean;
    hotelCode?: string;
    totalDays?: number;
    days?:      DayAvailability[];
    error?:     string;
}

export interface IInventoryData {
    date:         Date;
    availability: number;
    propertyCode: string;
    roomTypeCode: string;
}

export interface IBaseGuestAmount {
    amountBeforeTax: number;
    numberOfGuests:  number;
}