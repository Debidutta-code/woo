import { prisma } from '../../config';
import { differenceInDays } from 'date-fns';
import { successResponse, errorResponse } from '../../utils/return';
import { getPropertyCode } from '../utils';
import {
    DailyBreakdown,
    MultiRoomRateCalculationInput,
    MultiRoomRateCalculationResult,
    RoomCalculationDetail,
    RateCalculationResult,
    TaxDetail,
} from '../types';

export class RoomRentCalculationService {
    public static async getMultiRoomRentService(
        input: MultiRoomRateCalculationInput
    ): Promise<MultiRoomRateCalculationResult> {
        try {
            const { propertyId, rooms } = input;

            // Validate property
            const propertyCode = await getPropertyCode(propertyId);
            if (!propertyCode) {
                return errorResponse('Invalid property ID');
            }

            if (!rooms || rooms.length === 0) {
                return errorResponse('At least one room request is required');
            }

            const roomCalculations: RoomCalculationDetail[] = [];
            let totalAmountBeforeTax = 0;
            let totalTax = 0;
            let totalRooms = 0;

            // Process each room request
            for (const room of rooms) {
                const result = await this.getRoomRentServiceByCode(
                    propertyCode,
                    room.invTypeCode,
                    room.startDate,
                    room.endDate,
                    room.ratePlanCode,
                    room.noOfChildren,
                    room.noOfAdults,
                    room.noOfRooms
                );

                if (!result.success) {
                    return errorResponse(
                        `Error calculating rate for room type ${room.invTypeCode}, rate plan ${room.ratePlanCode}: ${result.message}`
                    );
                }

                const roomData = result.data!;

                roomCalculations.push({
                    ratePlanCode: room.ratePlanCode,
                    ratePlanName:
                        roomData.dailyBreakdown?.[0]?.ratePlanCode ||
                        room.ratePlanCode,
                    invTypeCode: room.invTypeCode,
                    roomTypeName: room.invTypeCode,
                    startDate: room.startDate.toISOString().split('T')[0],
                    endDate: room.endDate.toISOString().split('T')[0],
                    noOfRooms: room.noOfRooms,
                    noOfAdults: room.noOfAdults,
                    noOfChildren: room.noOfChildren,
                    totalAmount: roomData.totalAmount,
                    numberOfNights: roomData.numberOfNights,
                    breakdown: roomData.breakdown,
                    dailyBreakdown: roomData.dailyBreakdown,
                    tax: roomData.tax,
                    totalTax: roomData.totalTax,
                    priceAfterTax: roomData.priceAfterTax,
                });

                totalAmountBeforeTax +=
                    roomData.priceAfterTax - roomData.totalTax;
                totalTax += roomData.totalTax;
                totalRooms += room.noOfRooms;
            }

            const grandTotal = totalAmountBeforeTax + totalTax;

            return successResponse(
                'Prices calculated successfully for all rooms',
                {
                    propertyId,
                    propertyCode,
                    rooms: roomCalculations,
                    summary: {
                        totalAmountBeforeTax: Number(
                            totalAmountBeforeTax.toFixed(2)
                        ),
                        totalTax: Number(totalTax.toFixed(2)),
                        grandTotal: Number(grandTotal.toFixed(2)),
                        totalRooms,
                    },
                }
            );
        } catch (error) {
            console.error('Error in getMultiRoomRentService:', error);
            return errorResponse('Internal server error');
        }
    }

    public static async getRoomRentService(
        propertyId: string,
        invTypeCode: string,
        startDate: Date,
        endDate: Date,
        ratePlanCode: string,
        noOfChildren: number,
        noOfAdults: number,
        noOfRooms: number
    ): Promise<RateCalculationResult> {
        try {
            const propertyCode = await getPropertyCode(propertyId);
            if (!propertyCode) {
                return errorResponse('Invalid property ID');
            }

            return await this.getRoomRentServiceByCode(
                propertyCode,
                invTypeCode,
                startDate,
                endDate,
                ratePlanCode,
                noOfChildren,
                noOfAdults,
                noOfRooms
            );
        } catch (error) {
            console.error('Error in getRoomRentService:', error);
            return errorResponse('Internal server error');
        }
    }

