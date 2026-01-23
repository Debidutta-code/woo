import { prisma } from "../../config";
import {
    ICctaAndctd,
} from "../types";
export class CTAandCTDRepository {
    public async getCtaAndCtd(propertyCode: string): Promise<any> {
        try {
            const res = await prisma.charge.findMany({
                where: {
                    propertyCode,
                    OR: [
                        { isCTAApplied: true },
                        { isCTDApplied: true }
                    ]
                }
            });
            return res;
        } catch (error) {
            throw new Error("Failed to get CTA and CTD");
        }
    }
    public async addCTA({ dates, propertyCode, roomTypeCode, ratePlanCode }: ICctaAndctd): Promise<any> {
        try {
            const whereCondition: any = {
                propertyCode: propertyCode,
                
            };
            if (roomTypeCode) whereCondition.roomTypeCode = roomTypeCode;
            if (ratePlanCode) whereCondition.ratePlanCode = ratePlanCode;
            const res = await prisma.charge.updateMany({
                where: {
                    ...whereCondition,
                    date: {
                        in: dates
                    }
                },
                data: {
                    isCTAApplied: true
                }
            })
            return res;
        } catch (error) {
            throw new Error("Failed to add CTA")
        }
    }
    public async addCTD({ dates, propertyCode, roomTypeCode, ratePlanCode }: ICctaAndctd): Promise<any> {
        try {
            const whereCondition: any = {
                propertyCode: propertyCode,
                
            };
            if (roomTypeCode) whereCondition.roomTypeCode = roomTypeCode;
            if (ratePlanCode) whereCondition.ratePlanCode = ratePlanCode;
            const res = await prisma.charge.updateMany({
                where: {
                    ...whereCondition,
                    date: {
                        in: dates
                    }
                },
                data: {
                    isCTDApplied: true
                }
            })
            return res;
        } catch (error) {
            throw new Error("Failed to add CTD")
        }
    }
    public async closeCTA({ dates, propertyCode, roomTypeCode, ratePlanCode }: ICctaAndctd): Promise<any> {
        try {
            const whereCondition: any = {
                propertyCode: propertyCode,
                
            };
            if (roomTypeCode) whereCondition.roomTypeCode = roomTypeCode;
            if (ratePlanCode) whereCondition.ratePlanCode = ratePlanCode;
            const res = await prisma.charge.updateMany({
                where: {
                    ...whereCondition,
                    date: {
                        in: dates
                    }
                },
                data: {
                    isCTAApplied: false
                }
            })
            return res;
        } catch (error) {
            throw new Error("Failed to close CTA")
        }
    }
    public async closeCTD({ dates, propertyCode, roomTypeCode, ratePlanCode }: ICctaAndctd): Promise<any> {
        try {
            const whereCondition: any = {
                propertyCode: propertyCode,
                
            };
            if (roomTypeCode) whereCondition.roomTypeCode = roomTypeCode;
            if (ratePlanCode) whereCondition.ratePlanCode = ratePlanCode;
            const res = await prisma.charge.updateMany({
                where: {
                    ...whereCondition,
                    date: {
                        in: dates
                    }
                },
                data: {
                    isCTDApplied: false
                }
            })
            return res;
        } catch (error) {
            throw new Error("Failed to close CTD")
        }
    }
}