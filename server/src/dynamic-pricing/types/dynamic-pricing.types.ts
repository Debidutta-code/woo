import { CurrencyCode } from "../../ari/types/roomRent.types";

export type AdjustmentType = "percentage" | "fixed";
export type PeriodType = "seasonal" | "holiday" | "special_weekend";
export interface ICreateOccupancyBasedDynamicPricing {
  propertyId: string;
  dynamicPricingId: string;
  roomId:string;
  roomType:string;
  roomName:string;
  minimumOccupancyPercentage:number;
  maximumOccupancyPercentage:number;
  adjustmentType:AdjustmentType;
  adjustmentValue:number;
  currencyCode:CurrencyCode|null;
}

export interface ISeasonalHolidayPricing{
  propertyId: string;
  dynamicPricingId: string;
  roomId:string;
  roomType:string;
  roomName:string;
  ruleName:string;
  periodType:PeriodType;
  startDate:Date;
  endDate:Date;
  adjustmentType:AdjustmentType;
  adjustmentValue:number;
  currencyCode:CurrencyCode|null;
}