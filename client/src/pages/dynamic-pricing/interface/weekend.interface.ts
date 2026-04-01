import type { CurrencyCode } from "@/components/currency-code/currency-code.type";
import type { DiscountType } from "@/pages/tax-system/interface";

export type WeekEndDays = "friday" | "saturday" | "sunday";

export interface ICWeekendDynamicPricing {
  dynamicId: string;
  roomId: string;
  ruleName: string;
  weekendDays: WeekEndDays[];
  startDate: Date;
  endDate: Date;
  adjustmentType: DiscountType;
  adjustmentValue: number;
  currencyCode: CurrencyCode | null;
  minCap: number | null;
  maxCap: number | null;
}
export interface ICWeekendDynamicPricingS extends Omit<ICWeekendDynamicPricing, "dynamicId"> {

}

export interface IWeekendDynamicPricing extends ICWeekendDynamicPricing {
  id: string;
}