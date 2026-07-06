import {
    getDynamicPricingApi
} from "../api";

export const fetchDynamicPricing = async (propertyId: string) => {
    try {
        if (!propertyId || propertyId.trim() === "") {
            return {
                success: false,
                message: "Invalid property"
            };
        }
        const response = await getDynamicPricingApi(propertyId);
        return response;
    } catch (error) {
        return {
            success: false,
            message: "Failed to fetch dynamic pricing"
        };
    }
};