// dao/price-update.dao.ts

import { prisma } from '../../../../config';
import { CurrencyCode } from '../../../extranet/tax-system/interfaces/tourist-tax.type';

export class PriceUpdateDao {
    public static async propertyExists(propertyCode: string): Promise<boolean> {
        try {
            const property = await prisma.property.findUnique({
                where: { propertyCode },
                select: { id: true },
            });
            return !!property;
        } catch (error) {
            throw new Error('Failed to verify property existence');
        }
    }

    public static async upsertCharge(params: {
        propertyCode: string;
        roomTypeCode: string;
        ratePlanCode: string;
        date: Date;
        currencyCode: CurrencyCode;
        baseByGuestAmounts: Array<{
            numberOfGuests: number;
            amountBeforeTax: number;
        }>;
        additionalGuestAmounts: Array<{
            ageQualifyingCode: string;
            amount: number;
        }>;
    }): Promise<void> {
        const {
            propertyCode,
            roomTypeCode,
            ratePlanCode,
            date,
            currencyCode,
            baseByGuestAmounts,
            additionalGuestAmounts,
        } = params;

        // Find existing charge for this property/room/rateplan/date
        const [existingCharge, room] = await Promise.all([
            prisma.charge.findFirst({
                where: {
                    propertyCode,
                    roomTypeCode,
                    ratePlanCode,
                    date,
                },
                select: { id: true },
            }),
            prisma.room.findFirst({
                where: {
                    roomType: roomTypeCode,
                    property: {
                        propertyCode: propertyCode,
                    },
                },
                select: { id: true },
            }),
        ]);
        if (!room) {
            throw new Error('Room Not found for charge maping');
        }
        if (existingCharge) {
            // Update existing charge — delete old price rows, insert new ones
            await prisma.$transaction([
                // Delete old base amounts
                prisma.chargeBaseByGuest.deleteMany({
                    where: { chargeId: existingCharge.id },
                }),
                // Delete old additional amounts
                prisma.chargeAdditionalGuest.deleteMany({
                    where: { chargeId: existingCharge.id },
                }),
                // Update the charge itself
                prisma.charge.update({
                    where: { id: existingCharge.id },
                    data: { currencyCode },
                }),
                // Insert new base amounts
                prisma.chargeBaseByGuest.createMany({
                    data: baseByGuestAmounts.map(bg => ({
                        chargeId: existingCharge.id,
                        numberOfGuests: bg.numberOfGuests,
                        amountBeforeTax: bg.amountBeforeTax,
                    })),
                }),
                // Insert new additional amounts
                ...(additionalGuestAmounts.length > 0
                    ? [
                          prisma.chargeAdditionalGuest.createMany({
                              data: additionalGuestAmounts.map(ag => ({
                                  chargeId: existingCharge.id,
                                  ageQualifyingCode: ag.ageQualifyingCode,
                                  amount: ag.amount,
                              })),
                          }),
                      ]
                    : []),
            ]);
        } else {
            // Create new charge with nested price rows
            await prisma.charge.create({
                data: {
                    propertyCode,
                    roomTypeCode,
                    ratePlanCode,
                    roomId: room.id,
                    ratePlanName: ratePlanCode, // fallback, RT doesn't send name
                    roomTypeName: roomTypeCode, // fallback, RT doesn't send name
                    date,
                    currencyCode,
                    baseGuestAmounts: {
                        create: baseByGuestAmounts.map(bg => ({
                            numberOfGuests: bg.numberOfGuests,
                            amountBeforeTax: bg.amountBeforeTax,
                        })),
                    },
                    additionalGuestAmounts: {
                        create: additionalGuestAmounts.map(ag => ({
                            ageQualifyingCode: ag.ageQualifyingCode,
                            amount: ag.amount,
                        })),
                    },
                },
            });
        }
    }
}