    public static async getRoomRentServiceByCode(
        propertyCode: string,
        invTypeCode: string,
        startDate: Date,
        endDate: Date,
        ratePlanCode: string,
        noOfChildren: number,
        noOfAdults: number,
        noOfRooms: number
    ): Promise<RateCalculationResult> {
        try {
            const validationResult = this.validateInputs(
                propertyCode,
                invTypeCode,
                startDate,
                endDate,
                noOfChildren,
                noOfAdults,
                noOfRooms,
                ratePlanCode
            );
            if (!validationResult.isValid) {
                return errorResponse(
                    validationResult.message || 'Invalid input'
                );
            }

            const start = startDate;
            const end = endDate;

            const numberOfNights = differenceInDays(end, start);

            if (numberOfNights <= 0) {
                return errorResponse('End date must be after start date');
            }

            // Step 1: Get and validate rate plan (with tax group)
            const ratePlan = await prisma.ratePlan.findUnique({
                where: { ratePlanCode },
                include: {
                    taxGroup: {
                        include: {
                            taxGroupRules: {
                                include: {
                                    taxRule: true,
                                },
                            },
                        },
                    },
                },
            });

            if (!ratePlan) {
                return errorResponse('Rate plan not found');
            }
            if (!ratePlan.b2cAvailable) {
                return errorResponse(
                    `Reservation for B2c is closed for ${ratePlan.ratePlanName}`
                );
            }
            // Check min/max length of stay
            if (numberOfNights < ratePlan.minimumLenghthOfStay) {
                return errorResponse(
                    `Minimum stay of ${ratePlan.minimumLenghthOfStay} nights required for this rate plan.`
                );
            }

            if (
                ratePlan.maximumLengthOfStay &&
                numberOfNights > ratePlan.maximumLengthOfStay
            ) {
                return errorResponse(
                    `Maximum stay of ${ratePlan.maximumLengthOfStay} nights allowed for this rate plan.`
                );
            }

            // Step 2: Check inventory availability
            const inventoryCheck = await this.checkInventoryAvailability(
                propertyCode,
                invTypeCode,
                ratePlanCode,
                start,
                end,
                noOfRooms
            );

            if (!inventoryCheck.success) {
                return inventoryCheck;
            }

            // Step 3: Calculate day-by-day rates WITH TAXES
            const rateCalculation = await this.calculateDayByDayRatesWithTax(
                propertyCode,
                invTypeCode,
                ratePlanCode,
                noOfAdults,
                noOfChildren,
                noOfRooms,
                numberOfNights,
                start,
                end,
                ratePlan // Pass the rate plan with tax group
            );

            if (!rateCalculation.success) {
                return rateCalculation;
            }

            // Step 4: Aggregate taxes from all days
            const aggregatedTaxes = this.aggregateTaxesFromDailyBreakdown(
                rateCalculation.data!.dailyBreakdown
            );

            const totalTax = aggregatedTaxes.totalTax;
            const finalAmount = rateCalculation.data!.totalAmount + totalTax;

            return successResponse('Price calculated successfully', {
                totalAmount: Number(finalAmount.toFixed(2)),
                numberOfNights,
                breakdown: {
                    totalBaseAmount: Number(
                        rateCalculation.data!.breakdown.totalBaseAmount.toFixed(
                            2
                        )
                    ),
                    totalAdditionalCharges: Number(
                        rateCalculation.data!.breakdown.totalAdditionalCharges.toFixed(
                            2
                        )
                    ),
                    totalAmount: Number(finalAmount.toFixed(2)),
                    averagePerNight: Number(
                        (finalAmount / numberOfNights).toFixed(2)
                    ),
                    numberOfNights,
                },
                dailyBreakdown: rateCalculation.data!.dailyBreakdown,
                tax: aggregatedTaxes.taxDetails,
                totalTax,
                priceAfterTax: Number(finalAmount.toFixed(2)),
                availableRooms: inventoryCheck.availableRooms!,
                requestedRooms: noOfRooms,
            });
        } catch (error) {
            console.error('Error in getRoomRentServiceByCode:', error);
            return errorResponse('Internal server error');
        }
    }

