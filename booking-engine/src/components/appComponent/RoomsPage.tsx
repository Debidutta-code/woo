"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "../../Redux/store";
import Cookies from "js-cookie";
import {
  setCheckInDate,
  setCheckOutDate,
  setCurrency,
  setRatePlanCode,
  setRoomType,
  setHotelCode,
  setHotelName,
} from "@/Redux/slices/pmsHotelCard.slice";
import { setGuestDetails } from "../../Redux/slices/hotelcard.slice";
import { useTranslation } from "react-i18next";

import { RoomCard, RoomData } from "../../components/appComponent/RoomCard";
import GuestInformationModal from "../../components/bookingComponents/GuestInformationModal";
import FullscreenGallery from "./FullscreenGallery";

import { useRooms } from "../../hooks/useRooms";
import { useProperty } from "../../hooks/useProperty";
import { useBookRoom } from "../../hooks/useRooms";

import { PropertyHeader } from "./PropertyHeader";
import { PropertyInfo } from "./PropertyInfo";
import { RoomFilters } from "./RoomFilters";
import { RoomNotAvailable } from "./RoomNotAvailable";
import { ReviewsModal } from "./ReviewsModal";

import {
  convertAmenities,
  getRoomTypes,
  filterRooms,
  formatRoomPrice,
  isRoomUnavailable,
} from "../../utils/roomHelpers";

import {
  Room,
  RatePlan,
  GuestDetails,
  ConvertedRoom,
} from "../../types/room.types";

import LoadingSkeleton from "../hotelListingComponents/LoadingSkeleton";
import { Bed } from "lucide-react";
import toast from "react-hot-toast";

