import { CustomRequest, PropertyCustomRequest } from '../../utils';
import { Response } from 'express';
import { IApiResponse, errorResponse } from '../../utils';
import { OccupancyBasedDynamicPricingService } from '../services';
import {
    ICOccupancyBasedDynamicPricing,
    ICOccupancyBasedDynamicPricingS,
} from '../types';

export class OccupancyController {
    private occupancyService: OccupancyBasedDynamicPricingService;

    constructor() {
        this.occupancyService = new OccupancyBasedDynamicPricingService();
    }
    public async createOccupancy(
        req: PropertyCustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const occupancyData: ICOccupancyBasedDynamicPricingS = req.body;
            if (!occupancyData) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid data for occupancy based dynamic pricing',
                            'Invalid request body'
                        )
                    );
            }
            if (
                occupancyData.maxInventoryPercentage <
                    occupancyData.minInventoryPercentage ||
                occupancyData.maxInventoryPercentage > 100 ||
                occupancyData.minInventoryPercentage < 0
            ) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid inventory range',
                            'Max inventory percentage must be greater than min inventory percentage'
                        )
                    );
            }
            const propertyId = req.property?.id;
            if (!propertyId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid property ID',
                            'No property identifier provided'
                        )
                    );
            }
            const response =
                await this.occupancyService.createOccupancyBasedDynamicPricing(
                    propertyId,
                    occupancyData
                );
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create occupancy',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to create occupancy'));
        }
    }
    public async getOccupancyByRoomId(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const roomId: string = req.params.roomId;
            if (!roomId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'No Room identifier provided',
                            'No room identifier provided'
                        )
                    );
            }
            const response =
                await this.occupancyService.getDynamicPricingByRoomId(roomId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch occupancy',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to fetch occupancy'));
        }
    }
    public async updateOccupancy(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const occupancyData: ICOccupancyBasedDynamicPricing = req.body;
            if (!occupancyData) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid data for occupancy based dynamic pricing',
                            'Invalid request body'
                        )
                    );
            }
            const id: string = req.params.id;
            if (!id) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'No Room identifier provided',
                            'No room identifier provided'
                        )
                    );
            }
            const response = await this.occupancyService.updateDynamicPricing(
                id,
                occupancyData
            );
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update occupancy',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to update occupancy'));
        }
    }
    public async deleteOccupancy(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const id: string = req.params.id;
            if (!id) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'No Room identifier provided',
                            'No room identifier provided'
                        )
                    );
            }
            const response =
                await this.occupancyService.deleteDynamicPricing(id);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete occupancy',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to delete occupancy'));
        }
    }
}
