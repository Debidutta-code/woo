
import { prisma } from "../../config";
import {
    AdjustmentType,
    ICreateOccupancyBasedDynamicPricing,
    ICCreateOccupancyBasedDynamicPricing,
    ISeasonalHolidayPricing,
    IWeekendPricing,
    IWeekendPricingDays,
    PeriodType,
    OccupancyBasedAdjustmentType,
    ICreateSpecialWeekendPricing,
    ICSeasonalHolidayPricingR

} from "../types";
export class SeasonalPricing {
    public async createSeasonalPricing(data: ICSeasonalHolidayPricingR): Promise<ISeasonalHolidayPricing> {
        try {
            return await prisma.seasonalHolidayPricing.create({
                data: data
            })
        } catch (error) {
            throw new Error("Failed to create seasonal holiday pricing")
        }
    }

}