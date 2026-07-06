import { prisma } from '../../config';
import {
    IPropertyCommission,
    ICreatePropertyCommission,
    IUpdatePropertyCommission,
    ICAgencyCommissionDetails,
} from '../types';

export class PropertyCommissionRepository {
    public async createPropertyCommission(
        data: ICreatePropertyCommission
    ): Promise<IPropertyCommission> {
        try {
            return await prisma.propertyCommission.create({
                data: {
                    propertyId: data.propertyId,
                    commissionType: data.commissionType as any,
                    commissionValue: data.commissionValue,
                    currencyCode: data.currencyCode || 'INR',
                },
            });
        } catch (error) {
            throw new Error('Failed to create property commission');
        }
    }

    public async getPropertyCommissionById(id: string): Promise<IPropertyCommission | null> {
        try {
            return await prisma.propertyCommission.findUnique({
                where: { id },
            });
        } catch (error) {
            throw new Error(`Failed to get property commission: ${id}`);
        }
    }

    public async getPropertyCommissionByPropertyId(
        propertyId: string
    ): Promise<IPropertyCommission | null> {
        try {
            return await prisma.propertyCommission.findUnique({
                where: { propertyId },
            });
        } catch (error) {
            throw new Error(`Failed to get property commission by property ID: ${propertyId}`);
        }
    }

    public async updatePropertyCommission(
        id: string,
        data: IUpdatePropertyCommission
    ): Promise<IPropertyCommission | null> {
        try {
            return await prisma.propertyCommission.update({
                where: { id },
                data: {
                    commissionType: data.commissionType as any,
                    commissionValue: data.commissionValue,
                    currencyCode: data.currencyCode,
                },
            });
        } catch (error) {
            throw new Error(`Failed to update property commission: ${id}`);
        }
    }

    public async deletePropertyCommission(id: string): Promise<IPropertyCommission | null> {
        try {
            return await prisma.propertyCommission.delete({
                where: { id },
            });
        } catch (error) {
            throw new Error(`Failed to delete property commission: ${id}`);
        }
    }

    public async getAgencyCommissionDetails(
        agencyId: string
    ): Promise<ICAgencyCommissionDetails | null> {
        try {
            const agency = await prisma.agency.findUnique({
                where: { id: agencyId },
                select: {
                    commissionType: true,
                    commissionValue: true,
                    commissionCurrency: true,
                },
            });

            if (!agency) {
                return null;
            }

            return {
                commissionType: agency.commissionType,
                commissionValue: agency.commissionValue,
                commissionCurrency: agency.commissionCurrency,
            };
        } catch (error) {
            throw new Error(`Failed to get agency commission details: ${agencyId}`);
        }
    }
}