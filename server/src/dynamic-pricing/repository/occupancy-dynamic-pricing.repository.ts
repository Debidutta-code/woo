
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
    ICreateSpecialWeekendPricing

} from "../types";
export class DynamicPricing {
    public async createOccupancyBasedDynamicPricing(data: ICCreateOccupancyBasedDynamicPricing): Promise<ICreateOccupancyBasedDynamicPricing> {
        try {
            return await prisma.occupancyBasedPricing.create({
                data: data
            })
        } catch (error) {
            throw new Error("Failed to create occupancy based dynamic pricing")
        }
    }

}