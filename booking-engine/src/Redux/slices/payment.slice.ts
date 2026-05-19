// src/Redux/slices/payment.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from "js-cookie";

interface PaymentData {
  token: string;
  blockchain: string;
  amount: number;
  originalAmount?: number;
  promoCode?: string | null;
  promoName?: string | null;
  status: string;
  payment_id: string;
  initiatedTime?: string;
  address?: string;
  checkInDate?: string;
  checkOutDate?: string;
  hotelCode?: string;
  hotelName?: string;
  ratePlanCode?: string;
  numberOfRooms?: number;
  roomTypeCode?: string;
  currencyCode?: string;
  email?: string;
  phone?: string;
  guests?: any;
  paymentOption: string;
  taxValue?: number;
}

interface PaymentState {
  paymentData: PaymentData | null;
}

const cookieOptions = {
  sameSite: "strict" as const,
  path: "/",
};

const getInitialPaymentData = (): PaymentData | null => {
  if (typeof window === "undefined") return null;
  const data = Cookies.get("paymentData");
  try {
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to parse paymentData from cookies", e);
    return null;
  }
};

const initialState: PaymentState = {
  paymentData: getInitialPaymentData(),
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setPaymentData(state, action: PayloadAction<PaymentData>) {
      state.paymentData = action.payload;
      if (action.payload) {
        Cookies.set("paymentData", JSON.stringify(action.payload), cookieOptions);
      } else {
        Cookies.remove("paymentData", { path: "/" });
      }
    },
    clearPaymentData(state) {
      state.paymentData = null;
      Cookies.remove("paymentData", { path: "/" });
    },
  },
});

export const { setPaymentData, clearPaymentData } = paymentSlice.actions;
export default paymentSlice.reducer;