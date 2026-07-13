// ==========================================
// Custom Hook for Property Data
// ==========================================

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { PropertyDetails } from "../types/room.types";

interface UsePropertyProps {
  propertyId: string | null;
  checkIn?: string;
  checkOut?: string;
}

export const useProperty = ({
  propertyId,
  checkIn,
  checkOut,
}: UsePropertyProps) => {
  const [propertyDetails, setPropertyDetails] =
    useState<PropertyDetails | null>(null);
  const [propertyCode, setPropertyCode] = useState<string>("");
  const [roomAmenities, setRoomAmenities] = useState<{ [key: string]: any }>(
    {},
  );
  const [isPropertyLoading, setIsPropertyLoading] = useState<boolean>(true);

  const fetchProperty = useCallback(async () => {
    if (!propertyId) return;

    setIsPropertyLoading(true);

    try {
      const propertyResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/filters/property`,
        {
          params: {
            id: propertyId,
            checkIn: checkIn || new Date().toISOString().split("T")[0],
            checkOut:
              checkOut ||
              new Date(Date.now() + 86400000).toISOString().split("T")[0],
            rooms: 1,
            adults: 1,
            children: 0,
          },
        },
      );
      const propDetails = propertyResponse.data.data;

      // Extract the nested propertyDetails if it exists
      const extractedPropertyDetails = propDetails?.availableRooms?.propertyDetails || propDetails;
      
      // Attach the rooms array so fetchAmenities can use it
      if (extractedPropertyDetails) {
        extractedPropertyDetails.availableRooms = propDetails?.availableRooms?.rooms || propDetails?.availableRooms || [];
      }

      setPropertyDetails(extractedPropertyDetails);
      setPropertyCode(propDetails.propertyCode || extractedPropertyDetails.propertyCode);
    } catch (error) {
      console.error("Error fetching property:", error);
    } finally {
      setIsPropertyLoading(false);
    }
  }, [propertyId, checkIn, checkOut]);

  const fetchAmenities = useCallback(async () => {
    // Wait for propertyDetails to be available
    if (!propertyDetails?.availableRooms) {
      return;
    }

    try {
      const amenitiesMap: { [key: string]: any } = {};
      propertyDetails.availableRooms.forEach((room: any) => {
        const roomType = room.roomType || "default";
        amenitiesMap[roomType] = room.amenities || [];
      });
      setRoomAmenities(amenitiesMap);
      console.log("Amenities loaded:", amenitiesMap);
    } catch (error) {
      console.error("Error fetching amenities:", error);
    }
  }, [propertyDetails]);

  const fetchAll = useCallback(async () => {
    await fetchProperty();
    // Wait a moment for state to update, then fetch amenities
    setTimeout(() => {
      fetchAmenities();
    }, 100);
  }, [fetchProperty, fetchAmenities]);

  useEffect(() => {
    if (propertyId) {
      fetchAll();
    }
  }, [propertyId, checkIn, checkOut]);

  return {
    propertyDetails,
    propertyCode,
    roomAmenities,
    isPropertyLoading,
    refetch: fetchAll,
  };
};
