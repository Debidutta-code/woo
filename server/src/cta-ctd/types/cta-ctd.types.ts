import { CurrencyCode } from "../../ari/types/roomRent.types";

export interface ICctaAndctd {
    propertyCode: string;
    ratePlanCode?: string;
    roomTypeCode?: string;
    dates: Date[];
}
export interface IChargesR {
    id: string;
    propertyCode: string;
    ratePlanName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    roomTypeName: string;
    currencyCode: CurrencyCode;
    date: Date;
    isAvailable: boolean;
    isSaleStopped: boolean;
    isCTAApplied: boolean;
    isCTDApplied: boolean;
}