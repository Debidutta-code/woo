// components/paymentComponents/PayOnlineFunction.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { CreditCard, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { CreateCheckoutSessionParams, createOnlinePaymentSession } from "./apis/stripe";
import { useDispatch } from "react-redux";
import { setPaymentMethod } from "@/Redux/slices/pmsHotelCard.slice";

interface PayOnlineFunctionProps {
  bookingDetails: {
    amount: number;
    currency: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    hotelName: string;
    hotelCode: string;
    ratePlanCode: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    rooms: number;
    guests: any[];
    userId: string;
    roomId?: string;
    propertyId?: string;
    promoCode?: string | null;
    promoCodeName?: string | null;
    originalAmount?: number;
  };
  accessToken: string;
}

const PayOnlineFunction: React.FC<PayOnlineFunctionProps> = ({
  bookingDetails,
  accessToken,
}) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPaymentMethod("payOnline"));
  }, [dispatch]);

  const handlePayNow = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      dispatch(setPaymentMethod("payOnline"));

      // Prepare data for checkout session
   const sessionData: CreateCheckoutSessionParams = {
        amount: bookingDetails.amount,
        currency: bookingDetails.currency,
        customerEmail: bookingDetails.email,
        customerName: `${bookingDetails.firstName} ${bookingDetails.lastName}`,
        hotelName: bookingDetails.hotelName,
        checkInDate: bookingDetails.checkIn,
        checkOutDate: bookingDetails.checkOut,
        numberOfRooms: bookingDetails.rooms,
        roomTypeCode: bookingDetails.roomType,
        hotelCode: bookingDetails.hotelCode,
        ratePlanCode: bookingDetails.ratePlanCode,
        userId: bookingDetails.userId,
        phone: bookingDetails.phone,
        guests: bookingDetails.guests,
        roomId: bookingDetails.roomId,
        propertyId: bookingDetails.propertyId,
        promoCode: bookingDetails.promoCode,
        platform: "web" as const, // ✅ Use 'as const' to make it a literal type
      };

      // Create checkout session
      const response = await createOnlinePaymentSession(
        sessionData,
        accessToken
      );

      if (response.success && response.sessionUrl) {
        // Redirect to Stripe Checkout
        window.location.href = response.sessionUrl;
      } else {
        throw new Error(response.message || "Failed to create payment session");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(
        err.message || t("Payment.PaymentComponents.PayOnline.genericError")
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Methods Preview */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* UPI */}
          {bookingDetails.currency.toLowerCase() === "inr" && (
            <div className="flex items-center gap-2 p-3 bg-tripswift-off-white rounded-lg border border-gray-200">
              <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600">UPI</span>
              </div>
              <div>
                <p className="text-xs font-tripswift-medium text-tripswift-black">
                  UPI
                </p>
                <p className="text-[10px] text-tripswift-black/60">
                  PhonePe, Paytm, GPay
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-tripswift-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            {t("Common.dismiss") || "Dismiss"}
          </button>
        </div>
      )}

      {/* Pay Now Button */}
      <button
        onClick={handlePayNow}
        disabled={isProcessing}
        className={`w-full py-4 px-6 rounded-lg font-tripswift-medium text-base transition-all duration-300 flex items-center justify-center gap-2 ${
          isProcessing
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-tripswift-blue text-tripswift-off-white hover:bg-tripswift-blue/90 hover:shadow-lg"
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>Pay Now</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Security Notice */}
      <p className="text-xs text-center text-tripswift-black/60">
        Your payment information is encrypted and secure. We never store your card details.
      </p>
    </div>
  );
};

export default PayOnlineFunction;
