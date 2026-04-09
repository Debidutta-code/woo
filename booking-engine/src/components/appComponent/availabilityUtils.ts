// roomAvailabilityUtils.ts
import { Room } from '../../types/room.types';

export const getAvailabilityCount = (room: Room): number | null => {
  // Priority 1: Use availabilityCount if it exists and is not null
  if (room.availabilityCount !== null && room.availabilityCount !== undefined) {
    return room.availabilityCount;
  }

  // Priority 2: Check available_rooms
  if (room.available_rooms !== undefined && room.available_rooms !== null) {
    if (typeof room.available_rooms === 'number') {
      return room.available_rooms;
    }
    if (typeof room.available_rooms === 'string') {
      // If it's "Available" or similar string, return null (unlimited)
      const lowerStr = (room.available_rooms as string).toLowerCase().trim();
      if (lowerStr === 'available' || lowerStr === 'unlimited') {
        return null;
      }
      // Try to parse numeric strings
      const parsed = parseInt(room.available_rooms, 10);
      return isNaN(parsed) ? null : parsed;
    }
  }

  // Default: unlimited availability
  return null;
};

export const isRoomAvailable = (room: Room): boolean => {
  const availCount = getAvailabilityCount(room);
  
  // null means unlimited availability - available
  if (availCount === null) return true;
  
  // Check if count is greater than 0
  return availCount > 0;
};