export * from "./occupancy.interface";
export * from "./seasonal.interface";
export * from "./weekend.interface";

import type { IOccupancyBasedDynamicPricing } from "./occupancy.interface";
import type { ISeasonalDynamicPricing } from "./seasonal.interface";
import type { IWeekendDynamicPricing } from "./weekend.interface";

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