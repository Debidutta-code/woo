import { successResponse, errorResponse } from "../../utils/return";
import { OccupancyBasedDynamicPricing } from "../repository";
import { IApiResponse } from "../../utils/return.types";
import { getDynamicPricingForProperty, getRoomType } from "../utils";
import { ICCreateOccupancyBasedDynamicPricing, ICCreateOccupancyBasedDynamicPricingS, IUpdateOccupancyBasedDynamicPricing } from "../types";
export class OccupancyDynamicPricingService {
    private occupancyBasedDynamicPricingRepo: OccupancyBasedDynamicPricing;

    constructor() {
        this.occupancyBasedDynamicPricingRepo = new OccupancyBasedDynamicPricing();
    }
    public async createOccupancyBasedDynamicPricing(data: ICCreateOccupancyBasedDynamicPricingS): Promise<IApiResponse> {
        try {
            const roomTypeDetails = await getRoomType(data.roomId);
            if (roomTypeDetails.success) {
                return errorResponse("Room type not found");
            }
            const dynamicPricing=await getDynamicPricingForProperty(data.propertyId);
            if (!dynamicPricing.success) {
                return errorResponse("Dynamic pricing not found");
            }
            const isAnyOccupancyExists = await this.occupancyBasedDynamicPricingRepo.getOccupancyBasedDynamicPricingByRange(
                data.propertyId, roomTypeDetails.data.roomType, data.maximumOccupancyPercentage, data.minimumOccupancyPercentage);
            if (isAnyOccupancyExists) {
                return errorResponse("Occupancy Based Dynamic Pricing already exists for the given occupancy range");
            }
            const repoRes=await this.occupancyBasedDynamicPricingRepo.createOccupancyBasedDynamicPricing({
                propertyId: data.propertyId,
                roomId: data.roomId,
                minimumOccupancyPercentage: data.minimumOccupancyPercentage,
                maximumOccupancyPercentage: data.maximumOccupancyPercentage,
                adjustmentType: data.adjustmentType,
                adjustmentValue: data.adjustmentValue,
                currencyCode: data.currencyCode,
                dynamicPricingId: dynamicPricing.data.id,
                roomType: roomTypeDetails.data.roomType,
                roomName: roomTypeDetails.data.roomName
            });
            return successResponse("Occupancy Based Dynamic Pricing created successfully", repoRes);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(`Failed to create Occupancy Based Dynamic Pricing`, error.message);
            }
            return errorResponse("Failed to create Occupancy Based Dynamic Pricing");
        }
    }
    public async getDynamicPricingForProperty(propertyId: string): Promise<IApiResponse> {
        try {
            const dynamicPricing = await this.occupancyBasedDynamicPricingRepo.getOccupancyBasedDynamicPricing(propertyId);
            if (!dynamicPricing) {
                return errorResponse("Dynamic pricing not found");
            }
            return successResponse("Dynamic pricing retrieved successfully", dynamicPricing);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(`Failed to retrieve dynamic pricing`, error.message);
            }
            return errorResponse("Failed to retrieve dynamic pricing");
        }
    }

    public async updateOccupancyBasedDynamicPricing(id:string,data: IUpdateOccupancyBasedDynamicPricing): Promise<IApiResponse> {
        try {
            const existingPricing = await this.occupancyBasedDynamicPricingRepo.getOccupancyBasedDynamicPricingById(id);
            if (!existingPricing) {
                return errorResponse("Dynamic pricing not found");
            }
            const updatedPricing = await this.occupancyBasedDynamicPricingRepo.updateOccupancyBasedDynamicPricing(id,data);
            if (!updatedPricing) {
                return errorResponse("Failed to update dynamic pricing");
            }
            return successResponse("Dynamic pricing updated successfully", updatedPricing);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(`Failed to update dynamic pricing`, error.message);
            }
            return errorResponse("Failed to update dynamic pricing");
        }
    }
    public async deleteOccupancyBasedDynamicPricing(id:string): Promise<IApiResponse> {
        try {
            const existingPricing = await this.occupancyBasedDynamicPricingRepo.getOccupancyBasedDynamicPricingById(id);
            if (!existingPricing) {
                return errorResponse("Dynamic pricing not found");
            }
            const isDeleted = await this.occupancyBasedDynamicPricingRepo.deleteOccupancyBasedDynamicPricing(id);
            if (!isDeleted) {
                return errorResponse("Failed to delete dynamic pricing");
            }
            return successResponse("Dynamic pricing deleted successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(`Failed to delete dynamic pricing`, error.message);
            }
            return errorResponse("Failed to delete dynamic pricing");
        }

    }
}
