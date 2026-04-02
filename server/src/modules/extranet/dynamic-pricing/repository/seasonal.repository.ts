import { prisma } from '../../../../config';
import { ICSeasonalDynamicPricing, ISeasonalDynamicPricing, SeasonalDynamicPricingEnumType } from '../types';

export class SeasonalDynamicPricingRepository {
    public async createSeasonalDynamicPricing(
        data: ICSeasonalDynamicPricing
    ): Promise<ISeasonalDynamicPricing> {
        try {
            return await prisma.seasonalDynamicPricing.create({
                data,
            });
        } catch (error) {
            throw new Error('Error creating seasonal dynamic pricing');
        }
    }
    public async getSeasonalDynamicPricing(
        id: string
    ): Promise<ISeasonalDynamicPricing | null> {
        try {
            return await prisma.seasonalDynamicPricing.findUnique({
                where: { id },
            });
        } catch (error) {
            throw new Error('Error fetching seasonal dynamic pricing');
        }
    }
    public async updateSeasonalDynamicPricing(
        id: string,
        data: ICSeasonalDynamicPricing
    ): Promise<ISeasonalDynamicPricing | null> {
        try {
            return await prisma.seasonalDynamicPricing.update({
                where: { id },
                data,
            });
        } catch (error) {
            throw new Error('Error updating seasonal dynamic pricing');
        }
    }
    public async deleteSeasonalDynamicPricing(
        id: string
    ): Promise<ISeasonalDynamicPricing | null> {
        try {
            return await prisma.seasonalDynamicPricing.delete({
                where: { id },
            });
        } catch (error) {
            throw new Error('Error deleting seasonal dynamic pricing');
        }
    }
    public async seasonalDynamicPricingByDateRange(
        seasonalType: SeasonalDynamicPricingEnumType,
        roomId: string,
        startDate: Date,
        endDate: Date
    ): Promise<ISeasonalDynamicPricing[] | null> {
        try {
            return await prisma.seasonalDynamicPricing.findMany({
                where: {
                    roomId,
                    periodType: seasonalType,
                    startDate: {
                        lte: endDate,
                    },
                    endDate: {
                        gte: startDate,
                    },
                },
            });
        } catch (error) {
            throw new Error(
                'Error fetching seasonal dynamic pricing by date range'
            );
        }
    }
    public async getSeasonalDynamicPricingByRoomId(
        roomId: string
    ): Promise<ISeasonalDynamicPricing[] | null> {
        try {
            return await prisma.seasonalDynamicPricing.findMany({
                where: { roomId },
            });
        } catch (error) {
            throw new Error(
                'Error fetching seasonal dynamic pricing by room ID'
            );
        }
    }
}
