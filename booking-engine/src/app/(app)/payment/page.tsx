"use client";

// import CheckAuthentication from "../../../components/checkAuthentication/CheckAuth";
import PayAtHotelFunction from "../../../components/paymentComponents/PayAtHotelFunction";
import PaymentOptionSelector from "../../../components/paymentComponents/PaymentOptionSelector";
import { formatDate, calculateNights } from "../../../utils/dateUtils";
// import { Elements } from "@stripe/react-stripe-js";
// import { loadStripe } from "@stripe/stripe-js";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Shield, CreditCard, CheckCircle, Clock, CalendarRange, Users, Loader2, ShieldCheck, Info, DollarSign } from "lucide-react";
import Link from "next/link";
import { RootState } from "@/Redux/store";
import { getAvailablePromoCodes, validatePromoCode } from "@/api/promo";
import { createReservation } from "@/api/booking";
import PromoCodeInput from "../../../components/paymentComponents/PromoCodeInput";
// import PayOnlineFunction from "@/components/paymentComponents/stripePayment/stripePayment";
import toast from "react-hot-toast";
import { ngeniusService } from "@/services/payment/negenius.service";
import { fikafiService } from "@/services/payment/fikafi.service";
import { setGuestDetails, setFinalAmount, setPaymentMethod, setOriginalAmount } from "@/Redux/slices/pmsHotelCard.slice";
import { setBookingCode, setBookingStatus, setFullBookingDetails } from "@/Redux/slices/bookingSlice";
import CheckAuthentication from "@/components/checkAuthentication/CheckAuth";

interface PaymentIntegration {
  id: string;
  name: string;
  isActive: boolean;
}

interface SelectedPaymentIntegrations {
  id: string;
  propertyId: string;
  paymentIntegrationId: string;
  isActive: boolean;
  outletId: string;
  sameDayRefund: boolean;
  paymentIntegration: PaymentIntegration;
}

interface PaymentDetails {
  id: string;
  payAtHotel: boolean;
  paymentGateway: boolean;
  propertyId: string;
  createdAt: string;
  updatedAt: string;
  selectedPaymentIntegrations: SelectedPaymentIntegrations | null;
}

interface AppliedPromo {
  code: string;
  codeName?: string;
  discount: number;
  finalAmount: number;
}

function PaymentPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [paymentOption, setPaymentOption] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  // const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [bookingCode, setBookingCodeValue] = useState<string>("");
  const [bookingConfirmedForFikafi, setBookingConfirmedForFikafi] = useState(false);
  const searchParams = useSearchParams();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const pmsHotelCard = useSelector((state: RootState) => state.pmsHotelCard);
  const guestDetails = useSelector(
    (state: RootState) => state.pmsHotelCard.guestDetails
  );
  const firstName = guestDetails?.guests?.[0]?.firstName || "";
  const lastName = guestDetails?.guests?.[0]?.lastName || "";
  const email = guestDetails?.email || "";
  const phone = guestDetails?.phone || "";
  const currency = (pmsHotelCard?.currency || "").toLowerCase();
  const hotelCode = pmsHotelCard?.hotelCode || "";
  const ratePlanCode = pmsHotelCard?.ratePlanCode || "";
  const roomType = pmsHotelCard?.roomType || "";
  const roomId = pmsHotelCard.room_id || "";
  const propertyId = pmsHotelCard.property_id || "";
  const checkIn = pmsHotelCard.checkInDate || "";
  const checkOut = pmsHotelCard.checkOutDate || "";
  const userId = authUser?._id || searchParams.get("userId") || "";
  const hotelName = pmsHotelCard?.hotelName || "";
  const amountFromRedux = useSelector(
    (state: RootState) => state.pmsHotelCard.amount || 0
  );
  const rooms = guestDetails?.rooms || 0;
  const adults = guestDetails?.adults || 0;
  const children = guestDetails?.children || 0;
  const infants = guestDetails?.infants || 0;
  const { i18n } = useTranslation();
  const amount = amountFromRedux ?? 0;
  const guests = useSelector(
    (state: any) => state.pmsHotelCard.guestDetails.guests
  );
  const nights = calculateNights(checkIn, checkOut);
  const numericAmount = amount || 0;
  const [availablePromos, setAvailablePromos] = useState<any[]>([]);
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const finalAmount = appliedPromo?.finalAmount ?? numericAmount;
  const totalTax = useSelector((state: RootState) => state.pmsHotelCard.totalTax);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoadingPaymentDetails, setIsLoadingPaymentDetails] = useState(false);
  const bookingDetails = {
    roomId,
    propertyId,
    amount: finalAmount,
    currency,
    checkIn,
    checkOut,
    firstName,
    lastName,
    email,
    phone,
    userId,
    hotelName,
    hotelCode,
    ratePlanCode,
    roomType,
    rooms,
    adults,
    children,
    infants,
    guests,
    paymentOption,
    totalTax: totalTax ?? undefined,
    originalAmount: amount,
    discountAmount: appliedPromo?.discount || 0,
    promoCode: appliedPromo?.code || null,
  };
  // console.log("Booking details:", JSON.stringify(bookingDetails, null, 2));

  useEffect(() => {
    const fetchPromoCodes = async () => {
      if (!propertyId || !accessToken) return;

      setIsLoadingPromos(true);
      try {
        const response = await getAvailablePromoCodes(propertyId, accessToken);

        // Handle the response structure
        if (response.success && response.data) {
          setAvailablePromos(response.data);
        } else {
          setAvailablePromos([]);
        }
      } catch (error) {
        console.error("Failed to fetch promo codes:", error);
        setAvailablePromos([]);
      } finally {
        setIsLoadingPromos(false);
      }
    };

    fetchPromoCodes();
  }, [propertyId, accessToken]);

  // Fetch payment details from API
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!propertyId) return;

      setIsLoadingPaymentDetails(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/property-management/property/${propertyId}/payment-details`
        );
        const data = await response.json();

        if (data.success && data.data) {
          setPaymentDetails(data.data);
        } else {
          setPaymentDetails(null);
        }
      } catch (error) {
        console.error("Failed to fetch payment details:", error);
        setPaymentDetails(null);
      } finally {
        setIsLoadingPaymentDetails(false);
      }
    };

    fetchPaymentDetails();
  }, [propertyId]);

  const handlePromoApply = async (code: string) => {
    if (!accessToken) {
      return { success: false, error: t("Payment.promoCode.loginRequired") };
    }

    try {
      const result = await validatePromoCode(
        {
          code,
          bookingAmount: amount,
          propertyId: propertyId,
        },
        accessToken
      );

      if (result.success && result.isValid && result.data?.discountAmount > 0) {
        const promoDetails = availablePromos.find(p => p.code === code);

        setAppliedPromo({
          code,
          codeName: promoDetails?.codeName,
          discount: result.data.discountAmount,
          finalAmount: result.data.finalAmount,
        });
        return {
          success: true,
          discount: result.data.discountAmount,
          finalAmount: result.data.finalAmount,
          message: result.message
        };
      } else {
        return {
          success: false,
          error: result.message || t("Payment.promoCode.invalid")
        };
      }
    } catch (err: any) {
      return {
        success: false,
        error: err.message || t("Payment.promoCode.genericError")
      };
    }
  };

  const handleNGeniusPayment = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      if (!finalAmount || finalAmount <= 0) {
        toast.error("Invalid booking amount. Please try again.");
        return;
      }

      if (!email || !checkIn || !checkOut) {
        toast.error("Missing required booking information.");
        return;
      }

      const currencyCode = currency.toUpperCase();
      const chargeAmount = finalAmount;
      const amountInSmallestUnit = Math.round(chargeAmount * 100);
      const gatewayCurrency = currencyCode === "USD" ? "AED" : currencyCode;

      toast.loading("Creating secure payment order...", { id: "ngenius-order" });

      // Resolve outletId from payment-details API response
      const outletId = paymentDetails?.selectedPaymentIntegrations?.outletId ?? null;

      const ngeniusPayload: {
        action: "SALE";
        amount: { currencyCode: string; value: number };
        merchantAttributes: {
          redirectUrl: string;
          skipConfirmationPage: boolean;
          cancelUrl: string;
          cancelText: string;
        };
        emailAddress: string;
        propertyCode?: string;
        outletId?: string;
      } = {
        action: "SALE",
        amount: {
          currencyCode: gatewayCurrency,
          value: amountInSmallestUnit,
        },
        merchantAttributes: {
          redirectUrl: `${window.location.origin}/paymentCallback`,
          skipConfirmationPage: true,
          cancelUrl: `${window.location.origin}/paymentCallback`,
          cancelText: "Return to Booking",
        },
        emailAddress: email.trim(),
        propertyCode: hotelCode || undefined,
      };

      // Only include outletId if it's actually present
      if (outletId) {
        ngeniusPayload.outletId = outletId;
      }

      const orderResponse = await ngeniusService.createOrder(ngeniusPayload);

      if (!orderResponse?.data?.orderReference || !orderResponse?.data?.paymentUrl) {
        throw new Error("Invalid response from payment gateway");
      }

      toast.dismiss("ngenius-order");

      const orderReference = orderResponse.data.orderReference;

      localStorage.setItem("ngeniusOrderRef", orderReference);
      localStorage.setItem(
        "pendingBookingData",
        JSON.stringify({
          data: {
            bookingDetails: {
              startDate: checkIn,
              endDate: checkOut,
              propertyCode: hotelCode,
              hotelName: hotelName,
              roomTypeCode: roomType,
              numberOfRooms: rooms || 1,
              finalPrice: {
                totalAmount: finalAmount,
              },
              promoCode: appliedPromo?.code || null,
              currency: currencyCode,
              email: email.trim(),
              phone: phone,
              guests: guests,
              guestDetails: guests,
              ratePlanCode: ratePlanCode,
              paymentMethod: "payment_gateway",
              bookingSource: "direct",
            },
            guestDetails: guests,
            bankDetails: paymentDetails || null,
          },
        })
      );

      toast.loading("Connecting to payment system...", { id: "socket-connect" });

      try {
        const { default: io } = await import('socket.io-client');

        const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          autoConnect: true,
        });

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Socket connection timeout'));
          }, 5000);

          socket.on('connect', () => {
            clearTimeout(timeout);
            const roomName = `payment:${orderReference}`;
            socket.emit('join-payment-room', roomName);
            resolve();
          });

          socket.on('connect_error', (error: any) => {
            clearTimeout(timeout);
            reject(error);
          });
        });

        toast.dismiss("socket-connect");
        localStorage.setItem("socketConnected", "true");

      } catch (socketError) {
        console.warn("Could not establish socket connection, will use fallback polling:", socketError);
        toast.dismiss("socket-connect");
      }

      toast.success("Redirecting to secure payment gateway...", {
        id: "redirect-payment",
        duration: 2000,
      });

      setTimeout(() => {
        window.location.href = orderResponse.data.paymentUrl;
      }, 1800);

    } catch (err: any) {
      console.error("N-Genius payment initiation failed:", err);
      toast.dismiss("ngenius-order");
      toast.dismiss("socket-connect");

      const message =
        err?.message?.includes("network") || err?.message?.includes("fetch")
          ? "Network error. Please check your connection and try again."
          : err?.message || "Failed to initiate payment. Please try again later.";

      toast.error(message, {
        id: "ngenius-error",
        duration: 6000,
      });

      setIsInitializing(false);
    }
  };

  const handleFikafiPayment = async () => {
    try {
      setIsInitializing(true);
      setError(null);

      if (!finalAmount || finalAmount <= 0) {
        toast.error("Invalid booking amount. Please try again.");
        return;
      }

      if (!email || !checkIn || !checkOut) {
        toast.error("Missing required booking information.");
        return;
      }

      const currencyCode = currency.toUpperCase();
      const chargeAmount = finalAmount;

      toast.loading("Creating reservation...", { id: "fikafi-reservation" });

      // Step 1: First create a reservation with status "pending"
      const reservationPayload = {
        data: {
          bookingDetails: {
            startDate: checkIn,
            endDate: checkOut,
            propertyCode: hotelCode,
            hotelName: hotelName,
            roomTypeCode: roomType,
            ratePlanCode: ratePlanCode,
            numberOfRooms: rooms || 1,
            finalPrice: {
              totalAmount: finalAmount,
              amountBeforeTax: finalAmount,
              taxedAmount: 0,
              totalAddonAmount: 0,
              totalPromotionAmount: 0,
              currentChargeableAmount: finalAmount,
              latterpayableAmount: 0,
              promoCodeDiscount: appliedPromo?.discount || 0,
              loyalityDiscount: 0,
              currencyCode: currencyCode,
              dailyPriceBrakeDown: [],
              taxBrakeDown: [],
              addonBrakeDown: [],
              promotionBrakeDown: [],
            },
            promoCode: appliedPromo?.code || null,
            currency: currencyCode,
            email: email.trim(),
            phone: phone,
            guests: guests,
            guestDetails: guests,
            paymentMethod: "payment_gateway",
            bookingSource: "direct",
          },
          guestDetails: guests,
          bankDetails: paymentDetails || null,
        },
      };

      const reservationResult = await createReservation(reservationPayload);

      if (!reservationResult?.data?.bookingCode) {
        throw new Error(reservationResult?.message || "Failed to create reservation");
      }

      const bookingRefNum = reservationResult.data.bookingCode;
      setBookingCodeValue(bookingRefNum);
      setBookingConfirmedForFikafi(true);

      // Update Redux state for payment-success page
      dispatch(setBookingCode(bookingRefNum));
      dispatch(setBookingStatus(reservationResult.data.bookingStatus || "pending"));
      dispatch(setFullBookingDetails(reservationResult.data));
      dispatch(setPaymentMethod("payment_gateway"));
      dispatch(setFinalAmount(finalAmount));
      dispatch(setOriginalAmount(amount));
      dispatch(setGuestDetails({
        guests: guests,
        rooms: rooms,
        adults: guests?.adults || 1,
        children: guests?.children || 0,
        email: email,
        phone: phone,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        bookingId: bookingRefNum,
        hotelName: hotelName,
        ratePlanCode: ratePlanCode,
        roomType: roomType,
      }));

      toast.dismiss("fikafi-reservation");
      toast.loading("Creating secure payment link...", { id: "fikafi-order" });

      // Step 2: Now call Fikafi API with the bookingRefNum from reservation
      const outletId = paymentDetails?.selectedPaymentIntegrations?.outletId ?? null;

      const fikafiPayload = {
        bookingRefNum: bookingRefNum,
        guestDetails: {
          guestName: `${firstName} ${lastName}`.trim(),
          phoneNum: phone || "",
          email: email.trim(),
          country: "IN"
        },
        bookingDetails: {
          propertyID: outletId || hotelCode || "",
          referenceDetails: bookingRefNum,
          communicationMode: email ? "EMAIL" as const : "WHATSAPP" as const,
          arrivalDate: checkIn,
          numberOfNights: nights || 1
        },
        paymentDetails: {
          currency: currencyCode,
          totalAmounts: chargeAmount,
          numOfPayments: 1,
          validity: "2 mins",
          payments: [
            {
              paymentNumber: 1,
              amount: chargeAmount,
              date: new Date().toISOString().split('T')[0]
            }
          ]
        },
        returnURL: {
          success_url: `${window.location.origin}/success?ref=${bookingRefNum}`,
          failed_url: `${window.location.origin}/failed?ref=${bookingRefNum}`
        },
        webhook: {
          payment_event_url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/fikafi/webhook/payment-event`
        }
      };

      const orderResponse = await fikafiService.createPaymentLink(fikafiPayload);

      if (!orderResponse?.data?.paymentLink) {
        throw new Error("Invalid response from payment gateway");
      }

      toast.dismiss("fikafi-order");

      const referenceNumber = orderResponse.data.referenceNumber;

      localStorage.setItem("fikafiOrderRef", referenceNumber);
      localStorage.setItem(
        "pendingBookingData",
        JSON.stringify({
          data: {
            bookingDetails: {
              startDate: checkIn,
              endDate: checkOut,
              propertyCode: hotelCode,
              hotelName: hotelName,
              roomTypeCode: roomType,
              numberOfRooms: rooms || 1,
              finalPrice: {
                totalAmount: finalAmount,
              },
              promoCode: appliedPromo?.code || null,
              currency: currencyCode,
              email: email.trim(),
              phone: phone,
              guests: guests,
              guestDetails: guests,
              ratePlanCode: ratePlanCode,
              paymentMethod: "payment_gateway",
              bookingSource: "direct",
            },
            guestDetails: guests,
            bankDetails: paymentDetails || null,
          },
        })
      );

      toast.success("Redirecting to secure payment gateway...", {
        id: "redirect-payment",
        duration: 2000,
      });

      setTimeout(() => {
        window.location.href = orderResponse.data.paymentLink;
      }, 1000);

    } catch (err: any) {
      console.error("Fikafi payment initiation failed:", err);
      toast.dismiss("fikafi-reservation");
      toast.dismiss("fikafi-order");
      toast.dismiss("socket-connect");

      const message =
        err?.message?.includes("network") || err?.message?.includes("fetch")
          ? "Network error. Please check your connection and try again."
          : err?.message || "Failed to initiate payment. Please try again later.";

      toast.error(message, {
        id: "fikafi-error",
        duration: 6000,
      });

      setIsInitializing(false);
    }
  };

  // Initialize payment when payment method is selected
  const handleInitializePayment = async (option: string) => {
    setIsInitializing(true);
    setError(null);

    try {
      // Initialize Stripe only for payAtHotel option
      // if (!stripePromise && option === 'payAtHotel') {
      //   if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
      //     throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
      //   }
      //   setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY));
      // }

      setPaymentOption(option);
    } catch (err: any) {
      console.error("Payment initialization error:", err);
      setError(err.response?.data?.message || "Failed to initialize payment method");
      setPaymentOption(null);
    } finally {
      setIsInitializing(false);
    }
  };

  // Add a loading or error state handler
  if (!searchParams || !amount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8] font-noto-sans">
        <div className="text-center p-8 bg-tripswift-off-white rounded-xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-tripswift-bold text-tripswift-black mb-4">{t('Payment.PaymentPageContent.invalidPayment.title')}</h2>
          <p className="text-tripswift-black/70 mb-6">{t('Payment.PaymentPageContent.invalidPayment.message')}</p>
          <Link href="/" className="btn-tripswift-primary py-3 px-8 rounded-lg inline-block transition-all duration-300 hover:shadow-lg">
            {t('Payment.PaymentPageContent.invalidPayment.returnToHomepage')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CheckAuthentication setLoading={setLoading}>
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8] relative font-noto-sans">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="">
          <div className="grid md:grid-cols-5 gap-8">
            {/* Payment Form - 3 columns */}
            <div className="md:col-span-3 space-y-6">
              {/* Booking Summary Card */}
              <div className="bg-tripswift-off-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-tripswift-blue p-4 text-tripswift-off-white">
                  <h2 className="font-tripswift-medium text-lg">{t('Payment.PaymentPageContent.bookingSummary.title')}</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between gap-6">
                    <div className={`flex items-start`}>
                      <CalendarRange className={`text-tripswift-blue flex-shrink-0`} size={20} />
                      <div className={`${i18n.language === "ar" ? "mr-3" : "ml-3"} flex-1 min-w-0 ${i18n.language === "es" ? "md:min-w-[200px]" : ""}`}>
                        <p className="text-sm text-tripswift-black/60">{t('Payment.PaymentPageContent.bookingSummary.stayDates')}</p>
                        <p className={`text-sm md:text-xs lg:text-sm text-tripswift-black/60 break-words leading-tight ${i18n.language === "ar" ? "text-right" : "text-left"}`}>
                          {i18n.language === "ar" ? (
                            <>
                              {formatDate(checkOut, { weekday: 'short', month: 'short', day: 'numeric' })} - {formatDate(checkIn, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </>
                          ) : (
                            <>
                              {formatDate(checkIn, { weekday: 'short', month: 'short', day: 'numeric' })} - {formatDate(checkOut, { weekday: 'short', month: 'short', day: 'numeric' })}
                            </>
                          )}
                        </p>
                        <p className="text-sm text-tripswift-black/60">
                          {nights} {nights === 1 ? t('Payment.PaymentPageContent.bookingSummary.night') : t('Payment.PaymentPageContent.bookingSummary.nights')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Users className="text-tripswift-blue flex-shrink-0" size={20} />
                      <div className={`${i18n.language === "ar" ? "mr-3" : "ml-3"} flex-1 min-w-0`}>
                        <p className="text-sm text-tripswift-black/60">{t('Payment.PaymentPageContent.bookingSummary.guests')}</p>

                        {/* Line 1: Rooms and Adults */}
                        <div className="text-sm text-tripswift-black/60 flex flex-wrap gap-x-1 gap-y-1">
                          <span>· {rooms} {rooms === 1 ? t('Payment.PaymentPageContent.bookingSummary.room') : t('Payment.PaymentPageContent.bookingSummary.rooms')}</span>
                          <span>· {adults} {adults === 1 ? t('Payment.PaymentPageContent.bookingSummary.adult') : t('Payment.PaymentPageContent.bookingSummary.adults')}</span>
                        </div>

                        {/* Line 2: Children and Infants */}
                        {(children > 0 || infants > 0) && (
                          <div className="text-sm text-tripswift-black/60 flex flex-wrap gap-x-1 gap-y-1 mt-1">
                            {children > 0 && (
                              <span>
                                · {children} {children === 1 ? t('Payment.PaymentPageContent.bookingSummary.child') : t('Payment.PaymentPageContent.bookingSummary.children')}
                              </span>
                            )}
                            {infants > 0 && (
                              <span>
                                · {infants} {infants === 1 ? t('Payment.PaymentPageContent.bookingSummary.infant') : t('Payment.PaymentPageContent.bookingSummary.infants')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start ">
                      <CheckCircle className="text-tripswift-blue flex-shrink-0" size={20} />
                      <div className={` ${i18n.language === "ar" ? "mr-3" : "ml-3"}`}>
                        <p className="text-sm text-tripswift-black/60">{t('Payment.PaymentPageContent.bookingSummary.guest')}</p>
                        <p className="text-sm text-tripswift-black/60 truncate max-w-[200px]">{guests[0]?.firstName} {guests[0]?.lastName}</p>
                        <p className="text-sm text-tripswift-black/60 truncate max-w-[200px]">{email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details Card */}
              <div className="bg-tripswift-off-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-tripswift-blue p-4 text-tripswift-off-white">
                  <h2 className="font-tripswift-medium text-lg">{t('Payment.PaymentPageContent.paymentMethod.title')}</h2>
                </div>
                <div className="p-6">
                  {/* Payment Option Selector */}
                  <div className="mb-6">
                    {isLoadingPaymentDetails ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-tripswift-blue mb-4" />
                        <p className="text-sm text-tripswift-black/70">
                          Loading payment options...
                        </p>
                      </div>
                    ) : (
                      <PaymentOptionSelector
                        selectedOption={paymentOption}
                        onChange={handleInitializePayment}
                        paymentDetails={paymentDetails}
                      />
                    )}
                  </div>

                  {/* Initializing State */}
                  {isInitializing && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-tripswift-blue mb-4" />
                      <p className="text-sm text-tripswift-black/70">
                        Initializing payment method...
                      </p>
                    </div>
                  )}

                  {/* Error State */}
                  {error && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 mb-6">
                      <p className="font-medium">Payment Error</p>
                      <p className="text-sm mt-1">{error}</p>
                      <button
                        onClick={() => {
                          setError(null);
                          setPaymentOption(null);
                        }}
                        className="mt-3 py-2 px-4 bg-tripswift-off-white border border-red-300 rounded-lg text-sm font-tripswift-medium hover:bg-red-50 transition-all duration-300"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {paymentOption && !isInitializing && !error && (
                    <div className="mt-6">
                      {paymentOption === "payAtHotel" ? (
                        <PayAtHotelFunction
                          bookingDetails={{
                            ...bookingDetails,
                            hotelName: bookingDetails.hotelName ?? undefined,
                            promoCode: appliedPromo?.code || null,
                            promoCodeName: appliedPromo?.codeName || null,
                            originalAmount: amount,
                          }}
                        />
                      ) : paymentOption === "payOnline" && paymentDetails?.selectedPaymentIntegrations?.paymentIntegration?.name === "network_global" ? (
                        // N-Genius Gateway UI - shown when Pay Online is selected with network_global gateway
                        // N-Genius Gateway UI
                        <div
                          className="mt-4 p-5 border rounded-xl shadow-sm"
                          style={{
                            backgroundColor: '#f8fafc',
                            borderColor: '#e2e8f0',
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4
                              className="font-semibold text-lg"
                              style={{ color: '#1e293b' }}
                            >
                              N-Genius Payment Gateway
                            </h4>
                            <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                              Secure
                            </div>
                          </div>

                          <p
                            className="text-sm mb-4 leading-relaxed"
                            style={{ color: '#475569' }}
                          >
                            You will be securely redirected to the N-Genius payment page to complete your transaction.
                          </p>

                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <CreditCard className="h-4 w-4" />
                              <span>Visa</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <CreditCard className="h-4 w-4" />
                              <span>Mastercard</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <CreditCard className="h-4 w-4" />
                              <span>American Express</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <CreditCard className="h-4 w-4" />
                              <span>Discover</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                              <ShieldCheck className="h-4 w-4 text-green-600" />
                              <span>3D Secure</span>
                            </div>
                          </div>

                          <div className="mt-2 p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                              You will be securely redirected to the payment page to complete your transaction.
                            </span>
                          </div>

                          <p className="mt-3 text-xs text-gray-500 italic">
                            Your payment is processed securely via N-Genius.
                          </p>

                          <button
                            onClick={handleNGeniusPayment}
                            disabled={isInitializing}
                            className="mt-4 w-full py-3 px-4 rounded-xl font-medium text-white transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              backgroundColor: '#1e293b',
                            }}
                          >
                            {isInitializing ? (
                              <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                              </div>
                            ) : (
                              `Pay ${currency.toUpperCase()} ${finalAmount.toFixed(2)}`
                            )}
                          </button>
                        </div>
                      ) : paymentOption === "payOnline" && paymentDetails?.selectedPaymentIntegrations?.paymentIntegration?.name === "fikafi" ? (
                        // Fikafi Gateway UI - shown when Pay Online is selected with fikafi gateway
                        <div
                          className="mt-4 p-5 border rounded-xl shadow-sm"
                          style={{
                            backgroundColor: '#f8fafc',
                            borderColor: '#e2e8f0',
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4
                              className="font-semibold text-lg"
                              style={{ color: '#1e293b' }}
                            >
                              Fikafi Payment Gateway
                            </h4>
                            <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800">
                              Secure
                            </div>
                          </div>

                          <p
                            className="text-sm mb-4 leading-relaxed"
                            style={{ color: '#475569' }}
                          >
                            You will be securely redirected to the Fikafi payment page to complete your transaction.
                          </p>

                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <CreditCard className="h-4 w-4" />
                              <span>Visa</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <CreditCard className="h-4 w-4" />
                              <span>Mastercard</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <CreditCard className="h-4 w-4" />
                              <span>American Express</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <CreditCard className="h-4 w-4" />
                              <span>Discover</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
                              <ShieldCheck className="h-4 w-4 text-green-600" />
                              <span>3D Secure</span>
                            </div>
                          </div>

                          <div className="mt-2 p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>
                              You will be securely redirected to the payment page to complete your transaction.
                            </span>
                          </div>

                          <p className="mt-3 text-xs text-gray-500 italic">
                            Your payment is processed securely via Fikafi.
                          </p>

                          {!bookingConfirmedForFikafi ? (
                            <button
                              onClick={handleFikafiPayment}
                              disabled={isInitializing}
                              className="mt-4 w-full py-3 px-4 rounded-xl font-medium text-white transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                backgroundColor: '#1e293b',
                              }}
                            >
                              {isInitializing ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing...
                                </div>
                              ) : (
                                `Confirm & Pay ${currency.toUpperCase()} ${finalAmount.toFixed(2)}`
                              )}
                            </button>
                          ) : (
                            <div className="mt-4 flex items-center justify-center gap-3 bg-gray-900 text-white text-sm font-medium py-3 px-6 rounded-lg">
                              <Loader2 className="w-4 h-4 animate-spin opacity-70" />
                              <span>Redirecting to Fikafi payment...</span>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary - 2 columns */}
            <div className="md:col-span-2">
              <div className="md:sticky md:top-6 flex flex-col space-y-6">
                {/* Price Details Card */}
                <div className="bg-tripswift-off-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-tripswift-blue p-4 text-tripswift-off-white">
                    <h2 className="font-tripswift-medium text-lg">{t('Payment.PaymentPageContent.priceDetails.title')}</h2>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Original Amount (only show if promo applied) */}
                      {appliedPromo && (
                        <div className="flex justify-between items-center text-tripswift-black/60">
                          <span className="text-sm">{t('Payment.PaymentPageContent.priceDetails.originalPrice')}</span>
                          <span className="text-sm line-through">
                            {currency.toUpperCase()} {numericAmount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Discount Applied */}
                      {appliedPromo && (
                        <div className="flex justify-between items-center text-green-600">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-tripswift-medium">
                              {t('Payment.PaymentPageContent.priceDetails.promoApplied')} ({appliedPromo.codeName || appliedPromo.code})
                            </span>
                          </div>
                          <span className="text-sm font-tripswift-medium">
                            -{currency.toUpperCase()} {appliedPromo.discount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Separator line if promo applied */}
                      {appliedPromo && (
                        <div className="border-t border-gray-200"></div>
                      )}

                      {/* Final Total */}
                      <div className="flex justify-between items-center">
                        <div className="font-tripswift-bold text-lg">{t('Payment.PaymentPageContent.priceDetails.total')}</div>
                        <div className="font-tripswift-bold text-xl text-tripswift-blue">
                          {currency.toUpperCase()} {finalAmount.toFixed(2)}
                        </div>
                      </div>

                      {/* Promo Code Input - Always visible */}
                      <div className="pt-4 border-t border-gray-200">
                        <PromoCodeInput
                          onApply={handlePromoApply}
                          disabled={!!appliedPromo}
                          availablePromos={availablePromos}
                          isLoadingPromos={isLoadingPromos}
                          currency={currency}
                          appliedPromoCode={appliedPromo?.code}
                          amount={amount}
                        />
                      </div>

                      {/* Remove Promo Button */}
                      {appliedPromo && (
                        <button
                          onClick={() => setAppliedPromo(null)}
                          className="w-full py-2 px-4 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                        >
                          {t('Payment.PaymentPageContent.priceDetails.removePromo')}
                        </button>
                      )}

                      {paymentOption === 'payAtHotel' && (
                        <div className="bg-blue-50 p-3 rounded-lg mt-4">
                          <div className="flex items-start">
                            <Clock className={`text-tripswift-blue flex-shrink-0 mt-0.5 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} size={16} />
                            <p className="text-sm text-tripswift-black/70">
                              {t('Payment.PaymentPageContent.priceDetails.payAtHotelInfo')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Security badges */}
                    <div className="mt-8 pt-4 border-t border-gray-200">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center">
                          <Shield className={`h-5 w-5 text-green-600 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                          <span className="text-sm text-tripswift-black/70">{t('Payment.PaymentPageContent.securityBadges.securePayments')}</span>
                        </div>
                        <div className="flex items-center">
                          <CreditCard className={`h-5 w-5 text-green-600 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                          <span className="text-sm text-tripswift-black/70">{t('Payment.PaymentPageContent.securityBadges.noCardStorage')}</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className={`h-5 w-5 text-green-600 ${i18n.language === "ar" ? "ml-2" : "mr-2"}`} />
                          <span className="text-sm text-tripswift-black/70">{t('Payment.PaymentPageContent.securityBadges.freeCancellation')}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center mt-6 space-x-4">
                        {/* <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/2560px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" className="h-6 opacity-70" /> */}
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 opacity-70" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 opacity-70" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Need Help Card (moved inside sticky container) */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-tripswift-bold text-tripswift-black mb-3">{t('Payment.PaymentPageContent.needHelp.title')}</h3>

                  <p className="text-tripswift-black/70 text-sm mb-4">
                    {t('Payment.PaymentPageContent.needHelp.message')}
                  </p>
                  <Link
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=business.alhajz@gmail.com&su=${encodeURIComponent(
                      "Support Request - Booking Assistance"
                    )}&body=${encodeURIComponent(
                      "Hello, I need help with my booking."
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-tripswift-blue font-tripswift-medium cursor-pointer hover:underline"
                  >
                    {t('Payment.PaymentPageContent.needHelp.contactSupport')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </CheckAuthentication>
  );
}

export default function Home() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F8] to-[#EAF2F8]">
        <div className="p-8 bg-tripswift-off-white rounded-xl shadow-xl max-w-md text-center font-noto-sans">
          <div className="w-16 h-16 border-t-4 border-b-4 border-tripswift-blue rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-tripswift-medium text-tripswift-black mb-3">{t('Payment.PaymentPageContent.loading.title')}</h2>
          <p className="text-tripswift-black/60">{t('Payment.PaymentPageContent.loading.message')}</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}