import {
    createWeekendPricingApi,
    deleteWeekendPricingApi,
    getWeekendPricingApi,
    updateWeekendPricingApi
} from "../api";
import type {
    ICWeekendDynamicPricing,
    ICWeekendDynamicPricingS,
} from "../interface";

export const createWeekendDynamicPricing = async (propertyId: string, data: ICWeekendDynamicPricingS) => {
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
        if (data.startDate > data.endDate) {
            return {
                success: false,
                message: "Start date must be before end date"
            };
        }

        return await createWeekendPricingApi(propertyId, data);
    } catch (error) {
        return {
            success: false,
            message: "Failed to create weekend dynamic pricing"
        };
    }
};

export const getWeekendPricingByRoomApiService = async (roomId: string) => {
    try {
        if (!roomId || roomId.trim() === "") {
            return {
                success: false,
                message: "Select a room to get weekend pricing data"
            };
        }
        return await getWeekendPricingApi(roomId);
    } catch (error) {
        return {
            success: false,
            message: "Failed to get weekend pricing data"
        };
    }
};

export const updateWeekendBasedDynamicPricing = async (id: string, data: ICWeekendDynamicPricing) => {
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
        if (data.startDate > data.endDate) {
            return {
                success: false,
                message: "Start date must be before end date"
            };
        }
        return await updateWeekendPricingApi(id, data);
    } catch (error) {
        return {
            success: false,
            message: "Failed to update weekend dynamic pricing"
        };
    }
};

export const deleteWeekendPricingApiService = async (id: string) => {
    try {
        if (!id || id.trim() === "") {
            return {
                success: false,
                message: "Select a dynamic pricing rule to delete"
            };
        }
        return await deleteWeekendPricingApi(id);
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete weekend dynamic pricing"
        };
    }
};