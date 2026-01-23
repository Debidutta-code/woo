import { successResponse,errorResponse } from "../../utils/return";
import { IApiResponse } from "../../utils/return.types";
import { SeasonalPricing } from "../repository";
import { getRoomType,getDynamicPricingForProperty } from "../utils";

import {ICSeasonalHolidayPricingS, IUSeasonalHolidayPricingR} from "../types"
export class SeasonalDynamicPricingService {
    private seasonalPricingRepo: SeasonalPricing;

    constructor() {
        this.seasonalPricingRepo = new SeasonalPricing();
    }

    public async createSeasonalPricing(data: ICSeasonalHolidayPricingS): Promise<IApiResponse> {
        try {
            const roomTypeDetails = await getRoomType(data.roomId);
            if (!roomTypeDetails.success) {
                return errorResponse("Room type not found");
            }
            const dynamicPricing=await getDynamicPricingForProperty(data.propertyId);
            if (!dynamicPricing.success) {
                return errorResponse("Dynamic pricing not found");
            }
            const getSeasonalPriceForRoom = await this.seasonalPricingRepo.getSeasonalPriceForRoom(data.propertyId, data.roomId, data.periodType);
            if (getSeasonalPriceForRoom) {
                return errorResponse(`Seasonal pricing of ${data.periodType} already exists for this room`);
            }
            const repoRes = await this.seasonalPricingRepo.createSeasonalPricing({
                propertyId: data.propertyId,
                roomId: data.roomId,
                ruleName: data.ruleName,
                periodType: data.periodType,
                startDate: data.startDate,
                endDate: data.endDate,
                adjustmentType: data.adjustmentType,
                adjustmentValue: data.adjustmentValue,
                currencyCode: data.currencyCode,
                dynamicPricingId: dynamicPricing.data.id,
                roomType: roomTypeDetails.data.roomType,
                roomName: roomTypeDetails.data.roomName
            });
            return successResponse("Seasonal pricing created successfully", repoRes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(`Failed to create seasonal pricing`, error.message);
            }
            return errorResponse("Failed to create seasonal pricing");
        }
    }
    public async getSeasonalPriceForProperty(propertyId: string): Promise<IApiResponse> {
        try {
            const seasonalPrices = await this.seasonalPricingRepo.getSeasonalPricing(propertyId);
            if (!seasonalPrices) {
                return errorResponse("No seasonal pricing found for this property");
            }
            return successResponse("Seasonal pricing retrieved successfully", seasonalPrices);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(`Failed to get seasonal pricing`, error.message);
            }
            return errorResponse("Failed to get seasonal pricing");
        }
    }
    public async updateSeasonalPricing(id: string, data: IUSeasonalHolidayPricingR): Promise<IApiResponse> {
        try {
            const isExisting = await this.seasonalPricingRepo.getSeasonalPriceForId(id);
            if (!isExisting) {
                return errorResponse("Seasonal pricing not found");
            }
            const updatedPricing = await this.seasonalPricingRepo.updateSeasonalPricing(id, data);
            if (!updatedPricing) {
                return errorResponse("Failed to update seasonal pricing");
            }
            return successResponse("Seasonal pricing updated successfully", updatedPricing);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(`Failed to update seasonal pricing`, error.message);
            }
            return errorResponse("Failed to update seasonal pricing");
        }
    }
    public async deleteSeasonalPricing(id: string): Promise<IApiResponse> {
        try {
            const isExisting = await this.seasonalPricingRepo.getSeasonalPriceForId(id);
            if (!isExisting) {
                return errorResponse("Seasonal pricing not found");
            }
            const deleted = await this.seasonalPricingRepo.deleteSeasonalPricing(id);
            if (!deleted) {
                return errorResponse("Failed to delete seasonal pricing");
            }
            return successResponse("Seasonal pricing deleted successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(`Failed to delete seasonal pricing`, error.message);
            }
            return errorResponse("Failed to delete seasonal pricing");
        }
    }
}