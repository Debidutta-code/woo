import { CustomRequest } from "../../utils/customRequest";
import { Response } from "express";
import { errorResponse } from "../../utils/return";
import {
    OccupancyDynamicPricingService
} from "../services";
import { ICCreateOccupancyBasedDynamicPricingS, IUpdateOccupancyBasedDynamicPricing } from "../types";

export class OccupancyDynamicPricingController {
    private occupancyDynamicPricingService: OccupancyDynamicPricingService;

    constructor() {
        this.occupancyDynamicPricingService = new OccupancyDynamicPricingService();
    }
    public async createOccupancyBasedDynamicPricing(req: CustomRequest, res: Response):Promise<Response> {
        try {
            const data: ICCreateOccupancyBasedDynamicPricingS = req.body;
            if(!data.propertyId){
                return res.status(400).json(errorResponse("Property is not chosen","property id is missing in the request"));
            }
            if(!data.roomId) {
                return res.status(400).json(errorResponse("Room is not chosen","room id is missing in the request"));
            }
            if(data.maximumOccupancyPercentage < 0 || data.maximumOccupancyPercentage > 100) {
                return res.status(400).json(errorResponse("Invalid maximum occupancy percentage","must be between 0 and 100"));
            }
            if(data.minimumOccupancyPercentage < 0 || data.minimumOccupancyPercentage > 100) {
                return res.status(400).json(errorResponse("Invalid minimum occupancy percentage","must be between 0 and 100"));
            }
            if(data.minimumOccupancyPercentage > data.maximumOccupancyPercentage) {
                return res.status(400).json(errorResponse("Invalid occupancy percentage","minimum must be less than maximum"));
            }
            if(data.adjustmentType==="percentage" && (!data.adjustmentValue || data.adjustmentValue < 0 || data.adjustmentValue > 100)) {
                return res.status(400).json(errorResponse("Invalid adjustment value","must be between 0 and 100"));
            }
            if(data.adjustmentType==="fixed" && (!data.adjustmentValue || data.adjustmentValue < 0)) {
                return res.status(400).json(errorResponse("Invalid adjustment value","must be a positive number"));
            }
            if(data.adjustmentType=="fixed"&&!data.currencyCode){
                return res.status(400).json(errorResponse("Currency code is required","currency code is missing in the payload"));
            }
            
            const response = await this.occupancyDynamicPricingService.createOccupancyBasedDynamicPricing(data);
            return res.status(response.success ? 201 : 400).json(response);
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse(`Failed to create Occupancy Based Dynamic Pricing`, error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async getDynamicPricing(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const propertyId = req.params.propertyId;

            if (!propertyId) {
                return res.status(400).json(errorResponse("Property is not chosen", "property id is missing in the request"));
            }

            const response = await this.occupancyDynamicPricingService.getDynamicPricingForProperty(propertyId);
            return res.status(response.success ? 200 : 404).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(`Failed to get Dynamic Pricing`, error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async updateOccupancyBasedDynamicPricing(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const data: IUpdateOccupancyBasedDynamicPricing = req.body;
           const occupancyId = req.params.occupancyId;

            if (data.adjustmentType === "percentage" && (!data.adjustmentValue || data.adjustmentValue < 0 || data.adjustmentValue > 100)) {
                return res.status(400).json(errorResponse("Invalid adjustment value", "must be between 0 and 100"));
            }
            if (data.adjustmentType === "fixed" && (!data.adjustmentValue || data.adjustmentValue < 0)) {
                return res.status(400).json(errorResponse("Invalid adjustment value", "must be a positive number"));
            }
            if (data.adjustmentType == "fixed" && !data.currencyCode) {
                return res.status(400).json(errorResponse("Currency code is required", "currency code is missing in the payload"));
            }

            const response = await this.occupancyDynamicPricingService.updateOccupancyBasedDynamicPricing(occupancyId, data);
            return res.status(response.success ? 201 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(`Failed to update Occupancy Based Dynamic Pricing`, error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async deleteOccupancyBasedDynamicPricing(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const occupancyId = req.params.occupancyId;

            if (!occupancyId) {
                return res.status(400).json(errorResponse("Occupancy ID is required", "occupancy id is missing in the request"));
            }

            const response = await this.occupancyDynamicPricingService.deleteOccupancyBasedDynamicPricing(occupancyId);
            return res.status(response.success ? 204 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(`Failed to delete Occupancy Based Dynamic Pricing`, error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
}