import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
import type { DiscountType } from "@/pages/tax-system/interface";
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
