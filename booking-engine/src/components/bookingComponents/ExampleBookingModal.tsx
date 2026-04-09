'use client';

/**
 * EXAMPLE: Complete Add-on Integration in Booking Flow
 * 
 * This is a reference implementation showing how to integrate the add-on system
 * into your booking modal. Copy relevant parts to your actual component.
 */

import React, { useState, useEffect } from 'react';
import { BookingAddons } from './BookingAddons';
import { useAddons } from '@/hooks/useAddons';

interface ExampleBookingModalProps {
    propertyId: string;
    checkInDate: string;
    checkOutDate: string;
    roomPrice: number;
    onClose: () => void;
}

export function ExampleBookingModal({
    propertyId,
    checkInDate,
    checkOutDate,
    roomPrice,
    onClose,
}: ExampleBookingModalProps) {
    // Guest information state
    const [guestInfo, setGuestInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });

    // Pricing state
    const [pricing, setPricing] = useState({
        roomTotal: roomPrice,
        taxTotal: 0,
        addonsTotal: 0,
        grandTotal: roomPrice,
    });

    // ============================================
    // METHOD 1: Using the Hook (More Control)
    // ============================================
    const {
        addons,
        selectedAddons,
        loading: addonsLoading,
        error: addonsError,
        totalAddonsPrice,
        selectAddon,
        clearAddons,
    } = useAddons({
        propertyId,
        checkInDate,
        checkOutDate,
    });

    // Update pricing when add-ons change
    useEffect(() => {
        const taxTotal = roomPrice * 0.1; // 10% tax example
        const grandTotal = roomPrice + taxTotal + totalAddonsPrice;

        setPricing({
            roomTotal: roomPrice,
            taxTotal,
            addonsTotal: totalAddonsPrice,
            grandTotal,
        });
    }, [roomPrice, totalAddonsPrice]);

    // Handle booking submission
    const handleSubmit = async () => {
        try {
            const bookingPayload = {
                // Guest information
                guest: {
                    firstName: guestInfo.firstName,
                    lastName: guestInfo.lastName,
                    email: guestInfo.email,
                    phone: guestInfo.phone,
                },

                // Booking details
                propertyId,
                checkInDate,
                checkOutDate,
                roomPrice: pricing.roomTotal,

                // Add-ons with full hierarchy details
                addons: selectedAddons.map((item) => ({
                    addonId: item.addon._id,
                    addonCode: item.addon.code,
                    addonName: item.addon.name,
                    quantity: item.quantity,
                    postingRhythm: item.addon.postingRhythm,
                    unitPrice: item.totalPrice / item.quantity,
                    totalPrice: item.totalPrice,

                    // Category hierarchy
                    categoryId: item.addon.categoryId?._id,
                    categoryName: item.addon.categoryId?.name,
                    categoryCode: item.addon.categoryId?.code,

                    subcategoryId: item.addon.subcategoryId?._id,
                    subcategoryName: item.addon.subcategoryId?.name,
                    subcategoryCode: item.addon.subcategoryId?.code,

                    variantId: item.addon.variantId?._id,
                    variantName: item.addon.variantId?.name,
                    variantCode: item.addon.variantId?.code,
                })),

                // Pricing
                pricing: {
                    roomTotal: pricing.roomTotal,
                    taxTotal: pricing.taxTotal,
                    addonsTotal: pricing.addonsTotal,
                    grandTotal: pricing.grandTotal,
                },
            };

            //console.log('Booking Payload:', bookingPayload);

            // Submit to your booking API
            // await bookingApi.createBooking(bookingPayload);

            alert('Booking created successfully!');
            onClose();
        } catch (error) {
            console.error('Booking error:', error);
            alert('Failed to create booking');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Complete Your Booking</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Guest Information */}
                    <section className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Guest Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="First Name"
                                value={guestInfo.firstName}
                                onChange={(e) =>
                                    setGuestInfo({ ...guestInfo, firstName: e.target.value })
                                }
                                className="border rounded-lg p-3"
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={guestInfo.lastName}
                                onChange={(e) =>
                                    setGuestInfo({ ...guestInfo, lastName: e.target.value })
                                }
                                className="border rounded-lg p-3"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={guestInfo.email}
                                onChange={(e) =>
                                    setGuestInfo({ ...guestInfo, email: e.target.value })
                                }
                                className="border rounded-lg p-3"
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={guestInfo.phone}
                                onChange={(e) =>
                                    setGuestInfo({ ...guestInfo, phone: e.target.value })
                                }
                                className="border rounded-lg p-3"
                            />
                        </div>
                    </section>

                    {/* ============================================ */}
                    {/* METHOD 1: Using Component (Simpler)         */}
                    {/* ============================================ */}
                    <section className="mb-6">
                        <BookingAddons
                            propertyId={propertyId}
                            checkInDate={checkInDate}
                            checkOutDate={checkOutDate}
                            onAddonsChange={(addons) => {
                                const total = addons.reduce((sum, item) => sum + item.totalPrice, 0);
                                setPricing((prev) => ({
                                    ...prev,
                                    addonsTotal: total,
                                    grandTotal: prev.roomTotal + prev.taxTotal + total,
                                }));
                            }}
                        />
                    </section>

                    {/* ============================================ */}
                    {/* METHOD 2: Using Hook (Custom UI)            */}
                    {/* Uncomment below and comment out METHOD 1    */}
                    {/* ============================================ */}
                    {/*
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Enhance Your Stay</h3>
            
            {addonsLoading && (
              <p className="text-gray-500">Loading add-ons...</p>
            )}

            {addonsError && (
              <p className="text-red-500">{addonsError}</p>
            )}

            {!addonsLoading && !addonsError && addons.length > 0 && (
              <div className="space-y-3">
                {addons.map((addon) => {
                  const selectedItem = selectedAddons.find(
                    (item) => item.addon._id === addon._id
                  );
                  const quantity = selectedItem?.quantity || 0;

                  return (
                    <div
                      key={addon._id}
                      className="border rounded-lg p-4 flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{addon.name}</h4>
                        {addon.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {addon.description}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {addon.categoryId && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {addon.categoryId.name}
                            </span>
                          )}
                          {addon.subcategoryId && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                              {addon.subcategoryId.name}
                            </span>
                          )}
                          {addon.variantId && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {addon.variantId.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <button
                          onClick={() => selectAddon(addon._id, Math.max(0, quantity - 1))}
                          className="w-8 h-8 rounded-full border hover:bg-gray-100"
                          disabled={quantity === 0}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">
                          {quantity}
                        </span>
                        <button
                          onClick={() => selectAddon(addon._id, quantity + 1)}
                          className="w-8 h-8 rounded-full border hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedAddons.length > 0 && (
              <div className="mt-4 pt-4 border-t flex justify-between">
                <button
                  onClick={clearAddons}
                  className="text-red-600 text-sm hover:underline"
                >
                  Clear All Add-ons
                </button>
                <span className="font-semibold">
                  Total: ${totalAddonsPrice.toFixed(2)}
                </span>
              </div>
            )}
          </section>
          */}

                    {/* Price Summary */}
                    <section className="border-t pt-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Price Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span>Room Total</span>
                                <span className="font-medium">
                                    ${pricing.roomTotal.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Taxes & Fees</span>
                                <span>${pricing.taxTotal.toFixed(2)}</span>
                            </div>
                            {pricing.addonsTotal > 0 && (
                                <div className="flex justify-between text-blue-600">
                                    <span>Add-ons ({selectedAddons.length} items)</span>
                                    <span>${pricing.addonsTotal.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t pt-3 flex justify-between text-lg font-bold">
                                <span>Grand Total</span>
                                <span>${pricing.grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            disabled={!guestInfo.firstName || !guestInfo.email}
                        >
                            Complete Booking
                        </button>
                    </div>

                    {/* Debug Info (Remove in production) */}
                    <details className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <summary className="cursor-pointer font-semibold">
                            Debug Info (Remove in production)
                        </summary>
                        <pre className="mt-4 text-xs overflow-auto">
                            {JSON.stringify(
                                {
                                    selectedAddons: selectedAddons.map((item) => ({
                                        name: item.addon.name,
                                        quantity: item.quantity,
                                        price: item.totalPrice,
                                        category: item.addon.categoryId?.name,
                                        subcategory: item.addon.subcategoryId?.name,
                                        variant: item.addon.variantId?.name,
                                    })),
                                    pricing,
                                },
                                null,
                                2
                            )}
                        </pre>
                    </details>
                </div>
            </div>
        </div>
    );
}
