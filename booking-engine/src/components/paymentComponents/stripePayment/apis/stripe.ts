// api/onlinePayment.ts
import axios from 'axios';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;
export interface CreateCheckoutSessionParams {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms: number;
  roomTypeCode: string;
  hotelCode: string;
  ratePlanCode: string;
  userId: string;
  phone: string;
  guests: any[];
  roomId?: string;
  propertyId?: string;
  promoCode?: string | null;
  platform?: 'web' | 'mobile'; // ✅ Added platform field
}

export const createOnlinePaymentSession = async (
  bookingData: CreateCheckoutSessionParams,
  accessToken: string
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/payment/create-checkout-session`,
      bookingData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to create payment session'
    );
  }
};

export const getCheckoutSessionDetails = async (
  sessionId: string,
  accessToken?: string
) => {
  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (true) {

    }

    const response = await axios.get(
      `${API_BASE_URL}/payment/checkout-session/${sessionId}`,
      { headers }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to retrieve session details'
    );
  }
};