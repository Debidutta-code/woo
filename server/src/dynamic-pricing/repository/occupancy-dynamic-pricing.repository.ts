
import { prisma } from "../../config";
import {
    AdjustmentType,
    IOccupancyBasedDynamicPricing,
    ICCreateOccupancyBasedDynamicPricing,
    IUpdateOccupancyBasedDynamicPricing,
    ISeasonalHolidayPricing,
    IWeekendPricing,
    IWeekendPricingDays,
    PeriodType,
    OccupancyBasedAdjustmentType,

} from "../types";
export class OccupancyBasedDynamicPricing {
    public async createOccupancyBasedDynamicPricing(data: ICCreateOccupancyBasedDynamicPricing): Promise<IOccupancyBasedDynamicPricing> {
        try {
            return await prisma.occupancyBasedPricing.create({
                data: data
            })
        } catch (error) {
            throw new Error("Failed to create occupancy based dynamic pricing")
        }
    }
    public async getOccupancyBasedDynamicPricing(propertyId: string): Promise<IOccupancyBasedDynamicPricing[] | null> {
        try {
            return await prisma.occupancyBasedPricing.findMany({
                where: {
                    propertyId: propertyId
                }
            })
        } catch (error) {
            throw new Error("Failed to get occupancy based dynamic pricing")
        }
    }
    public async updateOccupancyBasedDynamicPricing(id: string, data: IUpdateOccupancyBasedDynamicPricing): Promise<IOccupancyBasedDynamicPricing | null> {
        try {
            return await prisma.occupancyBasedPricing.update({
                where: {
                    id: id
                },
                data: data
            })
        } catch (error) {
            throw new Error("Failed to update occupancy based dynamic pricing")
        }
    }
    public async deleteOccupancyBasedDynamicPricing(id: string): Promise<boolean> {
        try {
            await prisma.occupancyBasedPricing.delete({
                where: {
                    id: id
                }
            })
            return true
        } catch (error) {
            throw new Error("Failed to delete occupancy based dynamic pricing")
        }
    }
    public async getOccupancyBasedDynamicPricingForRooms(propertyId:string,roomType:string):Promise<IOccupancyBasedDynamicPricing[]|null>{
        try {
            return await prisma.occupancyBasedPricing.findMany({
                where:{
                    propertyId:propertyId,
                    roomType:roomType
                }
            })
        } catch (error) {
            throw new Error("Failed to get occupancy based dynamic pricing for rooms")
        }
    }
    public async getOccupancyBasedDynamicPricingByRange(propertyId:string,roomType:string,maxOccupany:number,minOccupancy:number):Promise<IOccupancyBasedDynamicPricing[]|null>{
        try {
            return await prisma.occupancyBasedPricing.findMany({
                where:{
                    propertyId:propertyId,
                    roomType:roomType,
                    OR:[
                        {minimumOccupancyPercentage: { gte: minOccupancy }},
                        {maximumOccupancyPercentage: { lte: maxOccupany }}
                    ]
                }
            })
        } catch (error) {
            throw new Error("Failed to get occupancy based dynamic pricing by range")
        }
    }
    public async getOccupancyBasedDynamicPricingById(id: string): Promise<IOccupancyBasedDynamicPricing | null> {
        try {
            return await prisma.occupancyBasedPricing.findUnique({
                where: {
                    id: id
                }
            })
        } catch (error) {
            throw new Error("Failed to get occupancy based dynamic pricing by ID")
        }
    }
}