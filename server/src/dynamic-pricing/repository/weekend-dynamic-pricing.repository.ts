
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
    ICreateWeekendPricing,
    ICSeasonalHolidayPricingR,
    ICWeekendPricingDays


} from "../types";
export class WeekendPricing {
    public async createWeekendPricing(data: ICreateWeekendPricing): Promise<IWeekendPricing> {
        try {
            return await prisma.weekendPricing.create({
                data: data,
                include: {
                    fridayPricing: true,
                    saturdayPricing: true,
                    sundayPricing: true,
                }
            })
        } catch (error) {
            throw new Error("Failed to create weekend pricing")
        }
    }
    public async createFridayPricing(data: ICWeekendPricingDays): Promise<IWeekendPricingDays> {
        try {
            return await prisma.weekendFridayPricing.create({
                data: data
            })
        } catch (error) {
            throw new Error("Failed to create weekend days pricing")
        }
    }
    public async createSaturdayPricing(data: ICWeekendPricingDays): Promise<IWeekendPricingDays> {
        try {
            return await prisma.weekendSaturdayPricing.create({
                data: data
            })
        } catch (error) {
            throw new Error("Failed to create weekend days pricing")
        }
    }
    public async createSundayPricing(data: ICWeekendPricingDays): Promise<IWeekendPricingDays> {
        try {
            return await prisma.weekendSunDayPricing.create({
                data: data
            })
        } catch (error) {
            throw new Error("Failed to create weekend days pricing")
        }
    }

}