const RoomsPage: React.FC = () => {
  const PENDING_BOOKING_KEY = "pendingBookingAction";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const {
    property_id: propertyId,
    checkInDate,
    checkOutDate,
  } = useSelector((state: any) => state.pmsHotelCard);
  const { guestDetails } = useSelector((state) => state.hotel);
  const authState = useSelector((state: any) => state.auth);

  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<ConvertedRoom | null>(null);
  const [selectedRatePlan, setSelectedRatePlan] = useState<
    RatePlan | Room | null
>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);
  const hasTriedBookingResumeRef = useRef(false);

  const { propertyDetails, propertyCode, roomAmenities, isPropertyLoading } =
    useProperty({ propertyId });

  const {
    rooms,
    isLoading: isRoomsLoading,
    showRoomNotAvailable,
    unavailableRoomTypes,
    refetch,
  } = useRooms({
    propertyId,
    propertyCode,
    checkInDate,
    checkOutDate,
    guestDetails: guestDetails as GuestDetails | null,
  });

  const { isFetchingPrice, handleBookNow } = useBookRoom({
    propertyCode,
    checkInDate,
    checkOutDate,
    guestDetails: guestDetails as GuestDetails | null,
    setSelectedRoom,
    setSelectedRatePlan,
    setIsModalOpen,
  });

  useEffect(() => {
    const roomsParam = searchParams.get("rooms");
    const adults = searchParams.get("adults");
    const children = searchParams.get("children");
    const infants = searchParams.get("infant");

    if (roomsParam || adults || children || infants) {
      dispatch(
        setGuestDetails({
          rooms: Number(roomsParam) || 1,
          guests: Number(adults) || 1,
          children: Number(children) || 0,
          infants: Number(infants) || 0,
          childAges: Array(Number(children) || 0).fill(0),
        })
      );
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    if (selectedRoom && propertyCode && propertyDetails) {
      dispatch(setCurrency(selectedRoom.currency_code));
      dispatch(setRatePlanCode(selectedRoom.rate_plan_code));
      dispatch(setRoomType(selectedRoom.room_type));
      dispatch(setHotelCode(propertyCode));
      dispatch(setHotelName(propertyDetails.propertyName));
    }
  }, [selectedRoom, propertyCode, propertyDetails, dispatch]);

  useEffect(() => {
    if (showRoomNotAvailable || isReviewsModalOpen || isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showRoomNotAvailable, isReviewsModalOpen, isModalOpen]);

  const roomTypes = useMemo(() => getRoomTypes(rooms?.data || null), [rooms]);

  const filteredRooms = useMemo(
    () => filterRooms(rooms?.data || null, filterType, searchQuery),
    [rooms, filterType, searchQuery]
  );

  const convertedRooms = useMemo(
    () => filteredRooms.map((room) => convertAmenities(room, roomAmenities, t)),
    [filteredRooms, roomAmenities, t]
  );

  // ✅ NEW: Simple handler that updates Redux and refetches rooms
  const handleCheckAvailability = async (
    checkin: string,
    checkout: string,
    guestDetailsData?: GuestDetails
  ) => {
    // Update Redux state
    dispatch(setCheckInDate(checkin));
    dispatch(setCheckOutDate(checkout));
    if (guestDetailsData) {
      dispatch(setGuestDetails(guestDetailsData));
    }

    // Refetch rooms with new dates/guests
    // The loading state is automatically handled by the useRooms hook
    return refetch();
  };

  const confirmBooking = (formData: any) => {
    router.push(`/payment`);
  };

  const getRatePlanCode = (ratePlan: RatePlan | Room | null): string => {
    if (!ratePlan) return "";
    if ("ratePlanCode" in ratePlan) {
      return ratePlan.ratePlanCode || "";
    }
    if ("rate_plan_code" in ratePlan) {
      return (ratePlan as Room).rate_plan_code || "";
    }
    return "";
  };

  const onBookNow = async (room: ConvertedRoom, ratePlan?: RatePlan | Room) => {
    const token = authState?.accessToken || Cookies.get("accessToken");
    const isAuthenticated = Boolean(token && (authState?.user || token));

    if (!isAuthenticated) {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      Cookies.set("redirectAfterLogin", currentPath);
      sessionStorage.setItem(
        PENDING_BOOKING_KEY,
        JSON.stringify({
          roomId: room?._id,
          ratePlanCode: getRatePlanCode(ratePlan || room?.ratePlans?.[0] || null),
          redirectPath: currentPath,
          createdAt: Date.now(),
        }),
      );
      toast.error(t("Navbar.pleaseLogin"));
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    try {
      await handleBookNow(room, ratePlan);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong!");
    }
  };

  useEffect(() => {
    if (hasTriedBookingResumeRef.current) return;
    if (isRoomsLoading || convertedRooms.length === 0 || isModalOpen) return;

    const token = authState?.accessToken || Cookies.get("accessToken");
    const isAuthenticated = Boolean(token && authState?.user);
    if (!isAuthenticated) return;

    const pendingActionRaw = sessionStorage.getItem(PENDING_BOOKING_KEY);
    if (!pendingActionRaw) return;

    const currentPath = `${window.location.pathname}${window.location.search}`;
    try {
      const pendingAction = JSON.parse(pendingActionRaw);
      const isExpired =
        typeof pendingAction?.createdAt === "number" &&
        Date.now() - pendingAction.createdAt > 30 * 60 * 1000;

      if (
        isExpired ||
        !pendingAction?.roomId ||
        (pendingAction?.redirectPath && pendingAction.redirectPath !== currentPath)
      ) {
        sessionStorage.removeItem(PENDING_BOOKING_KEY);
        hasTriedBookingResumeRef.current = true;
        return;
      }

      const selectedRoomForResume = convertedRooms.find(
        (room) => room._id === pendingAction.roomId,
      );

      if (!selectedRoomForResume) {
        sessionStorage.removeItem(PENDING_BOOKING_KEY);
        hasTriedBookingResumeRef.current = true;
        return;
      }

      const selectedRatePlanForResume =
        selectedRoomForResume.ratePlans?.find(
          (ratePlan) => ratePlan.ratePlanCode === pendingAction.ratePlanCode,
        ) || selectedRoomForResume.ratePlans?.[0];

      hasTriedBookingResumeRef.current = true;
      sessionStorage.removeItem(PENDING_BOOKING_KEY);

      handleBookNow(selectedRoomForResume, selectedRatePlanForResume).catch(
        () => {
          toast.error("Unable to resume booking automatically. Please try again.");
        },
      );
    } catch (_error) {
      sessionStorage.removeItem(PENDING_BOOKING_KEY);
      hasTriedBookingResumeRef.current = true;
    }
  }, [
    authState?.accessToken,
    authState?.user,
    convertedRooms,
    handleBookNow,
    isModalOpen,
    isRoomsLoading,
  ]);

  return (
    <div className="bg-[#F5F7FA] min-h-screen font-noto-sans relative">
      <RoomNotAvailable
        isOpen={showRoomNotAvailable}
        onGoBack={() => router.back()}
      />

      <PropertyHeader
        propertyDetails={propertyDetails}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        guestDetails={guestDetails}
        onCheckAvailability={handleCheckAvailability}
        isLoading={isRoomsLoading} // ✅ Use the hook's loading state directly
        propertyCode={propertyCode}
        onViewReviews={() => setIsReviewsModalOpen(true)}
        onGoBack={() => router.back()}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-6">
        <PropertyInfo propertyDetails={propertyDetails} isLoading={isPropertyLoading} />

        <RoomFilters
          roomTypes={roomTypes}
          filterType={filterType}
          searchQuery={searchQuery}
          onFilterChange={setFilterType}
          onSearchChange={setSearchQuery}
        />

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-section-heading">{t("RoomsPage.availableRooms")}</h2>
          <div className="text-sm font-tripswift-medium text-tripswift-black/70 bg-tripswift-blue/5 px-3.5 py-1.5 rounded-lg">
            {t("RoomsPage.showingRooms", {
              count: filteredRooms.length,
              defaultValue:
                filteredRooms.length > 1
                  ? "Showing {{count}} Rooms"
                  : "Showing {{count}} Room",
            })}
          </div>
        </div>

        {isRoomsLoading ? (
          <div className="space-y-4">
            <LoadingSkeleton type="room" count={3} />
            <div className="mt-2 text-center text-sm text-gray-500 font-tripswift-regular">
              {t("RoomsPage.loadingRoomsMessage", {
                defaultValue: "Loading available rooms...",
              })}
            </div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-tripswift-blue/10 rounded-full flex items-center justify-center mb-4">
              <Bed className="h-8 w-8 text-tripswift-blue" />
            </div>
            <h3 className="text-lg font-tripswift-semibold text-tripswift-black mb-2">
              {t("RoomsPage.noRoomsAvailableTitle")}
            </h3>
            <p className="text-description max-w-md mx-auto mb-6">
              {t("RoomsPage.noRoomsAvailableMessage")}
            </p>
            <button
              onClick={() => {
                setFilterType("all");
                setSearchQuery("");
              }}
              className="btn-tripswift-primary px-6 py-2.5 rounded-lg text-sm font-tripswift-medium transition-all duration-300"
            >
              {t("RoomsPage.clearFilters")}
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {convertedRooms.map((room) => {
              const unavailable = isRoomUnavailable(room, unavailableRoomTypes);
              const roomCardData: RoomData = {
                ...room,
                amenities: room.amenities,
              };

              return (
                <div
                  key={room._id}
                  className={`relative ${unavailable ? "blur-sm opacity-60" : ""
                    }`}
                >
                  <RoomCard
                    data={roomCardData}
                    ratePlans={room.ratePlans}
                    onBookNow={(ratePlan) => onBookNow(room, ratePlan)}
                    isLoadingPrice={isFetchingPrice}
                    guestDetails={guestDetails}
                    propertyCode={propertyCode}
                  />
                  {unavailable && (
                    <div className="absolute top-4 left-4 z-20 bg-gray-600 text-tripswift-off-white text-xs font-tripswift-semibold py-1 px-2.5 rounded-full flex items-center shadow-md">
                      {t("RoomsPage.RoomCard.notAvailable")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        propertyCode={propertyCode}
        propertyName={propertyDetails?.propertyName}
      />

      {propertyDetails?.images && propertyDetails.images.length > 0 && (
        <FullscreenGallery
          images={propertyDetails.images}
          isOpen={false}
          onClose={() => { }}
          initialIndex={0}
          propertyName={propertyDetails.propertyName}
        />
      )}

      <GuestInformationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedRoom={selectedRoom}
        selectedRateplan={getRatePlanCode(selectedRatePlan)}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onConfirmBooking={confirmBooking}
        guestData={guestDetails}
      />
    </div>
  );
};

export default RoomsPage;
