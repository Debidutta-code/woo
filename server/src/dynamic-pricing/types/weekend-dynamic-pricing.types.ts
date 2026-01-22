import { CurrencyCode } from "../../ari/types/roomRent.types";
import { AdjustmentType, OccupancyBasedAdjustmentType, PeriodType } from "./occupancy-dynamic-pricing.types";

export interface ICreateWeekendPricing {
  propertyId       :string;
  dynamicPricingId :string;
  roomId :string;
  roomType :string;
  roomName :string;
}
export interface IWeekendPricing extends ICreateWeekendPricing{
  id:string;
  fridayPricing:IWeekendPricingDays|null;
  saturdayPricing:IWeekendPricingDays|null;
  sundayPricing:IWeekendPricingDays|null;
}

export interface ICWeekendPricingDays {
  weekendPricingId: string;
  adjustmentType: OccupancyBasedAdjustmentType;
  adjustmentValue: number;
  currencyCode: CurrencyCode | null;
}
export interface IWeekendPricingDays extends ICWeekendPricingDays{
  id:string;
}