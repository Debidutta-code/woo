import { CustomRequest } from "../../utils";
import { Response } from "express";
import { IApiResponse,errorResponse } from "../../utils";
import { DynamicPricingService } from "../services/dynamic-pricing.service";
export class DynamicPricingController {
    private dynamicPricingService: DynamicPricingService;

    constructor() {
        this.dynamicPricingService = new DynamicPricingService();
    }
    public async getDynamicPricing(req: CustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const propertyId = req.params.id;
            const response = await this.dynamicPricingService.getDynamicPricingByPropertyId(propertyId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to fetch Dynamic Pricing", error.message));
            }
            return res.status(500).json(errorResponse("Failed to fetch Dynamic Pricing"));
        }
    }
}