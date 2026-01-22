import { CurrencyCode } from "../../ari/types/roomRent.types";
import { OccupancyBasedAdjustmentType, PeriodType } from "./occupancy-dynamic-pricing.types";

export interface ICSeasonalHolidayPricingR {
  propertyId: string;
  dynamicPricingId: string;
  roomId: string;
  roomType: string;
  roomName: string;
  ruleName: string;
  periodType: PeriodType;
  startDate: Date;
  endDate: Date;
  adjustmentType: OccupancyBasedAdjustmentType;
  adjustmentValue: number;
  currencyCode: CurrencyCode | null;
}
export interface ISeasonalHolidayPricing extends ICSeasonalHolidayPricingR {
  id:string;
  updatedAt:Date;
}