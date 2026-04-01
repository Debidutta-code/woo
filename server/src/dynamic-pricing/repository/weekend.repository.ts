import { prisma } from '../../config';
import { ICWeekendDynamicPricing, IWeekendDynamicPricing } from '../types';

export class WeekendDynamicPricingRepository {
    public async createWeekendDynamicPricing(
        data: ICWeekendDynamicPricing
    ): Promise<IWeekendDynamicPricing> {
        try {
            return await prisma.weekendDynamicPricing.create({
                data,
            });
        } catch (error) {
            throw new Error('Error creating weekend dynamic pricing');
        }
    }
    public async getWeekendDynamicPricing(
        id: string
    ): Promise<IWeekendDynamicPricing | null> {
        try {
            return await prisma.weekendDynamicPricing.findUnique({
                where: { id },
            });
        } catch (error) {
            throw new Error('Error fetching weekend dynamic pricing');
        }
    }
    public async updateWeekendDynamicPricing(
        id: string,
        data: ICWeekendDynamicPricing
    ): Promise<IWeekendDynamicPricing | null> {
        try {
            return await prisma.weekendDynamicPricing.update({
                where: { id },
                data,
            });
        } catch (error) {
            throw new Error('Error updating weekend dynamic pricing');
        }
    }
    public async deleteWeekendDynamicPricing(
        id: string
    ): Promise<IWeekendDynamicPricing | null> {
        try {
            return await prisma.weekendDynamicPricing.delete({
                where: { id },
            });
        } catch (error) {
            throw new Error('Error deleting weekend dynamic pricing');
        }
    }
    public async weekendDynamicPricingByDateRange(
        ids: string[],
        roomId: string,
        startDate: Date,
        endDate: Date
    ): Promise<IWeekendDynamicPricing[] | null> {
        try {
            return await prisma.weekendDynamicPricing.findMany({
                where: {
                    roomId,
                    id: {
                        notIn: ids,
                    },
                    startDate: {
                        gte: startDate,
                    },
                    endDate: {
                        lte: endDate,
                    },
                },
            });
        } catch (error) {
            throw new Error(
                'Error fetching weekend dynamic pricing by date range'
            );
        }
    }
    public async getByRoomId(
        roomId: string
    ): Promise<IWeekendDynamicPricing[] | null> {
        try {
            return await prisma.weekendDynamicPricing.findMany({
                where: { roomId },
            });
        } catch (error) {
            throw new Error(
                'Error fetching weekend dynamic pricing by room ID'
            );
        }
    }
}
