/**
 * Utility functions for handling reservation dates with reset time logic
 */

/**
 * Adjusts checkout date based on reset time
 * If checkout time exceeds reset time, moves to next day
 * @param checkoutDate - The actual checkout date/time
 * @param resetTime - The reset time in HH:mm format (e.g., "12:00")
 * @returns Adjusted checkout date
 */
export const adjustCheckoutDate = (checkoutDate: Date, resetTime: string): Date => {
  const checkout = new Date(checkoutDate);
  const [hours, minutes] = resetTime.split(':').map(Number);
  
  const resetDateTime = new Date(checkout);
  resetDateTime.setHours(hours, minutes, 0, 0);
  
  // If checkout time is after reset time, increment to next day
  if (checkout > resetDateTime) {
    const nextDay = new Date(checkout);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0); // Set to start of next day
    return nextDay;
  }
  
  return checkout;
};

/**
 * Sets time to property's reset time
 * @param date - The date to set time on
 * @param resetTime - The reset time in HH:mm format (e.g., "12:00")
 * @returns Date with reset time applied
 */
export const setResetTime = (date: Date, resetTime: string): Date => {
  const [hours, minutes] = resetTime.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
};

/**
 * Calculates number of nights between check-in and check-out
 * considering the reset time logic
 * @param checkIn - Check-in date/time
 * @param checkOut - Check-out date/time
 * @param resetTime - The reset time in HH:mm format
 * @returns Number of nights
 */
export const calculateNights = (
  checkIn: Date,
  checkOut: Date,
  resetTime: string
): number => {
  const adjustedCheckOut = adjustCheckoutDate(checkOut, resetTime);
  const checkInDate = new Date(checkIn);
  checkInDate.setHours(0, 0, 0, 0);
  
  const adjustedCheckOutDate = new Date(adjustedCheckOut);
  adjustedCheckOutDate.setHours(0, 0, 0, 0);
  
  const diffTime = adjustedCheckOutDate.getTime() - checkInDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(diffDays, 1); // At least 1 night
};

/**
 * Checks if current time exceeds reset time
 * @param currentTime - Current date/time
 * @param resetTime - The reset time in HH:mm format
 * @returns true if current time is after reset time
 */
export const isAfterResetTime = (currentTime: Date, resetTime: string): boolean => {
  const [hours, minutes] = resetTime.split(':').map(Number);
  const resetDateTime = new Date(currentTime);
  resetDateTime.setHours(hours, minutes, 0, 0);
  
  return currentTime > resetDateTime;
};

/**
 * Gets the effective date for billing purposes
 * If current time is after reset time, returns next day
 * @param currentTime - Current date/time
 * @param resetTime - The reset time in HH:mm format
 * @returns Effective billing date
 */
export const getEffectiveBillingDate = (currentTime: Date, resetTime: string): Date => {
  if (isAfterResetTime(currentTime, resetTime)) {
    const nextDay = new Date(currentTime);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);
    return nextDay;
  }
  
  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);
  return today;
};
