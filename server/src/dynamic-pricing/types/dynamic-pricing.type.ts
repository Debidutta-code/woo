import {
    IOccupancyBasedDynamicPricing,
    ISeasonalDynamicPricing,
    IWeekendDynamicPricing,
    SeasonalDynamicPricingEnumType,
    WeekEndDays,
} from '.';
import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';

export interface IDynamicPricing {
    id: string;
    propertyId: string;
    OccupancyBasedDynamicPricing: IOccupancyBasedDynamicPricing[];
    SeasonalDynamicPricings: ISeasonalDynamicPricing[];
    WeekendDynamicPricing: IWeekendDynamicPricing[];
}

export interface IDynamicPricingOnly {
    id: string;
    propertyId: string;
}

export interface IDynamicPricingResult {
    roomId: string;
    date: Date;
    currentInventoryPercent: number;
    pricing: IDynamicPricingBrakedown[];
    totalDynamicDiscount: number;
    currencyCode: CurrencyCode;
}

export interface IDynamicPricingBrakedown {
    discountedPrice: number;
    currencyCode: CurrencyCode;
    reason: "occupancy" | "seasonal" | "weekend";
    seasonalType: SeasonalDynamicPricingEnumType | null;
    weekDays: WeekEndDays | null;
    pricingType: "increase" | "decrease";
}