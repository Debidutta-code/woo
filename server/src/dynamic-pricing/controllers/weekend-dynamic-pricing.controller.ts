import { CustomRequest } from "../../utils/customRequest";
import e, { Response } from "express";
import { errorResponse } from "../../utils/return";
import {
    WeekendDayDynamicPricingService
} from "../services";
import { ICreateWeekendPricing, ICreateWeekendPricingS, ICWeekendPricingDays, IUWeekendPricingDays } from "../types";
export class WeekendBasedDynamicPricingController {
    private weekendDayDynamicPricingService: WeekendDayDynamicPricingService;

    constructor() {
        this.weekendDayDynamicPricingService = new WeekendDayDynamicPricingService();
    }
    public async createWeekendDayDynamicPricing(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { data, friDayPricing, saturdayPricing, sundayPricing }:
                {
                    data: ICreateWeekendPricingS,
                    friDayPricing?: ICWeekendPricingDays,
                    saturdayPricing?: ICWeekendPricingDays,
                    sundayPricing?: ICWeekendPricingDays
                } = req.body;

                if (!friDayPricing && !saturdayPricing && !sundayPricing) {
                    return res.status(400).json(errorResponse("At least one day pricing must be provided"));
                }

            const response = await this.weekendDayDynamicPricingService.createWeekendPricing(
                data,
                friDayPricing,
                saturdayPricing,
                sundayPricing
            );
            return res.status(response.success ? 201 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(`Failed to create Weekend Day Dynamic Pricing`, error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async getWeekendPricingForPropertyController(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { propertyId } = req.params;
            const response = await this.weekendDayDynamicPricingService.getWeekendPricingForProperty(propertyId);
            return res.status(response.success ? 200 : 404).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(`Failed to retrieve Weekend Day Dynamic Pricing`, error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async updateWeekendPricingController(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { weekend } = req.params;
            const data: IUWeekendPricingDays = req.body;
            const response = await this.weekendDayDynamicPricingService.updateWeekendPricing(weekend, data);
            return res.status(response.success ? 200 : 404).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(`Failed to update Weekend Day Dynamic Pricing`, error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async updateWeekendDayPricingController(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { weekDay } = req.params;
            const data: IUWeekendPricingDays = req.body;
            const response = await this.weekendDayDynamicPricingService.updateWeekendDayPricing(weekDay, data);
            return res.status(response.success ? 200 : 404).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(`Failed to update Weekend Day Dynamic Pricing`, error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async deleteWeekendPricingController(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { weekend } = req.params;
            const response = await this.weekendDayDynamicPricingService.deleteWeekendPricing(weekend);
            return res.status(response.success ? 200 : 404).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse(`Failed to delete Weekend Day Dynamic Pricing`, error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    
    }
}
