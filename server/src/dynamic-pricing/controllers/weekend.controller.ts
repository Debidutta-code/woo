import {  CustomRequest, PropertyCustomRequest, toUTC } from "../../utils";
import { Response } from "express";
import { IApiResponse,errorResponse } from "../../utils";
import { WeekendDynamicPricingService} from "../services";
import {  IWeekendDynamicPricing,ICWeekendDynamicPricing,ICWeekendDynamicPricingS } from "../types";

export class WeekendController {
    private weekendService: WeekendDynamicPricingService;

    constructor() {
        this.weekendService = new WeekendDynamicPricingService();
    }
    public async createWeekend(req: PropertyCustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const weekendData: ICWeekendDynamicPricingS = req.body;
            if (!weekendData) {
                return res.status(400).json(errorResponse("Invalid data for weekend pricing", "Invalid request body"));
            }
            const propertyId = req.property?.id;
            if (!propertyId) {
                return res.status(400).json(errorResponse("Invalid property ID", "No property identifier provided"));
            }
            const response = await this.weekendService.createWeekendDynamicPricing(propertyId, weekendData);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create weekend pricing", error.message));
            }
            return res.status(500).json(errorResponse("Failed to create weekend pricing"));
        }
    }
    public async getWeekendByRoomId(req: CustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const roomId: string = req.params.roomId;
            if (!roomId) {
                return res.status(400).json(errorResponse("No Room identifier provided", "No room identifier provided"));
            }
            const response = await this.weekendService.getByRoomId(roomId);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to fetch weekend pricing", error.message));
            }
            return res.status(500).json(errorResponse("Failed to fetch weekend pricing"));
        }
    }
    public async updateWeekend(req: CustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const weekendData: IWeekendDynamicPricing = req.body;
            if (!weekendData) {
                return res.status(400).json(errorResponse("Invalid data for weekend pricing", "Invalid request body"));
            }
            const id: string = req.params.id;
            if (!id) {
                return res.status(400).json(errorResponse("No Room identifier provided", "No room identifier provided"));
            }
            const response = await this.weekendService.updateWeekendDynamicPricing(id, weekendData);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to update weekend pricing", error.message));
            }
            return res.status(500).json(errorResponse("Failed to update weekend pricing"));
        }
    }
    public async deleteWeekend(req: CustomRequest, res: Response): Promise<Response<IApiResponse>> {
        try {
            const id: string = req.params.id;
            if (!id) {
                return res.status(400).json(errorResponse("No Room identifier provided", "No room identifier provided"));
            }
            const response = await this.weekendService.deleteWeekendDynamicPricing(id);
            return res.status(response.success ? 200 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to delete weekend pricing", error.message));
            }
            return res.status(500).json(errorResponse("Failed to delete weekend pricing"));
        }
    }
}