// api/razorpay.ts
import axios from 'axios';

/**
 * Create Razorpay Order
 */
export const createRazorpayOrder = async (
  orderData: {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: any;
  },
  token: string
) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/create-razorpay-order`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Create Razorpay Order Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to create Razorpay order');
  }
};

/**
 * Verify Razorpay Payment and Create Booking
 */
export const verifyRazorpayPayment = async (
  paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    bookingDetails: {
      provider: string;
      coupon?: string[];
      taxValue?: number;
      checkInDate: string;
      checkOutDate: string;
      hotelCode: string;
      hotelName: string;
      ratePlanCode: string;
      numberOfRooms: number;
      roomTypeCode: string;
      roomTotalPrice: number;
      currencyCode: string;
      email: string;
      phone: string;
      guests: any[];
      markupPrice?: number;
    };
  },
  token: string
) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/verify-razorpay-payment`,
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Verify Razorpay Payment Error:', error);
    throw new Error(error.response?.data?.message || 'Payment verification failed');
  }
};