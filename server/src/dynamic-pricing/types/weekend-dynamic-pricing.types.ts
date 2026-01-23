import { CurrencyCode } from "../../ari/types/roomRent.types";
import { AdjustmentType, OccupancyBasedAdjustmentType, PeriodType } from "./occupancy-dynamic-pricing.types";

export type weekendDay = "fri_day" | "sat_day" | "sun_day";

export interface ICreateWeekendPricing {
  propertyId       :string;
  dynamicPricingId :string;
  roomId :string;
  roomType :string;
  roomName :string;
}
export interface ICreateWeekendPricingS {
  propertyId       :string;
  dynamicPricingId :string;
  roomId :string;
  
}
export interface IWeekendPricing extends ICreateWeekendPricing{
  id:string;
  weekDays:IWeekendPricingDays[]
}
export interface IUWeekendPricingDays {
  adjustmentType: OccupancyBasedAdjustmentType;
  adjustmentValue: number;
  currencyCode: CurrencyCode | null;
}
export interface ICWeekendPricingDays {
  day: weekendDay;
  weekendPricingId: string;
  adjustmentType: OccupancyBasedAdjustmentType;
  adjustmentValue: number;
  currencyCode: CurrencyCode | null;
}
export interface IWeekendPricingDays extends ICWeekendPricingDays{
  id:string;
}