import {
    successResponse,
    errorResponse,
} from '../../utils/return';
import { IApiResponse } from '../../utils/return.types';
import { PropertyCommissionRepository } from '../repository';
import {
    ICreatePropertyCommission,
    IUpdatePropertyCommission,
    ICommissionResult,
} from '../types';
import { CommissionCalculator } from '../utils/calculate-commission.util';

export class PropertyCommissionService {
    private propertyCommissionRepository: PropertyCommissionRepository;

    constructor() {
        this.propertyCommissionRepository = new PropertyCommissionRepository();
    }

    public async createPropertyCommission(
        data: ICreatePropertyCommission
    ): Promise<IApiResponse> {
        try {
            const validation = CommissionCalculator.validateCommissionConfig({
                commissionType: data.commissionType,
                commissionValue: data.commissionValue,
            });

            if (!validation.isValid) {
                return errorResponse(validation.errors.join(', '));
            }

            const existingCommission =
                await this.propertyCommissionRepository.getPropertyCommissionByPropertyId(
                    data.propertyId
                );

            if (existingCommission) {
                return errorResponse(
                    'Property commission already exists for this property'
                );
            }

            const commission =
                await this.propertyCommissionRepository.createPropertyCommission(data);

            return successResponse(
                'Property commission created successfully',
                commission
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to create property commission',
                    error.message
                );
            }
            return errorResponse('Failed to create property commission');
        }
    }

    public async getPropertyCommission(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const commission =
                await this.propertyCommissionRepository.getPropertyCommissionByPropertyId(
                    propertyId
                );

            if (!commission) {
                return errorResponse('Property commission not found');
            }

            return successResponse(
                'Property commission retrieved successfully',
                commission
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to get property commission',
                    error.message
                );
            }
            return errorResponse('Failed to get property commission');
        }
    }

    public async updatePropertyCommission(
        propertyId: string,
        data: IUpdatePropertyCommission
    ): Promise<IApiResponse> {
        try {
            const existingCommission =
                await this.propertyCommissionRepository.getPropertyCommissionByPropertyId(
                    propertyId
                );

            if (!existingCommission) {
                return errorResponse('Property commission not found');
            }

            if (data.commissionType || data.commissionValue !== undefined) {
                const validation = CommissionCalculator.validateCommissionConfig({
                    commissionType: data.commissionType || existingCommission.commissionType,
                    commissionValue: data.commissionValue !== undefined
                        ? data.commissionValue
                        : existingCommission.commissionValue,
                });

                if (!validation.isValid) {
                    return errorResponse(validation.errors.join(', '));
                }
            }

            const commission =
                await this.propertyCommissionRepository.updatePropertyCommission(
                    existingCommission.id,
                    data
                );

            return successResponse(
                'Property commission updated successfully',
                commission
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update property commission',
                    error.message
                );
            }
            return errorResponse('Failed to update property commission');
        }
    }

    public async deletePropertyCommission(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const existingCommission =
                await this.propertyCommissionRepository.getPropertyCommissionByPropertyId(
                    propertyId
                );

            if (!existingCommission) {
                return errorResponse('Property commission not found');
            }

            const commission =
                await this.propertyCommissionRepository.deletePropertyCommission(
                    existingCommission.id
                );

            return successResponse(
                'Property commission deleted successfully',
                commission
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to delete property commission',
                    error.message
                );
            }
            return errorResponse('Failed to delete property commission');
        }
    }

    public async calculateCommissionForBooking(
        subtotal: number,
        propertyId: string
    ): Promise<IApiResponse<ICommissionResult>> {
        try {
            const commission =
                await this.propertyCommissionRepository.getPropertyCommissionByPropertyId(
                    propertyId
                );

            if (!commission) {
                return errorResponse('Property commission not found');
            }

            const commissionResult = CommissionCalculator.calculate(
                subtotal,
                commission.commissionType,
                commission.commissionValue,
                commission.currencyCode || 'INR'
            );

            return successResponse(
                'Commission calculated successfully',
                commissionResult
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to calculate commission',
                    error.message
                );
            }
            return errorResponse('Failed to calculate commission');
        }
    }
}