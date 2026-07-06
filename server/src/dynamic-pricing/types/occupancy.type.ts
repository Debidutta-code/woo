import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';
import { DiscountType } from '../../tax-system/interfaces/tourist-tax.type';

export type DynamicPricingType = "increase" | "decrease";

export interface ICOccupancyBasedDynamicPricingS {
    roomId: string;
    minInventoryPercentage: number;
    maxInventoryPercentage: number;
    adjustmentType: DiscountType;
    adjustmentValue: number;
    currencyCode: CurrencyCode | null;
    pricingType: DynamicPricingType;
    minCap: number | null;
    maxCap: number | null;
}

export interface ICOccupancyBasedDynamicPricing {
    dynamicId: string;
    roomId: string;
    minInventoryPercentage: number;
    maxInventoryPercentage: number;
    adjustmentType: DiscountType;
    adjustmentValue: number;
    currencyCode: CurrencyCode | null;
    pricingType: DynamicPricingType;
    minCap: number | null;
    maxCap: number | null;
}

export interface IOccupancyBasedDynamicPricing extends ICOccupancyBasedDynamicPricing {
    id: string;
}