"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { setGuestDetails, setFinalAmount, setPromoCode, setOriginalAmount, setPromoCodeName } from '../../../Redux/slices/pmsHotelCard.slice';
import axios from 'axios';
import { useDispatch } from '@/Redux/store';
import { formatDate } from '@/utils/dateUtils';
import { createRazorpayOrder, verifyRazorpayPayment } from './apis/razorpayapi';

interface Guest {
  firstName: string;
  lastName: string;
  dob?: string;
  type?: "adult" | "child" | "infant";
}

interface PayWithRazorpayProps {
  bookingDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    roomId: string;
    propertyId: string;
    checkIn: string;
    checkOut: string;
    amount: number;
    originalAmount?: number;
    totalTax?: number;
    userId?: string;
    hotelName?: string;
    ratePlanCode?: string;
    roomType?: string;
    rooms?: number;
    adults?: number;
    children?: number;
    currency?: string;
    hotelCode?: string;
    guests: Guest[];
    promoCode?: string | null;
    promoCodeName?: string | null;
  };
}

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const PayWithRazorpay: React.FC<PayWithRazorpayProps> = ({ bookingDetails }) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const auth = useSelector((state: any) => state.auth);
  const token = auth?.token || auth?.accessToken;

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      setErrorMessage('Failed to load Razorpay. Please refresh the page.');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      setErrorMessage('Payment system is still loading. Please wait...');
      return;
    }

    if (!token) {
      setErrorMessage(t('Payment.PaymentComponents.PayAtHotelFunction.notLoggedInError') || 'Please log in to continue');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Step 1: Create Razorpay order using API helper
      const orderData = await createRazorpayOrder(
        {
          amount: bookingDetails.amount,
          currency: bookingDetails.currency?.toUpperCase() || 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            hotelCode: bookingDetails.hotelCode,
            hotelName: bookingDetails.hotelName,
            checkIn: bookingDetails.checkIn,
            checkOut: bookingDetails.checkOut,
            email: bookingDetails.email,
            phone: bookingDetails.phone,
          }
        },
        token
      );

      const { orderId, amount, currency } = orderData;
      console.log('✅ Razorpay order created:', orderId);

      // Step 2: Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: bookingDetails.hotelName || 'Hotel Booking',
        description: `Booking from ${formatDate(bookingDetails.checkIn)} to ${formatDate(bookingDetails.checkOut)}`,
        order_id: orderId,
        prefill: {
          name: `${bookingDetails.firstName} ${bookingDetails.lastName}`,
          email: bookingDetails.email,
          contact: bookingDetails.phone,
        },
        theme: {
          color: '#0066A1',
        },
        handler: async function (response: any) {
          console.log('💳 Payment completed:', response.razorpay_payment_id);
          
          // Step 3: Verify payment and create booking using API helper
          try {
            const bookingResponse = await verifyRazorpayPayment(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingDetails: {
                  provider: 'web',
                  coupon: bookingDetails.promoCode ? [bookingDetails.promoCode] : [],
                  taxValue: bookingDetails.totalTax,
                  checkInDate: bookingDetails.checkIn,
                  checkOutDate: bookingDetails.checkOut,
                  hotelCode: bookingDetails.hotelCode || '',
                  hotelName: bookingDetails.hotelName || '',
                  ratePlanCode: bookingDetails.ratePlanCode || '',
                  numberOfRooms: bookingDetails.rooms || 1,
                  roomTypeCode: bookingDetails.roomType || '',
                  roomTotalPrice: bookingDetails.amount,
                  currencyCode: bookingDetails.currency?.toUpperCase() || 'INR',
                  email: bookingDetails.email,
                  phone: bookingDetails.phone,
                  guests: bookingDetails.guests.map((guest: Guest) => ({
                    firstName: guest.firstName || '',
                    lastName: guest.lastName || '',
                    dob: guest.dob || '',
                    type: guest.type || ''
                  })),
                }
              },
              token
            );

            console.log('✅ Booking created:', bookingResponse?.savedBooking?.id);

            // Send SMS confirmation
            try {
              if (bookingDetails.phone && process.env.NEXT_PUBLIC_BACKEND_URL) {
                await axios.post(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/customers/send-sms`,
                  {
                    phone: bookingDetails.phone,
                    message: `Your booking at ${bookingDetails.hotelName || "our hotel"} is confirmed!
• Room Type: ${bookingDetails.roomType || "Standard"}
• Rooms: ${bookingDetails.rooms || 1}
• Check-in: ${formatDate(bookingDetails.checkIn)}
• Check-out: ${formatDate(bookingDetails.checkOut)}
• Total: ${formatCurrency(bookingDetails.amount, bookingDetails.currency || 'INR')}`
                  },
                  {
                    withCredentials: true,
                    timeout: 5000,
                    headers: {
                      'Content-Type': 'application/json',
                      ...(token && { 'Authorization': `Bearer ${token}` })
                    }
                  }
                );
              }
            } catch (smsError) {
              console.error('⚠️ SMS sending failed (non-critical):', smsError);
            }

            // Update Redux state
            dispatch(setOriginalAmount(bookingDetails.originalAmount || bookingDetails.amount));
            dispatch(setFinalAmount(bookingDetails.amount));
            dispatch(setPromoCode(bookingDetails.promoCode || null));
            dispatch(setPromoCodeName(bookingDetails.promoCodeName || null));
            dispatch(setGuestDetails({
              guests: bookingResponse?.savedBooking?.guests || bookingDetails.guests,
              rooms: bookingDetails.rooms || 1,
              adults: bookingDetails.adults || 1,
              children: bookingDetails.children || 0,
              email: bookingDetails.email,
              phone: bookingDetails.phone,
              checkInDate: bookingResponse?.savedBooking?.checkInDate,
              checkOutDate: bookingResponse?.savedBooking?.checkOutDate,
              bookingId: bookingResponse?.savedBooking?.id,
              hotelName: bookingDetails.hotelName,
              ratePlanCode: bookingDetails.ratePlanCode,
              roomType: bookingDetails.roomType,
            }));

            // Navigate to success page
            router.push('/payment-success');
            
          } catch (error: any) {
            console.error('❌ Payment verification error:', error);
            setErrorMessage(error.message || 'Payment verification failed');
            setIsLoading(false);
            
            // Show error to user
            alert('Payment verification failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
          }
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            setErrorMessage('Payment cancelled by user');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error: any) {
      console.error('❌ Payment initialization error:', error);
      setErrorMessage(error.message || 'Failed to initialize payment');
      setIsLoading(false);
    }
  };

  return (
    <div className="font-noto-sans">
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-tripswift-black font-tripswift-semibold mb-2">
          {t('Payment.PaymentComponents.PayWithRazorpay.title') || 'Pay with Razorpay'}
        </p>
        <p className="text-sm text-tripswift-black/70">
          {t('Payment.PaymentComponents.PayWithRazorpay.description') || 'Complete your payment securely using UPI, Cards, Net Banking, or Wallets.'}
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 border border-red-200 font-tripswift-regular flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="mb-6 flex items-start">
        <Shield className={`h-5 w-5 text-tripswift-blue flex-shrink-0 mb-1.5 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
        <p className="text-xs text-tripswift-black/70">
          {t('Payment.PaymentComponents.PayWithRazorpay.security') || 'Your payment is secured by Razorpay with 256-bit SSL encryption. We do not store your card details.'}
        </p>
      </div>

      <button
        type="button"
        onClick={handlePayment}
        disabled={isLoading || !scriptLoaded}
        className={`w-full py-3 px-4 rounded-lg transition-all duration-300 ${
          isLoading || !scriptLoaded
            ? 'bg-gray-300 cursor-not-allowed text-tripswift-black/50'
            : 'bg-tripswift-blue hover:bg-[#054B8F] text-tripswift-off-white'
        } font-tripswift-semibold`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            {t('Payment.PaymentComponents.PayWithRazorpay.processing') || 'Processing Payment...'}
          </span>
        ) : !scriptLoaded ? (
          t('Payment.PaymentComponents.PayWithRazorpay.loading') || 'Loading Payment System...'
        ) : (
          `${t('Payment.PaymentComponents.PayWithRazorpay.pay') || 'Pay'} ${formatCurrency(bookingDetails.amount, bookingDetails.currency || 'INR')}`
        )}
      </button>

      <div className="flex items-center justify-center mt-4">
        <img 
          src="https://razorpay.com/assets/razorpay-glyph.svg" 
          alt="Razorpay" 
          className="h-6 opacity-70"
        />
      </div>
    </div>
  );
};

export default PayWithRazorpay;