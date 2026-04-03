import { prisma } from '../../../../config';
import {
    ICOccupancyBasedDynamicPricing,
    IOccupancyBasedDynamicPricing,
} from '../types';
export class OccupancyBasedDynamicPricingRepository {
    public async createOccupancyBasedDynamicPricing(
        data: ICOccupancyBasedDynamicPricing
    ): Promise<IOccupancyBasedDynamicPricing> {
        try {
            return await prisma.occupancyBasedDynamicPricing.create({
                data,
            });
        } catch (error) {
            throw new Error('Error creating occupancy-based dynamic pricing');
        }
    }
    public async getOccupancyBasedDynamicPricing(
        id: string
    ): Promise<IOccupancyBasedDynamicPricing[] | null> {
        try {
            return await prisma.occupancyBasedDynamicPricing.findMany({
                where: { id },
            });
        } catch (error) {
            throw new Error('Error fetching occupancy-based dynamic pricing');
        }
    }
    public async updateOccupancyBasedDynamicPricing(
        id: string,
        data: ICOccupancyBasedDynamicPricing
    ): Promise<IOccupancyBasedDynamicPricing | null> {
        try {
            return await prisma.occupancyBasedDynamicPricing.update({
                where: { id },
                data,
            });
        } catch (error) {
            throw new Error('Error updating occupancy-based dynamic pricing');
        }
    }
    public async deleteOccupancyBasedDynamicPricing(
        id: string
    ): Promise<IOccupancyBasedDynamicPricing | null> {
        try {
            return await prisma.occupancyBasedDynamicPricing.delete({
                where: { id },
            });
        } catch (error) {
            throw new Error('Error deleting occupancy-based dynamic pricing');
        }
    }
    public async getOccupancyBasedDPByRange(
        roomId: string,
        currentInventoryPercentage: number
    ): Promise<IOccupancyBasedDynamicPricing | null> {
        try {
            return await prisma.occupancyBasedDynamicPricing.findFirst({
                where: {
                    roomId,
                    minInventoryPercentage: {
                        lte: currentInventoryPercentage,
                    },
                    maxInventoryPercentage: {
                        gte: currentInventoryPercentage,
                    },
                },
            });
        } catch (error) {
            throw new Error(
                'Error fetching occupancy-based dynamic pricing by range'
            );
        }
    }
    public async checkIfRangeExists(
        ids: string[],
        roomId: string,
        minInventoryPercentage: number,
        maxInventoryPercentage: number
    ): Promise<boolean> {
        try {
            const result = await prisma.occupancyBasedDynamicPricing.findMany({
                where: {
                    roomId,
                    id: {
                        notIn: ids,
                    },
                    minInventoryPercentage: {
                        lte: maxInventoryPercentage,
                    },
                    maxInventoryPercentage: {
                        gte: minInventoryPercentage,
                    },
                },
            });
            return result.length > 0;
        } catch (error) {
            throw new Error(
                'Error checking if occupancy-based dynamic pricing range exists'
            );
        }
    }
    public async getOccupancyBasedDynamicPricingByRoomId(
        roomId: string
    ): Promise<IOccupancyBasedDynamicPricing[]> {
        try {
            return await prisma.occupancyBasedDynamicPricing.findMany({
                where: {
                    roomId,
                },
            });
        } catch (error) {
            throw new Error(
                'Error fetching occupancy-based dynamic pricing by room ID'
            );
        }
    }
}
