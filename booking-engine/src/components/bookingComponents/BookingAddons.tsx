'use client';

import React, { useState, useEffect } from 'react';
import { AddonApi, type AddonWithDetails } from '@/api/addon';

interface SelectedAddon {
    addon: AddonWithDetails;
    quantity: number;
    totalPrice: number;
}

interface BookingAddonsProps {
    propertyId: string;
    checkInDate: string;
    checkOutDate: string;
    onAddonsChange: (selectedAddons: SelectedAddon[]) => void;
    className?: string;
}

export const BookingAddons: React.FC<BookingAddonsProps> = ({
    propertyId,
    checkInDate,
    checkOutDate,
    onAddonsChange,
    className = '',
}) => {
    const [addons, setAddons] = useState<AddonWithDetails[]>([]);
    const [selectedAddons, setSelectedAddons] = useState<Map<string, SelectedAddon>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Calculate number of nights
    const numberOfNights = Math.ceil(
        (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    useEffect(() => {
        if (propertyId) {
            loadAddons();
        }
    }, [propertyId]);

    const loadAddons = async () => {
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
    };

    const handleQuantityChange = async (addon: AddonWithDetails, quantity: number) => {
        const newSelected = new Map(selectedAddons);

        if (quantity <= 0) {
            newSelected.delete(addon._id);
        } else {
            try {
                // Fetch prices for the addon
                const prices = await AddonApi.fetchAddonPrices(
                    addon._id,
                    checkInDate,
                    checkOutDate
                );

                const totalPrice = AddonApi.calculateAddonPrice(addon, prices, numberOfNights) * quantity;

                newSelected.set(addon._id, {
                    addon,
                    quantity,
                    totalPrice,
                });
            } catch (err) {
                console.error('Error calculating addon price:', err);
            }
        }

        setSelectedAddons(newSelected);
        onAddonsChange(Array.from(newSelected.values()));
    };

    const getPostingRhythmLabel = (rhythm: string) => {
        switch (rhythm) {
            case 'PER_NIGHT':
                return 'per night';
            case 'PER_STAY':
                return 'per stay';
            case 'ONCE':
                return 'one-time';
            default:
                return rhythm;
        }
    };

    const getCategoryBadge = (addon: AddonWithDetails) => {
        if (addon.categoryId) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {addon.categoryId.name}
                </span>
            );
        }
        return null;
    };

    const getSubCategoryBadge = (addon: AddonWithDetails) => {
        if (addon.subcategoryId) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {addon.subcategoryId.name}
                </span>
            );
        }
        return null;
    };

    const getVariantBadge = (addon: AddonWithDetails) => {
        if (addon.variantId) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {addon.variantId.name}
                </span>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className={`p-4 border rounded-lg ${className}`}>
                <h3 className="text-lg font-semibold mb-4">Available Add-ons</h3>
                <p className="text-gray-500">Loading add-ons...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-4 border rounded-lg ${className}`}>
                <h3 className="text-lg font-semibold mb-4">Available Add-ons</h3>
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (addons.length === 0) {
        return null; // Don't show the section if no addons available
    }

    return (
        <div className={`p-4 border rounded-lg ${className}`}>
            <h3 className="text-lg font-semibold mb-4">Enhance Your Stay</h3>
            <p className="text-sm text-gray-600 mb-4">
                Select additional services and amenities for your reservation
            </p>

            <div className="space-y-4">
                {addons.map((addon) => {
                    const selectedQty = selectedAddons.get(addon._id)?.quantity || 0;

                    return (
                        <div
                            key={addon._id}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                    <h4 className="font-medium text-base">{addon.name}</h4>
                                    {addon.description && (
                                        <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                                    )}
                                </div>
                                <div className="ml-4 flex items-center gap-2">
                                    <button
                                        onClick={() => handleQuantityChange(addon, Math.max(0, selectedQty - 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                                        disabled={selectedQty === 0}
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center font-medium">{selectedQty}</span>
                                    <button
                                        onClick={() => handleQuantityChange(addon, selectedQty + 1)}
                                        className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap mt-2">
                                {getCategoryBadge(addon)}
                                {getSubCategoryBadge(addon)}
                                {getVariantBadge(addon)}
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {getPostingRhythmLabel(addon.postingRhythm)}
                                </span>
                            </div>

                            {selectedQty > 0 && selectedAddons.get(addon._id) && (
                                <div className="mt-2 pt-2 border-t">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">
                                            {selectedQty} × {getPostingRhythmLabel(addon.postingRhythm)}
                                        </span>
                                        <span className="font-semibold">
                                            ${selectedAddons.get(addon._id)?.totalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedAddons.size > 0 && (
                <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center font-semibold">
                        <span>Total Add-ons:</span>
                        <span>
                            $
                            {Array.from(selectedAddons.values())
                                .reduce((sum, item) => sum + item.totalPrice, 0)
                                .toFixed(2)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
