// ==========================================
// Custom Hook for Room Data
// ==========================================

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Room,
  RatePlan,
  RoomResponse,
  GuestDetails,
  ConvertedRoom,
} from "../types/room.types";
import { useDispatch } from "react-redux";
import { setHotelCode } from "@/Redux/slices/pmsHotelCard.slice";
interface UseRoomsProps {
  propertyId: string | null;
  propertyCode: string;
  checkInDate: string;
  checkOutDate: string;
  guestDetails: GuestDetails | null;
}

export const useRooms = ({
  propertyId,
  propertyCode,
  checkInDate,
  checkOutDate,
  guestDetails,
}: UseRoomsProps) => {
  const dispatch = useDispatch();
  const [rooms, setRooms] = useState<RoomResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showRoomNotAvailable, setShowRoomNotAvailable] =
    useState<boolean>(false);
  const [qrCodeData, setQrCodeData] = useState({
    qrCode: null as string | null,
    couponCode: null as string | null,
  });
  const [unavailableRoomTypes, setUnavailableRoomTypes] = useState<
    { roomType: string; dates: string[] }[]
  >([]);

  const fetchRooms = useCallback(async () => {
    if (
      !propertyId ||
      !propertyCode ||
      !checkInDate ||
      !checkOutDate ||
      !guestDetails
    )
      return;

    setIsLoading(true);
    setShowRoomNotAvailable(false);

    try {
      // ✅ Use the correct booking-engine property details endpoint
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/filters/property`,
        {
          params: {
            id: propertyId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            rooms: guestDetails?.rooms || 1,
            adults: guestDetails?.guests || 1,
            children: guestDetails?.children || 0,
          },
        },
      );

      const propertyData = response.data.data;

      // Transform property rooms to match the expected RoomResponse format
      const transformedRooms: RoomResponse = {
        success: true,
        data: propertyData?.availableRooms?.length
          ? propertyData.availableRooms.map((room: any) => ({
              _id: room.id,
              room_name: room.roomName,
              room_type: room.roomType,
              room_size: room.roomSize,
              baseAmount: room.baseAmount, 
              room_unit: room.roomUnit,
              room_view: room.roomView,
              max_occupancy: room.maxOccupancy,
              max_number_of_adults: room.maxOccupancy,
              max_number_of_children: room.maxOccupancy,
              room_price: room.baseAmount,
              currency_code: room.currencyCode,
              ratePlans: room.ratePlans,
              image: room.images,
              video: room.video,
              amenities: room.amenities,
              available_rooms: room.availabilityCount,
              rate_plan_code: room.ratePlans?.[0]?.ratePlanCode || "",
              has_valid_rate: room.ratePlans?.length > 0,
            }))
          : [],
      };

      setRooms(transformedRooms);
      dispatch(setHotelCode(propertyCode));
    } catch (error) {
      console.error("Error fetching rooms:", error);
      if (axios.isAxiosError(error)) {
        setShowRoomNotAvailable(true);
      } else {
        setRooms({ success: true, data: [] });
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    propertyId,
    propertyCode,
    checkInDate,
    checkOutDate,
    guestDetails,
    dispatch,
  ]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    isLoading,
    showRoomNotAvailable,
    qrCodeData,
    unavailableRoomTypes,
    refetch: fetchRooms,
  };
};

// ==========================================
// Helper Hook for Room Booking
// ==========================================

interface UseBookRoomProps {
  propertyCode: string;
  checkInDate: string;
  checkOutDate: string;
  guestDetails: GuestDetails | null;
  setSelectedRoom: (room: ConvertedRoom | null) => void;
  setSelectedRatePlan: (ratePlan: any | null) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

export const useBookRoom = ({
  propertyCode,
  checkInDate,
  checkOutDate,
  guestDetails,
  setSelectedRoom,
  setSelectedRatePlan,
  setIsModalOpen,
}: UseBookRoomProps) => {
  const [isFetchingPrice, setIsFetchingPrice] = useState<boolean>(false);
  const [loadingRatePlans, setLoadingRatePlans] = useState<{
    [key: string]: boolean;
  }>({});

  const checkPriceBeforeBooking = useCallback(
    async (room: ConvertedRoom, ratePlan: RatePlan | Room, parsedAddons: any[] = [], includedAddons: string[] = []) => {
      if (!room.has_valid_rate) return false;

      const ratePlanCode =
        "ratePlanCode" in ratePlan
          ? ratePlan.ratePlanCode
          : ratePlan.rate_plan_code;
      const key = `${room._id}_${ratePlanCode}`;

      setLoadingRatePlans((prev) => ({ ...prev, [key]: true }));

      try {
        const finalPriceResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/get-price`,
          {
            propertyCode: propertyCode,
            invTypeCode: room.room_type,
            ratePlanCode,
            startDate: checkInDate,
            endDate: checkOutDate,
            noOfChildren: guestDetails?.children,
            noOfAdults: guestDetails?.guests,
            noOfRooms: guestDetails?.rooms,
            childAges: [],
            guestDistribution: [{ adults: guestDetails?.guests || 1, children: guestDetails?.children || 0, childAges: [] }],
            promoCode: "",
            ...(parsedAddons.length > 0 && { parsedAddons }),
            ...(includedAddons.length > 0 && { includedAddons }),
          },
          { withCredentials: true },
        );

        if (!finalPriceResponse.data.success) {
          throw new Error(
            finalPriceResponse.data.message || "Price check failed",
          );
        }

        return true;
      } catch (error: any) {
        throw new Error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to check room price",
        );
      } finally {
        setLoadingRatePlans((prev) => ({ ...prev, [key]: false }));
      }
    },
    [propertyCode, checkInDate, checkOutDate, guestDetails],
  );

  const handleBookNow = useCallback(
    async (
      room: ConvertedRoom,
      selectedRatePlan?: RatePlan | Room,
      _parsedAddons: any[] = []
    ) => {
      if (!room.has_valid_rate) return;
      const ratePlan =
        selectedRatePlan || (room.ratePlans && room.ratePlans[0]);
      if (!ratePlan) return;

      setSelectedRoom(room);
      setSelectedRatePlan(ratePlan);
      setIsModalOpen(true);
    },
    [
      setSelectedRoom,
      setSelectedRatePlan,
      setIsModalOpen,
    ],
  );

  return {
    isFetchingPrice,
    handleBookNow,
    checkPriceBeforeBooking,
  };
};
