export type CurrencyCode = 'USD' | 'EUR' | 'INR';

export interface RoomRequest {
    ratePlanCode: string;
    invTypeCode: string;
    startDate: Date;
    endDate: Date;
    noOfChildren: number;
    noOfAdults: number;
    noOfRooms: number;
}

export interface MultiRoomRateCalculationInput {
    propertyId: string;
    rooms: RoomRequest[];
}

export interface RateCalculationResult {
    success: boolean;
    message?: string;
    data?: {
        totalAmount: number;
        numberOfNights: number;
        breakdown: {
            totalBaseAmount: number;
            totalAdditionalCharges: number;
            totalAmount: number;
            averagePerNight: number;
            numberOfNights: number;
        };
        dailyBreakdown: DailyBreakdown[];
        tax: TaxDetail[];
        totalTax: number;
        priceAfterTax: number;
    };
}

export interface MultiRoomRateCalculationResult {
    success: boolean;
    message?: string;
    data?: {
        propertyId: string;
        propertyCode: string;
        rooms: RoomCalculationDetail[];
        summary: {
            totalAmountBeforeTax: number;
            totalTax: number;
            grandTotal: number;
            totalRooms: number;
        };
    };
}

export interface RoomCalculationDetail {
    ratePlanCode: string;
    ratePlanName?: string;
    invTypeCode: string;
    roomTypeName?: string;
    startDate: string;
    endDate: string;
    noOfRooms: number;
    noOfAdults: number;
    noOfChildren: number;
    totalAmount: number;
    numberOfNights: number;
    breakdown: {
        totalBaseAmount: number;
        totalAdditionalCharges: number;
        totalAmount: number;
        averagePerNight: number;
        numberOfNights: number;
    };
    dailyBreakdown: DailyBreakdown[];
    tax: TaxDetail[];
    totalTax: number;
    priceAfterTax: number;
}

export interface DailyBreakdown {
    date: string;
    dayOfWeek: string;
    ratePlanCode: string;
    baseRate: number;
    additionalCharges: number;
    totalPerRoom: number;
    totalForAllRooms: number;
    currencyCode: CurrencyCode;
    // NEW: Daily tax information
    taxDetails: TaxDetail[];
    totalTax: number;
    totalWithTax: number;
    breakdown: {
        baseAmount: number;
        additionalAdultCharges: number;
        additionalChildrenCharges: number;
        totalAdditionalCharges: number;
        baseGuestsIncluded: number;
        adultsInBaseRate: number;
        childrenInBaseRate: number;
        adultsNotInBaseRate: number;
        childrenNotInBaseRate: number;
        adultChargesDetail: any[];
        childrenChargesDetail: any[];
    };
}

export interface TaxDetail {
    name: string;
    amount: number;
    type: string;
    priority?: number;
    isInclusive?: boolean;
}
