import {
    createSeasonalPricingApi,
    deleteSeasonalPricingApi,
    getSeasonalPricingApi,
    updateSeasonalPricingApi
} from "../api";
import type {
    ICSeasonalDynamicPricing,
    ISeasonalDynamicPricingS,
} from "../interface"
export const createSeasonalDynamicPricing = async (propertyId: string, data: ISeasonalDynamicPricingS) => {
    try {
        if (data.adjustmentType === "percentage" && (data.adjustmentValue < 0 || data.adjustmentValue > 100)) {
            return {
                success: false,
                message: "Adjustment value must be between 0 and 100"
            };
        }
        if (data.adjustmentType === "flat" && data.adjustmentValue < 0) {
            return {
                success: false,
                message: "Adjustment value must be a positive number"
            };
        }
        if (data.adjustmentType === "flat" && !data.currencyCode) {
            return {
                success: false,
                message: "Currency code is required for flat rate adjustments"
            };
        }
        if(data.startDate > data.endDate) {
            return {
                success: false,
                message: "Start date must be before end date"
            };
        }

        return await createSeasonalPricingApi(propertyId, data);
    } catch (error) {
        return {
            success: false,
            message: "Failed to create seasonal dynamic pricing"
        };
    }
};
export const getSeasonalPricingByRoomApiService = async (roomId: string) => {
    try {
        if (!roomId || roomId.trim() === "") {
            return {
                success: false,
                message: "Select a room to get seasonal pricing data"
            };
        }
        return await getSeasonalPricingApi(roomId);
    } catch (error) {
        return {
            success: false,
            message: "Failed to get seasonal pricing data"
        };
    }
};
export const updateSeasonalBasedDynamicPricing = async (id: string, data: ICSeasonalDynamicPricing) => {
    try {
        if (!id || id.trim() === "") {
            return {
                success: false,
                message: "Select a dynamic pricing rule to update"
            };
        }
        if (data.adjustmentType === "percentage" && (data.adjustmentValue < 0 || data.adjustmentValue > 100)) {
            return {
                success: false,
                message: "Adjustment value must be between 0 and 100"
            };
        }
        if (data.adjustmentType === "flat" && data.adjustmentValue < 0) {
            return {
                success: false,
                message: "Adjustment value must be a positive number"
            };
        }
        if (data.adjustmentType === "flat" && !data.currencyCode) {
            return {
                success: false,
                message: "Currency code is required for flat rate adjustments"
            };
        }
        if(data.startDate > data.endDate) {
            return {
                success: false,
                message: "Start date must be before end date"
            };
        }
        return await updateSeasonalPricingApi(id, data);
    } catch (error) {
        return {
            success: false,
            message: "Failed to update seasonal dynamic pricing"
        };
    }
};
export const deleteSeasonalPricingApiService = async (id: string) => {
    try {
        if (!id || id.trim() === "") {
            return {
                success: false,
                message: "Select a dynamic pricing rule to delete"
            };
        }
        return await deleteSeasonalPricingApi(id);
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete seasonal dynamic pricing"
        };
    }
};