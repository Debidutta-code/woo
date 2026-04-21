import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface AddonCategory {
    _id: string;
    code: string;
    name: string;
    description?: string;
}

export interface AddonSubCategory {
    _id: string;
    code: string;
    name: string;
    description?: string;
}

export interface AddonVariant {
    _id: string;
    code: string;
    name: string;
    description?: string;
}

export interface AddonWithDetails {
    _id: string;
    propertyId: string;
    code: string;
    name: string;
    postingRhythm: 'PER_NIGHT' | 'PER_STAY' | 'ONCE';
    description?: string;
    isActive: boolean;
    images?: string[];
    categoryId?: AddonCategory;
    subcategoryId?: AddonSubCategory;
    variantId?: AddonVariant;
    created_at: string;
    updated_at: string;
}

export interface AddonPrice {
    _id: string;
    addonId: string;
    startDate: string;
    endDate: string;
    price: number;
    currencyCode: string;
}

export interface AvailableAddon {
    id: string;
    addonId: string;
    date: string;
    price: number;
    currencyCode: string;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
    addon: {
        id: string;
        propertyId: string;
        categoryId: string;
        subcategoryId: string;
        variantId: string | null;
        ratePlanId: string | null;
        code: string;
        name: string;
        postingRhythm: 'per_night' | 'per_stay' | 'per_person_per_night';
        description: string;
        isActive: boolean;
        images: string[];
        createdAt: string;
        updatedAt: string;
        category: {
            code: string;
            name: string;
        };
        subCategory: {
            code: string;
            name: string;
        };
        addonVariant: any | null;
    };
}

/**
 * Fetch all active addons for a property with populated category, subcategory, and variant details
 * Use this during the booking flow to show available add-ons
 */
export const fetchAddonsForBooking = async (propertyId: string): Promise<AddonWithDetails[]> => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/addon/addons/booking/${propertyId}`
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || "Failed to fetch addons");
    } catch (error: any) {
        console.error("Error fetching addons for booking:", error);
        throw new Error(
            error?.response?.data?.message || "Failed to fetch addons for booking"
        );
    }
};

/**
 * Fetch addon prices for a specific date range
 */
export const fetchAddonPrices = async (
    addonId: string,
    startDate: string,
    endDate: string
): Promise<AddonPrice[]> => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/addon/addon-datewise/addon/${addonId}`,
            {
                params: {
                    startDate,
                    endDate,
                },
            }
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || "Failed to fetch addon prices");
    } catch (error: any) {
        console.error("Error fetching addon prices:", error);
        throw new Error(
            error?.response?.data?.message || "Failed to fetch addon prices"
        );
    }
};

/**
 * Fetch available addons for a property within a date range
 * This endpoint returns addons with dates and prices
 */
export const fetchAvailableAddons = async (
    propertyCode: string,
    startDate: string,
    endDate: string,
    ratePlanCode?: string
): Promise<AvailableAddon[]> => {
    try {
        const params = new URLSearchParams({
            propertyCode,
            startDate,
            endDate,
            ...(ratePlanCode && { ratePlanCode }),
        });

        const response = await axios.get(
            `${API_BASE_URL}/extranet/addon/addon-datewise/available?${params.toString()}`
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || "Failed to fetch available addons");
    } catch (error: any) {
        console.error("Error fetching available addons:", error);
        throw new Error(
            error?.response?.data?.message || "Failed to fetch available addons"
        );
    }
};

/**
 * Calculate addon total price based on posting rhythm and date range
 */
export const calculateAddonPrice = (
    addon: AddonWithDetails,
    prices: AddonPrice[],
    numberOfNights: number
): number => {
    if (!prices || prices.length === 0) return 0;

    // Get the base price (you might want to handle multiple prices differently)
    const basePrice = prices[0]?.price || 0;

    switch (addon.postingRhythm) {
        case 'PER_NIGHT':
            return basePrice * numberOfNights;
        case 'PER_STAY':
        case 'ONCE':
        default:
            return basePrice;
    }
};

export const AddonApi = {
    fetchAddonsForBooking,
    fetchAddonPrices,
    calculateAddonPrice,
    fetchAvailableAddons,
};
