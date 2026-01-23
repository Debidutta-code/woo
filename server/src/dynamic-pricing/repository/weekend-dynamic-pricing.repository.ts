
import { prisma } from "../../config";
import { errorResponse } from "../../utils/return";
import {
    IWeekendPricing,
    IWeekendPricingDays,
    ICreateWeekendPricing,
    ICWeekendPricingDays,
    IUWeekendPricingDays,
    PeriodType
} from "../types";
export class WeekendPricing {
    public async createWeekendPricing(data: ICreateWeekendPricing): Promise<IWeekendPricing> {
        try {
            return await prisma.weekendPricing.create({
                data: data,
                include: {
                    weekDays: true
                }
            })
        } catch (error) {
            throw new Error("Failed to create weekend pricing")
        }
    }

    public async getWeekendPricing(propertyId: string): Promise<IWeekendPricing[] | null> {
        try {
            return await prisma.weekendPricing.findMany({
                where: {
                    propertyId: propertyId
                }, include: {
                    weekDays: true
                }
            })
        } catch (error) {
            throw new Error("Failed to get weekend pricing")
        }
    }

    public async getWeekendPricingWithDetails(weekendPricingId: string): Promise<IWeekendPricing | null> {
        try {
            return await prisma.weekendPricing.findUnique({
                where: {
                    id: weekendPricingId
                },
                include: {
                    weekDays: true
                }
            })
        } catch (error) {
            throw new Error("Failed to get weekend pricing details")
        }
    }
    public async deleteWeekendPricing(weekendPricingId: string): Promise<boolean> {
        try {
            await prisma.weekendPricing.delete({
                where: {
                    id: weekendPricingId
                }
            })
            return true
        } catch (error) {
            throw new Error("Failed to delete weekend pricing")
        }
    }

    public async getWeekendPricingForRoom(propertyId: string, roomType: string): Promise<IWeekendPricing | null> {
        try {
            return await prisma.weekendPricing.findUnique({
                where: {
                    propertyId: propertyId,
                    roomType: roomType
                },
                include: {
                    weekDays: true
                }
            })
        } catch (error) {
            throw new Error("Failed to get weekend pricing for room")
        }
    }

    
}
export class WeekendDayDynamicPricingRepository {
    public async createWeekDayPricing(data: ICWeekendPricingDays): Promise<IWeekendPricingDays> {
        try {
            return await prisma.weekendDayPricing.create({
                data: data
            })
        } catch (error) {
            throw new Error("Failed to create weekend days pricing")
        }
    }

    public async updateForTotalWeekends(weekendId:string,data:IUWeekendPricingDays): Promise<boolean> {
        try {
            await prisma.weekendDayPricing.updateMany({
                where: {
                    weekendPricingId: weekendId
                },
                data: data
            })
            return true

        } catch (error) {
            throw new Error("Failed to update weekend day pricing")
        }
    }
    public async updateForASingleDay(weekendDayId:string,data:IUWeekendPricingDays): Promise<boolean> {
        try {
            await prisma.weekendDayPricing.updateMany({
                where: {
                    id: weekendDayId,
                },
                data: data
            })
            return true

        } catch (error) {
            throw new Error("Failed to update weekend day pricing")
        }
    }
    public async deleteWeekDayPricing(weekendPricingId: string): Promise<boolean> {
        try {
            await prisma.weekendDayPricing.delete({
                where: {
                    weekendPricingId: weekendPricingId
                }
            })
            return true
        } catch (error) {
            throw new Error("Failed to delete Saturday pricing")
        }
    }
}
