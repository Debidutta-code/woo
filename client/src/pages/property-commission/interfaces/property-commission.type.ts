import type { CurrencyCode } from "@/components/currency-code/currency-code.type";

export type CommissionType = "percentage" | "fixed";

export interface IPropertyCommission {
    id: string;
    propertyId: string;
    commissionType: CommissionType;
    commissionValue: number;
    currencyCode: CurrencyCode | null;
}

export interface ICPropertyCommission {
    propertyId: string;
    commissionType: CommissionType;
    commissionValue: number;
    currencyCode?: CurrencyCode;
}

export interface IUPropertyCommission {
    commissionType?: CommissionType;
    commissionValue?: number;
    currencyCode?: CurrencyCode | null;
}

export interface ICommissionCalculate {
    subtotal: number;
}