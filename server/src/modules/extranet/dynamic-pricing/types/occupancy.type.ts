import { CurrencyCode, DiscountType } from '../../tax-system/interfaces';

export interface ICOccupancyBasedDynamicPricingS {
    roomId: string;
    minInventoryPercentage: number;
    maxInventoryPercentage: number;
    adjustmentType: DiscountType;
    adjustmentValue: number;
    currencyCode: CurrencyCode | null;
}
export interface ICOccupancyBasedDynamicPricing {
    dynamicId: string;
    roomId: string;
    minInventoryPercentage: number;
    maxInventoryPercentage: number;
    adjustmentType: DiscountType;
    adjustmentValue: number;
    currencyCode: CurrencyCode | null;
}
export interface IOccupancyBasedDynamicPricing extends ICOccupancyBasedDynamicPricing {
    id: string;
}