    private static validateInputs(
        propertyCode: string,
        invTypeCode: string,
        startDate: Date,
        endDate: Date,
        noOfChildren: number,
        noOfAdults: number,
        noOfRooms: number,
        ratePlanCode: string
    ): { isValid: boolean; message?: string } {
        if (!propertyCode || !invTypeCode)
            return { isValid: false, message: 'Hotel and room type required' };
        if (!ratePlanCode)
            return { isValid: false, message: 'Rate plan required' };
        if (!startDate || !endDate)
            return { isValid: false, message: 'Dates required' };
        if (noOfAdults < 1)
            return { isValid: false, message: 'At least 1 adult required' };
        if (noOfChildren < 0)
            return { isValid: false, message: 'Children cannot be negative' };
        if (noOfRooms < 1)
            return { isValid: false, message: 'At least 1 room required' };
        if (startDate >= endDate)
            return {
                isValid: false,
                message: 'End date must be after start date',
            };
        return { isValid: true };
    }

    private static async checkInventoryAvailability(
        propertyCode: string,
        roomTypeCode: string,
        ratePlanCode: string,
        startDate: Date,
        endDate: Date,
        noOfRooms: number
    ): Promise<any> {
        const stayDates: string[] = [];
        const currentDate = new Date(startDate);

        while (currentDate < endDate) {
            stayDates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        console.log('Stay Dates:', stayDates);
        const inventories = await prisma.inventory.findMany({
            where: {
                propertyCode,
                roomTypeCode,
                date: { in: stayDates },
            },
        });
        console.log('Inventories:', inventories);
        if (inventories.length !== stayDates.length) {
            return errorResponse(
                'Inventory not found for all dates in the range'
            );
        }

        let minAvailability = Infinity;
        for (const inv of inventories) {
            if (!inv.ratePlans.includes(ratePlanCode)) {
                return errorResponse(
                    `Rate plan ${ratePlanCode} not available for date ${inv.date}`
                );
            }

            if (inv.availability < noOfRooms) {
                return errorResponse(
                    `Only ${inv.availability} rooms available on ${inv.date}, but ${noOfRooms} requested`
                );
            }

            minAvailability = Math.min(minAvailability, inv.availability);
        }

        return {
            success: true,
            availableRooms: minAvailability,
        };
    }

    /**
     * NEW METHOD: Calculate day-by-day rates WITH TAX CALCULATIONS
     * This calculates taxes for each day individually
     */
    private static async calculateDayByDayRatesWithTax(
        propertyCode: string,
        roomTypeCode: string,
        ratePlanCode: string,
        noOfAdults: number,
        noOfChildren: number,
        noOfRooms: number,
        numberOfNights: number,
        startDate: Date,
        endDate: Date,
        ratePlan: any // Rate plan with tax group information
    ): Promise<any> {
        try {
            const dailyBreakdown: DailyBreakdown[] = [];
            let totalAmount = 0;
            let totalBaseAmount = 0;
            let totalAdditionalCharges = 0;

            // Generate stay dates (exclude checkout day)
            const stayDates: Date[] = [];
            const currentDate = new Date(startDate);
            const endDateCheck = new Date(endDate);

            while (currentDate < endDateCheck) {
                stayDates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }

            for (const date of stayDates) {
                const dayOfWeek = this.getDayOfWeek(date);
                const dateStr = date.toISOString().split('T')[0];

                // Get charge for this date
                const startOfDateUTC = new Date(dateStr + 'T00:00:00.000Z');
                const endOfDateUTC = new Date(dateStr + 'T23:59:59.999Z');

                const charge = await prisma.charge.findFirst({
                    where: {
                        propertyCode,
                        roomTypeCode,
                        ratePlanCode,
                        date: {
                            gte: startOfDateUTC,
                            lte: endOfDateUTC,
                        },
                        isSaleStopped: false,
                    },
                    include: {
                        baseGuestAmounts: true,
                        additionalGuestAmounts: true,
                    },
                });

                if (!charge) {
                    return errorResponse(`No rates found for date: ${dateStr}`);
                }

                // Check day-of-week applicability
                const dayApplicable = this.isDayApplicable(charge, dayOfWeek);
                if (!dayApplicable) {
                    return errorResponse(
                        `Rate plan not applicable for ${dayOfWeek} on ${dateStr}`
                    );
                }

                // Calculate rate for this day
                const rateCalculation = this.calculateSingleDayRate(
                    charge,
                    noOfAdults,
                    noOfChildren,
                    noOfRooms
                );

                if (!rateCalculation.success) {
                    return rateCalculation;
                }

                // Calculate tax for this day (using base amount only)
                const dailyBaseAmount =
                    rateCalculation.baseRatePerRoom * noOfRooms;
                const dailyTaxCalculation = await this.calculateDailyTax(
                    ratePlan,
                    dailyBaseAmount
                );

                // Calculate total with tax for this day
                const totalWithTax =
                    rateCalculation.totalAmountForDay +
                    dailyTaxCalculation.totalTax;

                dailyBreakdown.push({
                    date: dateStr,
                    dayOfWeek,
                    ratePlanCode,
                    baseRate: rateCalculation.baseRatePerRoom,
                    additionalCharges: rateCalculation.additionalGuestCharges,
                    totalPerRoom: rateCalculation.totalPerRoom,
                    totalForAllRooms: rateCalculation.totalAmountForDay,
                    currencyCode: 'INR',
                    taxDetails: dailyTaxCalculation.taxDetails,
                    totalTax: dailyTaxCalculation.totalTax,
                    totalWithTax: Number(totalWithTax.toFixed(2)),
                    breakdown: rateCalculation.breakdown,
                });

                totalAmount += rateCalculation.totalAmountForDay;
                totalBaseAmount += rateCalculation.baseRatePerRoom * noOfRooms;
                totalAdditionalCharges +=
                    rateCalculation.additionalGuestCharges * noOfRooms;
            }

            const averageBaseRate =
                numberOfNights > 0
                    ? totalBaseAmount / numberOfNights / noOfRooms
                    : 0;

            return {
                success: true,
                data: {
                    totalAmount,
                    numberOfNights,
                    baseRatePerNight: averageBaseRate,
                    additionalGuestCharges:
                        numberOfNights > 0
                            ? totalAdditionalCharges / numberOfNights
                            : 0,
                    breakdown: {
                        totalBaseAmount,
                        totalAdditionalCharges,
                        totalAmount,
                        numberOfNights,
                        averagePerNight:
                            numberOfNights > 0
                                ? totalAmount / numberOfNights
                                : 0,
                    },
                    dailyBreakdown,
                    availableRooms: 0,
                    requestedRooms: 0,
                },
            };
        } catch (error) {
            console.error('Error in calculateDayByDayRatesWithTax:', error);
            return errorResponse('Error calculating day-by-day rates with tax');
        }
    }

    private static getDayOfWeek(date: Date): string {
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        return days[date.getDay()];
    }

    private static isDayApplicable(charge: any, dayOfWeek: string): boolean {
        const dayMap: { [key: string]: string } = {
            mon: 'monApplicable',
            tue: 'tueApplicable',
            wed: 'wedApplicable',
            thu: 'thuApplicable',
            fri: 'friApplicable',
            sat: 'satApplicable',
            sun: 'sunApplicable',
        };

        const field = dayMap[dayOfWeek];
        return charge[field] === true;
    }

    private static calculateSingleDayRate(
        charge: any,
        noOfAdults: number,
        noOfChildren: number,
        noOfRooms: number
    ): any {
        try {
            const totalGuests = noOfAdults + noOfChildren;
            const baseGuestAmounts = charge.baseGuestAmounts || [];

            if (baseGuestAmounts.length === 0) {
                return errorResponse(
                    'No base guest amounts found for this rate'
                );
            }

            // Sort by numberOfGuests ascending
            const sortedBaseRates = baseGuestAmounts.sort(
                (a: any, b: any) => a.numberOfGuests - b.numberOfGuests
            );

            // Find base rate
            let selectedBaseRate = sortedBaseRates.find(
                (rate: any) => rate.numberOfGuests >= totalGuests
            );

            if (!selectedBaseRate) {
                selectedBaseRate = sortedBaseRates[sortedBaseRates.length - 1];
            }

            const baseRatePerRoom = Number(selectedBaseRate.amountBeforeTax);
            const baseGuestsIncluded = selectedBaseRate.numberOfGuests;

            // Calculate guests covered by base rate
            const totalGuestsCoveredByBase = baseGuestsIncluded * noOfRooms;
            const adultsInBaseRate = Math.min(
                noOfAdults,
                totalGuestsCoveredByBase
            );
            const remainingBaseCapacity =
                totalGuestsCoveredByBase - adultsInBaseRate;
            const childrenInBaseRate = Math.min(
                noOfChildren,
                remainingBaseCapacity
            );

            // Calculate remaining guests
            const adultsNotInBaseRate = noOfAdults - adultsInBaseRate;
            const childrenNotInBaseRate = noOfChildren - childrenInBaseRate;

            // Get additional guest rates
            const additionalGuestAmounts = charge.additionalGuestAmounts || [];
            const adultRate = additionalGuestAmounts.find(
                (aga: any) => aga.ageQualifyingCode === '10'
            );
            const childRate = additionalGuestAmounts.find(
                (aga: any) => aga.ageQualifyingCode === '8'
            );

            // Calculate additional charges for adults
            let additionalAdultCharges = 0;
            let adultChargesBreakdown: any[] = [];

            if (adultsNotInBaseRate > 0 && adultRate) {
                const chargeAmount = Number(adultRate.amount);
                additionalAdultCharges = adultsNotInBaseRate * chargeAmount;

                for (let i = 0; i < adultsNotInBaseRate; i++) {
                    adultChargesBreakdown.push({
                        adultIndex: adultsInBaseRate + i + 1,
                        ageQualifyingCode: '10',
                        chargeAmount,
                        note: 'Additional adult charge - not covered by base rate',
                    });
                }
            }

            // Calculate additional charges for children
            let additionalChildrenCharges = 0;
            let childrenChargesBreakdown: any[] = [];

            if (childrenNotInBaseRate > 0 && childRate) {
                const chargeAmount = Number(childRate.amount);
                additionalChildrenCharges =
                    childrenNotInBaseRate * chargeAmount;

                for (let i = 0; i < childrenNotInBaseRate; i++) {
                    childrenChargesBreakdown.push({
                        childIndex: childrenInBaseRate + i + 1,
                        ageQualifyingCode: '8',
                        chargeAmount,
                        note: 'Additional child charge - not covered by base rate',
                    });
                }
            }

            // Add charges for children covered by base rate
            for (let i = 0; i < childrenInBaseRate; i++) {
                childrenChargesBreakdown.push({
                    childIndex: i + 1,
                    ageQualifyingCode: '8',
                    chargeAmount: 0,
                    note: 'Covered by base rate',
                });
            }

            // Calculate totals
            const totalAdditionalChargesPerRoom =
                (additionalAdultCharges + additionalChildrenCharges) /
                noOfRooms;
            const totalPerRoom =
                baseRatePerRoom + totalAdditionalChargesPerRoom;
            const totalAmountForDay = totalPerRoom * noOfRooms;

            return {
                success: true,
                baseRatePerRoom,
                additionalGuestCharges: totalAdditionalChargesPerRoom,
                totalPerRoom,
                totalAmountForDay,
                breakdown: {
                    baseAmount: baseRatePerRoom,
                    additionalAdultCharges,
                    additionalChildrenCharges,
                    totalAdditionalCharges:
                        additionalAdultCharges + additionalChildrenCharges,
                    baseGuestsIncluded,
                    adultsInBaseRate,
                    childrenInBaseRate,
                    adultsNotInBaseRate,
                    childrenNotInBaseRate,
                    adultChargesDetail: adultChargesBreakdown,
                    childrenChargesDetail: childrenChargesBreakdown,
                },
            };
        } catch (error) {
            console.error('Error in calculateSingleDayRate:', error);
            return errorResponse('Error calculating single day rate');
        }
    }

    private static async calculateDailyTax(
        ratePlan: any,
        baseAmount: number
    ): Promise<any> {
        try {
            const taxDetails: TaxDetail[] = [];
            let totalTax = 0;

            if (!ratePlan.taxGroup || !ratePlan.taxGroup.taxGroupRules) {
                return { taxDetails: [], totalTax: 0 };
            }

            const sortedRules = ratePlan.taxGroup.taxGroupRules.sort(
                (a: any, b: any) => a.taxRule.priority - b.taxRule.priority
            );

            let applicableAmount = baseAmount;

            for (const rule of sortedRules) {
                const taxRule = rule.taxRule;

                // Check if tax is currently valid
                const now = new Date();
                if (
                    now < new Date(taxRule.validFrom) ||
                    now > new Date(taxRule.validTo)
                ) {
                    continue;
                }

                let taxAmount = 0;

                // Calculate tax based on type
                if (taxRule.type === 'percentage') {
                    taxAmount = (applicableAmount * taxRule.value) / 100;
                } else if (taxRule.type === 'fixed') {
                    taxAmount = taxRule.value;
                }

                taxDetails.push({
                    name: taxRule.name,
                    amount: Number(taxAmount.toFixed(2)),
                    type: taxRule.type,
                    priority: taxRule.priority,
                    isInclusive: taxRule.isInclusive,
                });

                totalTax += taxAmount;

                // COMPOUND TAX LOGIC:
                // If not inclusive, add the tax to the base for next tax calculation
                // This creates a compound effect where later taxes are calculated on base + previous taxes
                if (!taxRule.isInclusive) {
                    applicableAmount += taxAmount;
                }
            }

            return {
                taxDetails,
                totalTax: Number(totalTax.toFixed(2)),
            };
        } catch (error) {
            console.error('Error in calculateDailyTax:', error);
            return { taxDetails: [], totalTax: 0 };
        }
    }

    /**
     * NEW METHOD: Aggregate taxes from all daily breakdowns
     * This sums up all taxes across all days to get total tax breakdown
     */
    private static aggregateTaxesFromDailyBreakdown(
        dailyBreakdowns: DailyBreakdown[]
    ): { taxDetails: TaxDetail[]; totalTax: number } {
        const taxMap = new Map<string, TaxDetail>();
        let totalTax = 0;

        // Aggregate taxes by name
        for (const daily of dailyBreakdowns) {
            for (const tax of daily.taxDetails) {
                const existingTax = taxMap.get(tax.name);

                if (existingTax) {
                    // Add to existing tax amount
                    existingTax.amount = Number(
                        (existingTax.amount + tax.amount).toFixed(2)
                    );
                } else {
                    // Create new entry
                    taxMap.set(tax.name, {
                        name: tax.name,
                        amount: tax.amount,
                        type: tax.type,
                        priority: tax.priority,
                        isInclusive: tax.isInclusive,
                    });
                }

                totalTax += tax.amount;
            }
        }

        // Convert map to array and sort by priority
        const taxDetails = Array.from(taxMap.values()).sort(
            (a, b) => (a.priority || 0) - (b.priority || 0)
        );

        return {
            taxDetails,
            totalTax: Number(totalTax.toFixed(2)),
        };
    }
}
