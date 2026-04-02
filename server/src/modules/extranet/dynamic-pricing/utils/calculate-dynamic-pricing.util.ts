import { prisma } from "../../../../config"
import { IDynamicPricing, IDynamicPricingBrakedown, IDynamicPricingResult, IOccupancyBasedDynamicPricing, ISeasonalDynamicPricing, IWeekendDynamicPricing } from "../types";

export const calculateDynamicPricing = async (
    propertyId: string,
    roomId: string,
    date: Date,
    currentInventoryPercent: number
): Promise<IDynamicPricingResult> => {
    try {
        const pricing: IDynamicPricing | null = await prisma.dynamicPricing.findFirst({
            where: {
                propertyId,

            },
            include: {
                OccupancyBasedDynamicPricing: {
                    where: {
                        roomId,
                        minInventoryPercentage: {
                            gte: currentInventoryPercent
                        },
                        maxInventoryPercentage: {
                            lte: currentInventoryPercent
                        }
                    }


                },
                SeasonalDynamicPricings: {
                    where: {
                        roomId,
                        startDate: {
                            gte: date
                        },
                        endDate: {
                            lte: date
                        }
                    }
                },
                WeekendDynamicPricing: {
                    where: {
                        roomId,
                        startDate: {
                            gte: date
                        },
                        endDate: {
                            lte: date
                        }
                    }
                }
            }

        });
        if (!pricing) return {
            roomId,
            date,
            currentInventoryPercent,
            pricing: [],
            totalDynamicDiscount: 0,
            currencyCode: "AED"
        };
        return {
            roomId,
            date,
            currentInventoryPercent,
            pricing: [],
            totalDynamicDiscount: 0,
            currencyCode: "AED"
        };
    } catch (error) {
        throw new Error(`Failed to calculate dynamic pricing for room ${roomId} on ${date}`);
    }
}
const calculateOccupancyBasedPricing =
    async (
        occupancyBasedPricing: IOccupancyBasedDynamicPricing,
        currentInventoryPercentage: number,
        finalBaseAmount: number,
    ): Promise<IDynamicPricingBrakedown> => {
        const clampToCaps = (value: number) => {
            let result = value;
            if (occupancyBasedPricing.minCap && typeof occupancyBasedPricing.minCap === "number") {
                result = Math.max(result, occupancyBasedPricing.minCap);
            }
            if (occupancyBasedPricing.maxCap && typeof occupancyBasedPricing.maxCap === "number") {
                result = Math.min(result, occupancyBasedPricing.maxCap);
            }
            return result;
        };

        if (occupancyBasedPricing.adjustmentType === "percentage") {
            const discountedAmount =
                finalBaseAmount * (occupancyBasedPricing.adjustmentValue / 100);
            return {
                currencyCode: occupancyBasedPricing.currencyCode || "AED",
                discountedPrice: clampToCaps(discountedAmount),
                reason: "occupancy",
                seasonalType: null,
                weekDays: null,
                pricingType: occupancyBasedPricing.pricingType
            }
        } else {
            return {
                currencyCode: occupancyBasedPricing.currencyCode || "AED",
                discountedPrice: clampToCaps(occupancyBasedPricing.adjustmentValue),
                reason: "occupancy",
                seasonalType: null,
                weekDays: null,
                pricingType: occupancyBasedPricing.pricingType
            }
        }

    };
const calculateSeasonalPricing =
    async (seasonalPricing: ISeasonalDynamicPricing,
        finalBaseAmount: number
    ): Promise<IDynamicPricingBrakedown[]> => {
        return [];
    };
const calculateWeekendPricing =
    async (weekendPricing: IWeekendDynamicPricing,
        finalBaseAmount: number
    ): Promise<IDynamicPricingBrakedown[]> => {
        return [];
    };