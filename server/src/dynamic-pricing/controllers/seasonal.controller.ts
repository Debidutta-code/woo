import { CustomRequest, PropertyCustomRequest, toUTC } from '../../utils';
import { Response } from 'express';
import { IApiResponse, errorResponse } from '../../utils';
import { SeasonalDynamicPricingService } from '../services';
import { ISeasonalDynamicPricing, ISeasonalDynamicPricingS } from '../types';

export class SeasonalController {
    private seasonalService: SeasonalDynamicPricingService;

    constructor() {
        this.seasonalService = new SeasonalDynamicPricingService();
    }
    public async createSeasonal(
        req: PropertyCustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const seasonalData: ISeasonalDynamicPricingS = req.body;
            if (!seasonalData) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid data for seasonal pricing',
                            'Invalid request body'
                        )
                    );
            }
            if (toUTC(seasonalData.startDate) >= toUTC(seasonalData.endDate)) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid date range',
                            'Start date must be before end date'
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
                await this.seasonalService.createSeasonalDynamicPricing(
                    propertyId,
                    {
                        ...seasonalData,
                        startDate: toUTC(seasonalData.startDate),
                        endDate: toUTC(seasonalData.endDate),
                    }
                );
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to create seasonal pricing',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to create seasonal pricing'));
        }
    }
    public async getSeasonalByRoomId(
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
                await this.seasonalService.getSeasonalDynamicPricingByRoomId(
                    roomId
                );
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to fetch seasonal pricing',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to fetch seasonal pricing'));
        }
    }
    public async updateSeasonal(
        req: CustomRequest,
        res: Response
    ): Promise<Response<IApiResponse>> {
        try {
            const seasonalData: ISeasonalDynamicPricing = req.body;
            if (!seasonalData) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid data for seasonal pricing',
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
            if (toUTC(seasonalData.startDate) >= toUTC(seasonalData.endDate)) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Invalid date range',
                            'Start date must be before end date'
                        )
                    );
            }
            const response =
                await this.seasonalService.updateSeasonalDynamicPricing(id, {
                    ...seasonalData,
                    startDate: toUTC(seasonalData.startDate),
                    endDate: toUTC(seasonalData.endDate),
                });
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to update seasonal pricing',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to update seasonal pricing'));
        }
    }
    public async deleteSeasonal(
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
                await this.seasonalService.deleteSeasonalDynamicPricing(id);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res
                    .status(500)
                    .json(
                        errorResponse(
                            'Failed to delete seasonal pricing',
                            error.message
                        )
                    );
            }
            return res
                .status(500)
                .json(errorResponse('Failed to delete seasonal pricing'));
        }
    }
}
