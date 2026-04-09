// transformUtils.ts - Utility functions for transforming room data and calculating prices

import { Room } from '../../types/room.types';

/**
 * Calculates the price for a given number of guests for a room.
 * Uses baseByGuestAmts if available, otherwise falls back to room_price.
 */
export const calculatePriceForGuests = (room: Room, guestCount: number): number => {
  if (!room.baseByGuestAmts || room.baseByGuestAmts.length === 0) {
    return room.room_price || 0;
  }

  // Find the rate for the exact guest count
  const exactMatch = room.baseByGuestAmts.find(amt => amt.numberOfGuests === guestCount);
  if (exactMatch) {
    return exactMatch.amountBeforeTax;
  }

  // If no exact match, find the closest lower guest count
  const lowerMatches = room.baseByGuestAmts
    .filter(amt => amt.numberOfGuests <= guestCount)
    .sort((a, b) => b.numberOfGuests - a.numberOfGuests);

  if (lowerMatches.length > 0) {
    let price = lowerMatches[0].amountBeforeTax;

    // Add additional guest charges if needed
    const extraGuests = guestCount - lowerMatches[0].numberOfGuests;
    if (extraGuests > 0 && room.additionalGuestAmounts) {
      // Assume additionalGuestAmounts are for adults, find the amount
      const adultCharge = room.additionalGuestAmounts.find((amt: { ageQualifyingCode: string; amount: number; _id: string }) => amt.ageQualifyingCode === 'ADULT' || amt.ageQualifyingCode === '10');
      if (adultCharge) {
        price += extraGuests * adultCharge.amount;
      }
    }

    return price;
  }

  // Fallback to room_price
  return room.room_price || 0;
};

/**
 * Finds the lowest price among an array of rooms for a given guest count.
 */
export const findLowestPrice = (rooms: Room[], guestCount: number): number => {
  if (!rooms || rooms.length === 0) return 0;

  const prices = rooms.map(room => calculatePriceForGuests(room, guestCount));
  return Math.min(...prices);
};

/**
 * Finds the highest price among an array of rooms for a given guest count.
 */
export const findHighestPrice = (rooms: Room[], guestCount: number): number => {
  if (!rooms || rooms.length === 0) return 0;

  const prices = rooms.map(room => calculatePriceForGuests(room, guestCount));
  return Math.max(...prices);
};

/**
 * Calculates the discount percentage between two prices.
 */
export const calculateDiscountPercentage = (originalPrice: number, discountedPrice: number): number => {
  if (originalPrice <= 0) return 0;
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.round(discount);
};

/**
 * Checks if a rate plan offers free cancellation based on the rate plan code.
 */
export const isFreeCancellation = (ratePlanCode?: string): boolean => {
  if (!ratePlanCode) return false;
  const code = ratePlanCode.toLowerCase();
  // Consider it free cancellation if it doesn't contain 'non-refundable' or 'nonrefundable'
  return !code.includes('non-refundable') && !code.includes('nonrefundable');
};

/**
 * Formats a currency amount with the currency code.
 */
export const formatCurrency = (amount: number, currencyCode: string): string => {
  return `${currencyCode} ${amount.toFixed(2)}`;
};