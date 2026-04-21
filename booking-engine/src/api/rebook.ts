// src/api/rebook.api.ts
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Check room availability
export const checkRoomAvailability = async (
  hotelCode: string,
  roomTypeCode: string,
  ratePlanCode:string,
  startDate: string,
  endDate: string
) => {
  const token = Cookies.get("accessToken");
  const response = await axios.get(`${API_BASE_URL}/booking/check/availability`, {
    params: {
      hotelCode,
      invTypeCode: roomTypeCode,
      ratePlanCode,
      startDate,
      endDate,
    },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    withCredentials: true,
  });

  // Validate response
  if (!response.data.message?.toLowerCase().includes("available")) {
    throw new Error("Room not available for selected dates");
  }

  return response.data;
};

// Get room price
export const getRoomPrice = async (
  hotelCode: string,
  roomTypeCode: string,
  ratePlanCode:string,
  startDate: string,
  endDate: string,
  noOfAdults: number,
  noOfChildrens: number,
  noOfInfants: number,
  noOfRooms: number,
  parsedAddons: any[] = []
) => {
  const token = Cookies.get("accessToken");
  const response = await axios.post(
    `${API_BASE_URL}/booking-engine/pricing/get-price`,
    {
      propertyCode: hotelCode,
      invTypeCode: roomTypeCode,
      ratePlanCode,
      startDate,
      endDate,
      noOfAdults,
      noOfChildren: noOfChildrens,
      noOfRooms,
      childAges: [],
      guestDistribution: [{ adults: noOfAdults, children: noOfChildrens, childAges: [] }],
      promoCode: "",
      ...(parsedAddons.length > 0 && { parsedAddons }),
    },
    { withCredentials: true }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to get price");
  }

  return response.data.data;
};