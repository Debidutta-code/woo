import { useState, useEffect, useCallback } from 'react';
import { AddonApi, type AddonWithDetails } from '@/api/addon';

interface SelectedAddon {
    addon: AddonWithDetails;
    quantity: number;
    totalPrice: number;
}

interface UseAddonsParams {
    propertyId: string;
    checkInDate: string;
    checkOutDate: string;
    enabled?: boolean;
}

interface UseAddonsReturn {
    addons: AddonWithDetails[];
    selectedAddons: SelectedAddon[];
    loading: boolean;
    error: string | null;
    totalAddonsPrice: number;
    selectAddon: (addonId: string, quantity: number) => Promise<void>;
    clearAddons: () => void;
    refetch: () => Promise<void>;
}

/**
 * Custom hook for managing add-ons in the booking flow
 * 
 * @example
 * ```tsx
 * const {
 *   addons,
 *   selectedAddons,
 *   loading,
 *   totalAddonsPrice,
 *   selectAddon,
 * } = useAddons({
 *   propertyId: 'prop123',
 *   checkInDate: '2025-01-10',
 *   checkOutDate: '2025-01-15',
 * });
 * ```
 */
export const useAddons = ({
    propertyId,
    checkInDate,
    checkOutDate,
    enabled = true,
}: UseAddonsParams): UseAddonsReturn => {
    const [addons, setAddons] = useState<AddonWithDetails[]>([]);
    const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate number of nights
    const numberOfNights = Math.ceil(
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Fetch available addons
    const fetchAddons = useCallback(async () => {
        if (!propertyId || !enabled) return;

        try {
            setLoading(true);
            setError(null);
            const data = await AddonApi.fetchAddonsForBooking(propertyId);
            setAddons(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load add-ons');
            console.error('Error loading addons:', err);
        } finally {
            setLoading(false);
        }
    }, [propertyId, enabled]);

    useEffect(() => {
        fetchAddons();
    }, [fetchAddons]);

    // Select or update addon quantity
    const selectAddon = useCallback(
        async (addonId: string, quantity: number) => {
            const addon = addons.find((a) => a._id === addonId);
            if (!addon) {
                console.error('Addon not found:', addonId);
                return;
            }

            try {
                // Remove addon if quantity is 0 or less
                if (quantity <= 0) {
                    setSelectedAddons((prev) => prev.filter((item) => item.addon._id !== addonId));
                    return;
                }

                // Fetch prices for the addon
                const prices = await AddonApi.fetchAddonPrices(
                    addonId,
                    checkInDate,
                    checkOutDate
                );

                const totalPrice = AddonApi.calculateAddonPrice(addon, prices, numberOfNights) * quantity;

                setSelectedAddons((prev) => {
                    const existing = prev.find((item) => item.addon._id === addonId);

                    if (existing) {
                        // Update existing selection
                        return prev.map((item) =>
                            item.addon._id === addonId
                                ? { ...item, quantity, totalPrice }
                                : item
                        );
                    } else {
                        // Add new selection
                        return [...prev, { addon, quantity, totalPrice }];
                    }
                });
            } catch (err) {
                console.error('Error calculating addon price:', err);
                setError('Failed to calculate addon price');
            }
        },
        [addons, checkInDate, checkOutDate, numberOfNights]
    );

    // Clear all selected addons
    const clearAddons = useCallback(() => {
        setSelectedAddons([]);
    }, []);

    // Calculate total price of all selected addons
    const totalAddonsPrice = selectedAddons.reduce(
        (sum, item) => sum + item.totalPrice,
        0
    );

    return {
        addons,
        selectedAddons,
        loading,
        error,
        totalAddonsPrice,
        selectAddon,
        clearAddons,
        refetch: fetchAddons,
    };
};
