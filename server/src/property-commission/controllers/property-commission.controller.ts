import { errorResponse } from '../../utils/return';
import { CustomRequest } from '../../utils/customRequest';
import { Request, Response } from 'express';
import { PropertyCommissionService } from '../services';

export class PropertyCommissionController {
    private propertyCommissionService: PropertyCommissionService;

    constructor() {
        this.propertyCommissionService = new PropertyCommissionService();
    }

    public async createPropertyCommission(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { propertyId, commissionType, commissionValue, currencyCode } =
                req.body;

            if (
                !propertyId ||
                !commissionType ||
                commissionValue === undefined
            ) {
                return res
                    .status(400)
                    .json(errorResponse('All fields are required'));
            }

            const result =
                await this.propertyCommissionService.createPropertyCommission({
                    propertyId,
                    commissionType,
                    commissionValue,
                    currencyCode,
                });

            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to create property commission', error.message));
            }
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', 'Failed to create property commission'));
        }
    }

    public async getPropertyCommission(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { propertyId } = req.params;

            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property ID is required'));
            }

            const result =
                await this.propertyCommissionService.getPropertyCommission(propertyId);

            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to get property commission', error.message));
            }
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', 'Failed to get property commission'));
        }
    }

    public async updatePropertyCommission(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { propertyId } = req.params;
            const { commissionType, commissionValue, currencyCode } = req.body;

            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property ID is required'));
            }

            const result =
                await this.propertyCommissionService.updatePropertyCommission(
                    propertyId,
                    { commissionType, commissionValue, currencyCode }
                );

            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to update property commission', error.message));
            }
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', 'Failed to update property commission'));
        }
    }

    public async deletePropertyCommission(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { propertyId } = req.params;

            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property ID is required'));
            }

            const result =
                await this.propertyCommissionService.deletePropertyCommission(propertyId);

            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to delete property commission', error.message));
            }
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', 'Failed to delete property commission'));
        }
    }

    public async calculateCommission(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { propertyId } = req.params;
            const { subtotal } = req.body;

            if (!propertyId) {
                return res
                    .status(400)
                    .json(errorResponse('Property ID is required'));
            }

            if (subtotal === undefined || subtotal < 0) {
                return res
                    .status(400)
                    .json(errorResponse('Valid subtotal is required'));
            }

            const result =
                await this.propertyCommissionService.calculateCommissionForBooking(
                    Number(subtotal),
                    propertyId
                );

            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(errorResponse('Failed to calculate commission', error.message));
            }
            return res
                .status(500)
                .json(errorResponse('Internal Server Error', 'Failed to calculate commission'));
        }
    }
}