import { prisma } from '../../config';
import { IDynamicPricing, IDynamicPricingOnly } from '../types';

export class DynamicPricing {
    public async getDynamicPricing(
        propertyId: string
    ): Promise<IDynamicPricing | null> {
        try {
            return await prisma.dynamicPricing.findUnique({
                where: { propertyId },
                include: {
                    OccupancyBasedDynamicPricing: true,
                    SeasonalDynamicPricings: true,
                    WeekendDynamicPricing: true,
                },
            });
        } catch (error) {
            throw new Error('Error fetching dynamic pricing');
        }
    }
    public async getById(id: string): Promise<IDynamicPricing | null> {
        try {
            return await prisma.dynamicPricing.findUnique({
                where: { id },
                include: {
                    OccupancyBasedDynamicPricing: true,
                    SeasonalDynamicPricings: true,
                    WeekendDynamicPricing: true,
                },
            });
        } catch (error) {
            throw new Error('Error fetching dynamic pricing');
        }
    }
    public async getDynamicPricingByIdCO(
        id: string
    ): Promise<IDynamicPricingOnly | null> {
        try {
            return await prisma.dynamicPricing.findFirst({
                where: { id },
            });
        } catch (error) {
            throw new Error('Error fetching dynamic pricing');
        }
    }
    public async getDynamicPricingByPropertyIdCo(
        propertyId: string
    ): Promise<IDynamicPricingOnly | null> {
        try {
            return await prisma.dynamicPricing.findFirst({
                where: { propertyId },
            });
        } catch (error) {
            throw new Error('Error fetching dynamic pricing');
        }
    }
}
