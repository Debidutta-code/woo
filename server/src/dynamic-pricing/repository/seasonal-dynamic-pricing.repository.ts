
import { prisma } from "../../config";
import {
    ISeasonalHolidayPricing,
    ICSeasonalHolidayPricingR,
    PeriodType,
    IUSeasonalHolidayPricingR
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
    public async getSeasonalPricing(propertyId: string): Promise<ISeasonalHolidayPricing[] | null> {
        try {
            return await prisma.seasonalHolidayPricing.findMany({
                where: {
                    propertyId: propertyId
                }
            })
        } catch (error) {
            throw new Error("Failed to get seasonal holiday pricing")
        }
    }
    public async updateSeasonalPricing(id: string, data: IUSeasonalHolidayPricingR): Promise<ISeasonalHolidayPricing | null> {
        try {
            return await prisma.seasonalHolidayPricing.update({
                where: {
                    id: id
                },
                data: data
            })
        } catch (error) {
            throw new Error("Failed to update seasonal holiday pricing")
        }
    }
    public async deleteSeasonalPricing(id: string): Promise<boolean> {
        try {
            await prisma.seasonalHolidayPricing.delete({
                where: {
                    id: id
                }
            })
            return true
        } catch (error) {
            throw new Error("Failed to delete seasonal holiday pricing")
        }
    }
    public async getSeasonalPricingForRooms(propertyId:string,roomType:string):Promise<ISeasonalHolidayPricing[]|null>{
        try {
            return await prisma.seasonalHolidayPricing.findMany({
                where:{
                    propertyId:propertyId,
                    roomType:roomType
                }
            })
        } catch (error) {
            throw new Error("Failed to get seasonal holiday pricing for rooms")
        }
    }
    public async getSeasonalPricingForReservations(propertyId:string,roomType:string,startDate:Date,endDate:Date):Promise<ISeasonalHolidayPricing[]|null>{
        try {
            return await prisma.seasonalHolidayPricing.findMany({
                where:{
                    propertyId:propertyId,
                    roomType:roomType,
                    startDate:{
                        gte:startDate // debug needs here
                    },
                    endDate:{
                        lt:endDate //debug needs here
                    }
                }
            })
        } catch (error) {
            throw new Error("Failed to get seasonal holiday pricing for room")
        }
    }
    public async getSeasonalPriceForRoom(propertyId: string, roomId: string,type:PeriodType): Promise<ISeasonalHolidayPricing[] | null> {
        try {
            return await prisma.seasonalHolidayPricing.findMany({
                where: {
                    propertyId: propertyId,
                    roomId: roomId,
                    periodType: type
                }
            })
        } catch (error) {
            throw new Error("Failed to get seasonal holiday pricing for room")
        }
    }
    public async getSeasonalPriceForId(id: string): Promise<ISeasonalHolidayPricing | null> {
        try {
            return await prisma.seasonalHolidayPricing.findUnique({
                where: {
                    id: id
                }
            })
        } catch (error) {
            throw new Error("Failed to get seasonal holiday pricing for id")
        }
    }

}