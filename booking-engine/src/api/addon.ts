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

/**
 * Fetch all active addons for a property with populated category, subcategory, and variant details
 * Use this during the booking flow to show available add-ons
 */
export const fetchAddonsForBooking = async (propertyId: string): Promise<AddonWithDetails[]> => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/add-on/addons/booking/${propertyId}`
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
            `${API_BASE_URL}/add-on/addon-datewise/addon/${addonId}`,
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
};
