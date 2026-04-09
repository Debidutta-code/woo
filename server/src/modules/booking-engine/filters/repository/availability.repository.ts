import { Charge, ChargeBaseByGuest, Inventory } from "../../../../../prisma/generated/prisma/client";
import { prisma } from "../../../../config";


export interface ChargeWithBaseAmounts extends Charge {
    baseGuestAmounts: ChargeBaseByGuest[];
}

export class AvailabilityRepository {

    async findPropertyByCode(hotelCode: string): Promise<{
        id:            string;
        propertyRooms: { roomType: string; id: string }[];
    } | null> {
        try {
            return await prisma.property.findUnique({
                where: {
                    propertyCode: hotelCode,
                    isDeleted:    false,
                    isAvailable:  true,
                },
                include: {
                    propertyRooms: {
                        where: { available: true, isDeleted: false },
                        select: { roomType: true, id: true }
                    }
                }
            });
        } catch (error) {
            console.error('Error finding property by code:', error);
            throw new Error('Failed to find property');
        }
    }

    async getInventoryByDateRange(
        hotelCode: string,
        dates:     Date[]
    ): Promise<Inventory[]> {
        try {
            return await prisma.inventory.findMany({
                where: {
                    propertyCode: hotelCode,
                    date:         { in: dates },
                },
            });
        } catch (error) {
            console.error('Error fetching inventory:', error);
            throw new Error('Failed to fetch inventory');
        }
    }

    async getRatesByDateRange(
        hotelCode: string,
        dates:     Date[]
    ): Promise<ChargeWithBaseAmounts[]> {
        try {
            return await prisma.charge.findMany({
                where: {
                    propertyCode: hotelCode,
                    date:         { in: dates },
                    isAvailable:  true,
                },
                orderBy: { date: 'asc' },
                include: {
                    baseGuestAmounts: true,
                },
            });
        } catch (error) {
            console.error('Error fetching rates:', error);
            throw new Error('Failed to fetch rates');
        }
    }
}