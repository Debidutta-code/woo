import { getCurrencyConverter } from "../../currency-maping/utils";
import { IApiResponse, successResponse, errorResponse } from "../../utils";
import {
    DynamicPricing,
    SeasonalDynamicPricingRepository
} from "../repository"
import { ICSeasonalDynamicPricing, ISeasonalDynamicPricing, ISeasonalDynamicPricingS } from "../types";

export class SeasonalDynamicPricingService {
    private seasonalRepo: SeasonalDynamicPricingRepository;
    private dynamicPricingRepo: DynamicPricing;
    constructor() {
        this.seasonalRepo = new SeasonalDynamicPricingRepository();
        this.dynamicPricingRepo = new DynamicPricing();
    }
    public async createSeasonalDynamicPricing(propertyId: string, data: ISeasonalDynamicPricingS): Promise<IApiResponse> {
        try {
            const [dynamicPricing, { convert, baseCurrency }, isExistsInDateRange] = await Promise.all([
                this.dynamicPricingRepo.getDynamicPricingByPropertyIdCo(propertyId),
                getCurrencyConverter(propertyId, data.currencyCode ? data.currencyCode : "AED"),
                this.seasonalRepo.seasonalDynamicPricingByDateRange([], data.roomId, data.startDate, data.endDate)
            ]);
            if (!dynamicPricing) {
                return errorResponse("Dynamic pricing not found", "Dynamic pricing not found");
            }
            if (isExistsInDateRange && isExistsInDateRange.length > 0) {
                return errorResponse(
                    "Seasonal dynamic pricing already exists for this room in the specified date range",
                    `Seasonal dynamic pricing already exists for this room in the range of ${data.startDate} - ${data.endDate}`
                );
            }
            await this.seasonalRepo.createSeasonalDynamicPricing({
                ...data,
                dynamicId: dynamicPricing.id,
                currencyCode: data.adjustmentType === "percentage" ? null : baseCurrency,
                adjustmentValue: data.adjustmentType === "percentage" ? data.adjustmentValue : convert(data.adjustmentValue)
            });
            return successResponse("Seasonal dynamic pricing created successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error creating seasonal dynamic pricing", error.message);
            }
            return errorResponse("Error creating seasonal dynamic pricing", "Unknown error");
        }
    }
    public async getSeasonalDynamicPricingByRoomId(roomId: string): Promise<IApiResponse> {
        try {
            const seasonalDynamicPricing = await this.seasonalRepo.getSeasonalDynamicPricingByRoomId(roomId);
            if (!seasonalDynamicPricing) {
                return errorResponse("Seasonal dynamic pricing not found for this room", "Seasonal dynamic pricing not found");
            }
            return successResponse("Seasonal dynamic pricing retrieved successfully", seasonalDynamicPricing);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error retrieving seasonal dynamic pricing", error.message);
            }
            return errorResponse("Error retrieving seasonal dynamic pricing", "Unknown error");
        }
    }
    public async updateSeasonalDynamicPricing(id: string, data: ICSeasonalDynamicPricing): Promise<IApiResponse> {
        try {
            const [existingSeasonalPricing, isExistsInDateRange,dynamicPricing] = await Promise.all([
                this.seasonalRepo.getSeasonalDynamicPricing(id),
                this.seasonalRepo.seasonalDynamicPricingByDateRange([id], data.roomId, data.startDate, data.endDate),
                this.dynamicPricingRepo.getDynamicPricingByIdCO(data.dynamicId)
            ]);
            if (!existingSeasonalPricing) {
                return errorResponse("Seasonal dynamic pricing not found", "Seasonal dynamic pricing not found");
            }
            if (isExistsInDateRange && isExistsInDateRange.length > 0) {
                return errorResponse(
                    "Seasonal dynamic pricing already exists for this room in the specified date range",
                    `Seasonal dynamic pricing already exists for this room in the range of ${data.startDate} - ${data.endDate}`
                );
            }
            if(!dynamicPricing) {
                return errorResponse("Dynamic pricing not found", "Dynamic pricing not found");
            }
            const { convert, baseCurrency } = await getCurrencyConverter(dynamicPricing.propertyId, data.currencyCode ? data.currencyCode : "AED");

            await this.seasonalRepo.updateSeasonalDynamicPricing(id, {
                ...data,
                adjustmentValue: data.adjustmentType === "percentage" ? data.adjustmentValue : convert(data.adjustmentValue),
                currencyCode: data.adjustmentType === "percentage" ? null : baseCurrency
            });
            return successResponse("Seasonal dynamic pricing updated successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error updating seasonal dynamic pricing", error.message);
            }
            return errorResponse("Error updating seasonal dynamic pricing", "Unknown error");
        }
    }
    public async deleteSeasonalDynamicPricing(id: string): Promise<IApiResponse> {
        try {
            const existingSeasonalPricing = await this.seasonalRepo.getSeasonalDynamicPricing(id);
            if (!existingSeasonalPricing) {
                return errorResponse("Seasonal dynamic pricing not found", "Seasonal dynamic pricing not found");
            }
            await this.seasonalRepo.deleteSeasonalDynamicPricing(id);
            return successResponse("Seasonal dynamic pricing deleted successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Error deleting seasonal dynamic pricing", error.message);
            }
            return errorResponse("Error deleting seasonal dynamic pricing", "Unknown error");
        }
    }
}