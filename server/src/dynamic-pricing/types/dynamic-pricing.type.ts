import { IOccupancyBasedDynamicPricing, ISeasonalDynamicPricing,IWeekendDynamicPricing } from ".";

export interface IDynamicPricing{
    id: string;
    propertyId: string;
    OccupancyBasedDynamicPricing: IOccupancyBasedDynamicPricing[];
    SeasonalDynamicPricings: ISeasonalDynamicPricing[];
    WeekendDynamicPricing: IWeekendDynamicPricing[];
}
export interface IDynamicPricingOnly{
    id: string;
    propertyId: string;
}