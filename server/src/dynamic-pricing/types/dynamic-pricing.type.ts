import { IOccupancyBasedDynamicPricing, ISeasonalDynamicPricing,ICWeekendDynamicPricing } from ".";

export interface IDynamicPricing{
    id: string;
    propertyId: string;
    OccupancyBasedDynamicPricing: IOccupancyBasedDynamicPricing[];
    SeasonalDynamicPricings: ISeasonalDynamicPricing[];
    WeekendDynamicPricing: ICWeekendDynamicPricing[];
}
export interface IDynamicPricingOnly{
    id: string;
    propertyId: string;
}