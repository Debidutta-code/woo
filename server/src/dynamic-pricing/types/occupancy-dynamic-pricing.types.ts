import { Decimal } from "@prisma/client/runtime/library";
import { CurrencyCode } from "../../ari/types/roomRent.types";

export type AdjustmentType = "percentage" | "fixed";
export type PeriodType = "seasonal" | "holiday" | "special_weekend";
export type OccupancyBasedAdjustmentType = "percentage" | "fixed";
export interface ICCreateOccupancyBasedDynamicPricing {
  propertyId: string;
  dynamicPricingId: string;
  roomId: string;
  roomType: string;
  roomName: string;
  minimumOccupancyPercentage: number;
  maximumOccupancyPercentage: number;
  adjustmentType: OccupancyBasedAdjustmentType;
  adjustmentValue: number;
  currencyCode: CurrencyCode | undefined;
}
export interface ICreateOccupancyBasedDynamicPricing extends ICCreateOccupancyBasedDynamicPricing {
id:string;
updatedAt:Date;
}

