import {prisma} from "../../config";
import { errorResponse, successResponse } from "../../utils/return";
import { IApiResponse } from "../../utils/return.types";

export const getDynamicPricingForProperty = async (propertyId: string): Promise<IApiResponse> => {
    try {
        const dynamicPricing = await prisma.dynamicPricing.findUnique({
            where: { 
                propertyId: propertyId
             },
        });

        if (!dynamicPricing) {
            return errorResponse("Dynamic pricing not found");
        }

        return successResponse("Dynamic Pricing fetched successfully",dynamicPricing);
    } catch (error) {
        return errorResponse(`Failed to get dynamic pricing`);
    }
};
