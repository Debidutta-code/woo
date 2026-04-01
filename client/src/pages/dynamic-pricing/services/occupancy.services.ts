import {
    createOccupancyApi,
    updateOccupancyApi,
    deleteOccupancyApi,
    getOccupancyByRoomApi
} from "../api";
import type {
    ICOccupancyBasedDynamicPricing,
    ICOccupancyBasedDynamicPricingS,
} from "../interface"
export const createOccupancyBasedDynamicPricing = async (propertyId: string, data: ICOccupancyBasedDynamicPricingS) => {
    try {
        if (data.maxInventoryPercentage < 0 || data.maxInventoryPercentage > 100) {
            return {
                success: false,
                message: "Max inventory percentage must be between 0 and 100"
            };
        }
        if (data.minInventoryPercentage < 0 || data.minInventoryPercentage > 100) {
            return {
                success: false,
                message: "Min inventory percentage must be between 0 and 100"
            };
        }
        if (data.minInventoryPercentage > data.maxInventoryPercentage) {
            return {
                success: false,
                message: "Min inventory percentage cannot be greater than max inventory percentage"
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
        return await createOccupancyApi(propertyId, data);
    } catch (error) {
        return {
            success: false,
            message: "Failed to create occupancy-based dynamic pricing"
        };
    }
};
export const getOccupancyByRoomApiService = async (roomId: string) => {
    try {
        if (!roomId || roomId.trim() === "") {
            return {
                success: false,
                message: "Select a room to get occupancy data"
            };
        }
        return await getOccupancyByRoomApi(roomId);
    } catch (error) {
        return {
            success: false,
            message: "Failed to get occupancy data"
        };
    }
};
export const updateOccupancyBasedDynamicPricing = async (id: string, data: ICOccupancyBasedDynamicPricing) => {
    try {
        if (!id || id.trim() === "") {
            return {
                success: false,
                message: "Select a dynamic pricing rule to update"
            };
        }
        if (data.maxInventoryPercentage < 0 || data.maxInventoryPercentage > 100) {
            return {
                success: false,
                message: "Max inventory percentage must be between 0 and 100"
            };
        }
        if (data.minInventoryPercentage < 0 || data.minInventoryPercentage > 100) {
            return {
                success: false,
                message: "Min inventory percentage must be between 0 and 100"
            };
        }
        if (data.minInventoryPercentage > data.maxInventoryPercentage) {
            return {
                success: false,
                message: "Min inventory percentage cannot be greater than max inventory percentage"
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
        return await updateOccupancyApi(id, data);
    } catch (error) {
        return {
            success: false,
            message: "Failed to update occupancy-based dynamic pricing"
        };
    }
};
export const deleteOccupancyApiService = async (id: string) => {
    try {
        if (!id || id.trim() === "") {
            return {
                success: false,
                message: "Select a dynamic pricing rule to delete"
            };
        }
        return await deleteOccupancyApi(id);
    } catch (error) {
        return {
            success: false,
            message: "Failed to delete occupancy-based dynamic pricing"
        };
    }
};