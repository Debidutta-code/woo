import { getCurrencyConverter } from "../../currency-maping/utils";
import { IApiResponse, successResponse, errorResponse } from "../../utils";
import {
    DynamicPricing,
    OccupancyBasedDynamicPricingRepository
} from "../repository"
import { ICOccupancyBasedDynamicPricing, ICOccupancyBasedDynamicPricingS } from "../types";

export class OccupancyBasedDynamicPricingService {
    private occupancyRepo: OccupancyBasedDynamicPricingRepository;
    private dynamicPricingRepo: DynamicPricing;
    constructor() {
        this.occupancyRepo = new OccupancyBasedDynamicPricingRepository();
        this.dynamicPricingRepo = new DynamicPricing();
    }
    public async createOccupancyBasedDynamicPricing(propertyId: string, data: ICOccupancyBasedDynamicPricingS): Promise<IApiResponse> {
        try {
            const [dynamicPricing, isExistsInRange, { convert, baseCurrency }] = await Promise.all([
                this.dynamicPricingRepo.getDynamicPricingByPropertyIdCo(propertyId),
                this.occupancyRepo.checkIfRangeExists([], data.roomId, data.minInventoryPercentage, data.maxInventoryPercentage),
                getCurrencyConverter(propertyId, data.currencyCode ? data.currencyCode : "AED")
            ]);
            if (!dynamicPricing) {
                return errorResponse("Dynamic pricing not found", "Dynamic pricing not found");
            }
            if (isExistsInRange) {
                return errorResponse
                    (
                        "Dynamic pricing already exists for this room in the specified range",
                        `Dynamic pricing already exists for this room in the range of ${data.minInventoryPercentage} - ${data.maxInventoryPercentage}`
                    );
            }
            await this.occupancyRepo.createOccupancyBasedDynamicPricing({
                ...data,
                dynamicId: dynamicPricing.id,
                currencyCode: data.adjustmentType === "percentage" ? null : baseCurrency,
                adjustmentValue: data.adjustmentType === "percentage" ? data.adjustmentValue : convert(data.adjustmentValue)
            });
            return successResponse("Dynamic pricing created successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error creating dynamic pricing", error.message);
            }
            return errorResponse("Error creating dynamic pricing", "Unknown error");
        }
    }
    public async getDynamicPricingByRoomId(roomId: string): Promise<IApiResponse> {
        try {
            const dynamicPricing = await this.occupancyRepo.getOccupancyBasedDynamicPricingByRoomId(roomId);
            return successResponse("Occupancy-based dynamic pricing retrieved successfully ", dynamicPricing);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error retrieving dynamic pricing", error.message);
            }
            return errorResponse("Error retrieving dynamic pricing", "Unknown error");
        }
    }
    public async updateDynamicPricing(id: string, data: ICOccupancyBasedDynamicPricing): Promise<IApiResponse> {
        try {
            const [existingDynamicPricing, isExistsInRange, dynamicPricing] = await Promise.all([
                this.occupancyRepo.getOccupancyBasedDynamicPricing(id),
                this.occupancyRepo.checkIfRangeExists([id], data.roomId, data.minInventoryPercentage, data.maxInventoryPercentage),
                this.dynamicPricingRepo.getById(data.dynamicId)
            ]);
            if (!dynamicPricing) {
                return errorResponse("Dynamic pricing not found", "Dynamic pricing not found");
            }
            if (!existingDynamicPricing) {
                return errorResponse("Selected occupancy pricing not found", "Selected occupancy pricing not found");
            }
            const { convert, baseCurrency } = await getCurrencyConverter(dynamicPricing.propertyId, data.currencyCode ? data.currencyCode : "AED");

            if (isExistsInRange) {
                return errorResponse
                    (
                        "Dynamic pricing already exists for this room in the specified range",
                        `Dynamic pricing already exists for this room in the range of ${data.minInventoryPercentage} - ${data.maxInventoryPercentage}`
                    );
            }
            await this.occupancyRepo.updateOccupancyBasedDynamicPricing(id, {
                ...data,
                currencyCode: data.adjustmentType === "percentage" ? null : baseCurrency,
                adjustmentValue: data.adjustmentType === "percentage" ? data.adjustmentValue : convert(data.adjustmentValue)
            });
            return successResponse("Dynamic pricing updated successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error updating dynamic pricing", error.message);
            }
            return errorResponse("Error updating dynamic pricing", "Unknown error");
        }
    }
    public async deleteDynamicPricing(id: string): Promise<IApiResponse> {
        try {
            const existingDynamicPricing = await this.occupancyRepo.getOccupancyBasedDynamicPricing(id);
            if (!existingDynamicPricing) {
                return errorResponse("Dynamic pricing not found", "Dynamic pricing not found");
            }
            await this.occupancyRepo.deleteOccupancyBasedDynamicPricing(id);
            return successResponse("Dynamic pricing deleted successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error deleting dynamic pricing", error.message);
            }
            return errorResponse("Error deleting dynamic pricing", "Unknown error");
        }
    }
}
