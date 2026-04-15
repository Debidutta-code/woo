import { prisma } from '../../../../config';
import {
    IDynamicPricing,
    IDynamicPricingBrakedown,
    IDynamicPricingResult,
    IOccupancyBasedDynamicPricing,
    ISeasonalDynamicPricing,
    IWeekendDynamicPricing,
} from '../types';

export class DynamicPricingCalculator {
    public async calculateDynamicPricingForDateRange(
        propertyId: string,
        roomId: string,
        startDate: Date,
        endDate: Date,
        maxRoom: number,
        finalBaseAmount: number,
        currentAvailableRoom:number|null
    ): Promise<IDynamicPricingResult[]> {
        const results: IDynamicPricingResult[] = [];
        const currentDate = new Date(startDate);

        // Pricing charges in the booking engine exclude checkout date; match that behavior.
        while (currentDate < endDate) {
            const availableRooms = currentAvailableRoom?currentAvailableRoom:await this.getAvailableRooms(roomId, currentDate);
            if(!availableRooms){
                throw new Error(
                    `Failed to get available rooms for on ${currentDate}`
                );
            }
            const result = await this.calculateDynamicPricing(
                propertyId,
                roomId,
                currentDate,
                (availableRooms / maxRoom) * 100,
                finalBaseAmount
            );
            results.push(result);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return results;
    }
    private async getAvailableRooms(roomId: string, date: Date) {
     try {
        const availableRooms = await prisma.inventory.findUnique({
            where: {
                roomId_date:{
                    roomId,
                    date
                }
            },
        });
        return availableRooms?.availability;
     } catch (error) {
        throw new Error(
            `Failed to get available rooms for room ${roomId} on ${date}`
        );
     }   
    }

    private async calculateDynamicPricing(
        propertyId: string,
        roomId: string,
        date: Date,
        currentInventoryPercent: number,
        finalBaseAmount: number
    ): Promise<IDynamicPricingResult> {
        try {
            const pricing: IDynamicPricing | null =
                await prisma.dynamicPricing.findFirst({
                    where: {
                        propertyId,
                    },
                    include: {
                        OccupancyBasedDynamicPricing: {
                            where: {
                                roomId,
                                minInventoryPercentage: {
                                    lte: currentInventoryPercent,
                                },
                                maxInventoryPercentage: {
                                    gte: currentInventoryPercent,
                                },
                            },
                        },
                        SeasonalDynamicPricings: {
                            where: {
                                roomId,
                                startDate: {
                                    lte: date,
                                },
                                endDate: {
                                    gte: date,
                                },
                            },
                        },
                        WeekendDynamicPricing: {
                            where: {
                                roomId,
                                startDate: {
                                    lte: date,
                                },
                                endDate: {
                                    gte: date,
                                },
                            },
                        },
                    },
                });
            if (!pricing) {
                return {
                    roomId,
                    date,
                    currentInventoryPercent,
                    pricing: [],
                    totalDynamicDiscount: 0,
                    currencyCode: 'AED',
                };
            }

            const breakdown: IDynamicPricingBrakedown[] = [];

            const occupancyRule = this.pickBestOccupancyRule(
                pricing.OccupancyBasedDynamicPricing || []
            );
            if (occupancyRule) {
                breakdown.push(
                    await this.calculateOccupancyBasedPricing(
                        occupancyRule,
                        finalBaseAmount
                    )
                );
            }

            const seasonalRules = pricing.SeasonalDynamicPricings || [];
            if (seasonalRules.length) {
                breakdown.push(
                    ...(await this.calculateSeasonalBasedPricing(
                        seasonalRules,
                        finalBaseAmount
                    ))
                );
            }

            const weekendRules = pricing.WeekendDynamicPricing || [];
            if (weekendRules.length) {
                breakdown.push(
                    ...(await this.calculateWeekendBasedPricing(
                        weekendRules,
                        date,
                        finalBaseAmount
                    ))
                );
            }

            // Positive total means increase in price; negative total means decrease in price.
            const totalDynamicDiscount = breakdown.reduce((sum, b) => {
                const delta = Number.isFinite(b.discountedPrice)
                    ? b.discountedPrice
                    : 0;
                return b.pricingType === 'decrease' ? sum - delta : sum + delta;
            }, 0);
            const currencyCode =
                breakdown.find(b => b.currencyCode)?.currencyCode || 'AED';

            return {
                roomId,
                date,
                currentInventoryPercent,
                pricing: breakdown,
                totalDynamicDiscount,
                currencyCode,
            };
        } catch (error) {
            throw new Error(
                `Failed to calculate dynamic pricing for room ${roomId} on ${date}`
            );
        }
    }

    private pickBestOccupancyRule(
        rules: IOccupancyBasedDynamicPricing[]
    ): IOccupancyBasedDynamicPricing | null {
        if (!rules?.length) return null;
        return [...rules].sort((a, b) => {
            const ar = a.maxInventoryPercentage - a.minInventoryPercentage;
            const br = b.maxInventoryPercentage - b.minInventoryPercentage;
            return ar - br;
        })[0];
    }
    private async calculateOccupancyBasedPricing(
        occupancyBasedPricing: IOccupancyBasedDynamicPricing,
        finalBaseAmount: number
    ): Promise<IDynamicPricingBrakedown> {
        if (occupancyBasedPricing.adjustmentType === 'percentage') {
            const discountedAmount =
                finalBaseAmount * (occupancyBasedPricing.adjustmentValue / 100);
            return {
                currencyCode: occupancyBasedPricing.currencyCode || 'AED',
                discountedPrice: this.clampToCapsOccupancyPricing(
                    occupancyBasedPricing,
                    discountedAmount
                ),
                reason: 'occupancy',
                seasonalType: null,
                weekDays: null,
                pricingType: occupancyBasedPricing.pricingType,
            };
        } else {
            return {
                currencyCode: occupancyBasedPricing.currencyCode || 'AED',
                discountedPrice: this.clampToCapsOccupancyPricing(
                    occupancyBasedPricing,
                    occupancyBasedPricing.adjustmentValue
                ),
                reason: 'occupancy',
                seasonalType: null,
                weekDays: null,
                pricingType: occupancyBasedPricing.pricingType,
            };
        }
    }
    private async calculateSeasonalBasedPricing(
        seasonalPricing: ISeasonalDynamicPricing[],
        finalBaseAmount: number
    ): Promise<IDynamicPricingBrakedown[]> {
        if (!seasonalPricing?.length) return [];
        return seasonalPricing.map(rule => {
            const delta =
                rule.adjustmentType === 'percentage'
                    ? finalBaseAmount * (rule.adjustmentValue / 100)
                    : rule.adjustmentValue;
            return {
                currencyCode: rule.currencyCode || 'AED',
                discountedPrice: this.clampToCapsSeasonalPricing(rule, delta),
                reason: 'seasonal',
                seasonalType: rule.periodType,
                weekDays: null,
                pricingType: rule.pricingType,
            } satisfies IDynamicPricingBrakedown;
        });
    }
    private async calculateWeekendBasedPricing(
        weekendPricing: IWeekendDynamicPricing[],
        date: Date,
        finalBaseAmount: number
    ): Promise<IDynamicPricingBrakedown[]> {
        if (!weekendPricing?.length) return [];

        const day = this.getWeekEndDay(date);
        if (!day) return [];

        const applicable = weekendPricing.filter(w =>
            (w.weekendDays || []).includes(day)
        );
        if (!applicable.length) return [];

        return applicable.map(rule => {
            const delta =
                rule.adjustmentType === 'percentage'
                    ? finalBaseAmount * (rule.adjustmentValue / 100)
                    : rule.adjustmentValue;
            return {
                currencyCode: rule.currencyCode || 'AED',
                discountedPrice: this.clampToCapsWeekendPricing(rule, delta),
                reason: 'weekend',
                seasonalType: null,
                weekDays: day,
                pricingType: rule.pricingType,
            } satisfies IDynamicPricingBrakedown;
        });
    }

    private getWeekEndDay(date: Date): 'friday' | 'saturday' | 'sunday' | null {
        const weekday = date.getDay();
        if (weekday === 5) return 'friday';
        if (weekday === 6) return 'saturday';
        if (weekday === 0) return 'sunday';
        return null;
    }
    //clamps
    private clampToCapsOccupancyPricing(
        occupancyBasedPricing: IOccupancyBasedDynamicPricing,
        value: number
    ): number {
        let result = value;
        if (
            occupancyBasedPricing.minCap &&
            typeof occupancyBasedPricing.minCap === 'number'
        ) {
            result = Math.max(result, occupancyBasedPricing.minCap);
        }
        if (
            occupancyBasedPricing.maxCap &&
            typeof occupancyBasedPricing.maxCap === 'number'
        ) {
            result = Math.min(result, occupancyBasedPricing.maxCap);
        }
        return result;
    }
    private clampToCapsSeasonalPricing(
        seasonalPricing: ISeasonalDynamicPricing,
        value: number
    ): number {
        let result = value;
        if (
            seasonalPricing.minCap &&
            typeof seasonalPricing.minCap === 'number'
        ) {
            result = Math.max(result, seasonalPricing.minCap);
        }
        if (
            seasonalPricing.maxCap &&
            typeof seasonalPricing.maxCap === 'number'
        ) {
            result = Math.min(result, seasonalPricing.maxCap);
        }
        return result;
    }
    private clampToCapsWeekendPricing(
        weekendPricing: IWeekendDynamicPricing,
        value: number
    ): number {
        let result = value;
        if (
            weekendPricing.minCap &&
            typeof weekendPricing.minCap === 'number'
        ) {
            result = Math.max(result, weekendPricing.minCap);
        }
        if (
            weekendPricing.maxCap &&
            typeof weekendPricing.maxCap === 'number'
        ) {
            result = Math.min(result, weekendPricing.maxCap);
        }
        return result;
    }
}
