import { CurrencyCode } from "../../ari/types/roomRent.types";

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "modified";
export type PaymentMethod = | "crypto" | "pay_at_hotel" | "pay_with_crypto";
export interface IReservation {
    id: string;
    bookingCode: string;

    propertyId: string;
    propertyCode: string|null;
    hotelName: string|null;

    roomTypeCode: string|null;
    ratePlanCode: string|null;

    bookedAt: Date;

    reservationStatus: ReservationStatus;

    noOfAdults: number;
    noOfChildren: number;
    noOfInfants: number;

    from: Date;
    to: Date;

    checkInDate: Date;
    checkOutDate: Date;

    additionalNotes: string|null;

    primaryGuestId: string;
    bookingUserEmail: string;
    bookingUserPhone: string|null;
    isDeleted: boolean;
    paymentMethod: PaymentMethod;
    paymentImages: any|null;

    amount: number;
    currencyCode: CurrencyCode
    finalPrice: any

    paidAmount: number;
    extraAmountToPay: number;
    refundAmount: number;
    isPromoUsed: boolean;
    promoId: string|null;


    agencyId: string|null
}
