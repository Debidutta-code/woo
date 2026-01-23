import { CustomRequest } from "../../utils/customRequest";
import { Response } from "express";
import { errorResponse } from "../../utils/return";
import {
    SeasonalDynamicPricingService
} from "../services";
import { ICSeasonalHolidayPricingR } from "../types";

export class SeasonalDynamicPricingController {
    private seasonalDynamicPricingService: SeasonalDynamicPricingService;

    constructor() {
        this.seasonalDynamicPricingService = new SeasonalDynamicPricingService();
    }
    public async createSeasonalDynamicPricing(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const data: ICSeasonalHolidayPricingR = req.body;
            if (!data.propertyId) {
                return res.status(400).json(errorResponse("Property is not chosen", "property id is missing in the request"));
            }
            if (!data.roomId) {
                return res.status(400).json(errorResponse("Room is not chosen", "room id is missing in the request"));
            }
            if (new Date(data.startDate) > new Date(data.endDate)) {
                return res.status(400).json(errorResponse("Invalid date range", "start date must be before end date"));
            }
            if (data.adjustmentType === "percentage" && (!data.adjustmentValue || data.adjustmentValue < 0 || data.adjustmentValue > 100)) {
                return res.status(400).json(errorResponse("Invalid adjustment value", "must be between 0 and 100"));
            }
            if (data.adjustmentType === "fixed" && (!data.adjustmentValue || data.adjustmentValue < 0)) {
                return res.status(400).json(errorResponse("Invalid adjustment value", "must be a positive number"));
            }
            if (data.adjustmentType == "fixed" && !data.currencyCode) {
                return res.status(400).json(errorResponse("Currency code is required", "currency code is missing in the payload"));
            }

            const response = await this.seasonalDynamicPricingService.createSeasonalPricing(data);
            return res.status(response.success ? 201 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(`Failed to create Seasonal Dynamic Pricing`, error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async getSeasonalPricing(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const propertyId = req.params.propertyId;

            if (!propertyId) {
                return res.status(400).json(errorResponse("Property is not chosen", "property id is missing in the request"));
            }

            const response = await this.seasonalDynamicPricingService.getSeasonalPriceForProperty(propertyId);
            return res.status(response.success ? 200 : 404).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(`Failed to get Seasonal Dynamic Pricing`, error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async updateSeasonalPricing(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const data: ICSeasonalHolidayPricingR = req.body;
            const seasonalId = req.params.seasonalId;

            if (!seasonalId) {
                return res.status(400).json(errorResponse("Seasonal ID is required", "seasonal id is missing in the request"));
            }

            if (data.adjustmentType === "percentage" && (!data.adjustmentValue || data.adjustmentValue < 0 || data.adjustmentValue > 100)) {
                return res.status(400).json(errorResponse("Invalid adjustment value", "must be between 0 and 100"));
            }
            if (data.adjustmentType === "fixed" && (!data.adjustmentValue || data.adjustmentValue < 0)) {
                return res.status(400).json(errorResponse("Invalid adjustment value", "must be a positive number"));
            }
            if (data.adjustmentType == "fixed" && !data.currencyCode) {
                return res.status(400).json(errorResponse("Currency code is required", "currency code is missing in the payload"));
            }

            const response = await this.seasonalDynamicPricingService.updateSeasonalPricing(seasonalId, data);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(`Failed to update Seasonal Dynamic Pricing`, error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async deleteSeasonalPricing(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const seasonalId = req.params.seasonalId;

            if (!seasonalId) {
                return res.status(400).json(errorResponse("Seasonal ID is required", "seasonal id is missing in the request"));
            }

            const response = await this.seasonalDynamicPricingService.deleteSeasonalPricing(seasonalId);
            return res.status(response.success ? 204 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(`Failed to delete Seasonal Dynamic Pricing`, error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    
    }
}