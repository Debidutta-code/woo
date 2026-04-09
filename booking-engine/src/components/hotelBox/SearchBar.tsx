"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Users, Search } from "lucide-react";
import DateRange from "./DateRange";
import GuestBox from "./GuestBox";
import { useTranslation } from "react-i18next";
import { useSelector } from "../../Redux/store";
import toast from "react-hot-toast";

interface AvailabilitySearchWidgetProps {
  initialCheckin: string;
  initialCheckout: string;
  onCheckAvailability: (
    checkin: string,
    checkout: string,
    guestDetails?: any,
  ) => void;
  loading?: boolean;
  hotelCode: string;
  guestDetails?: any;
}

const AvailabilitySearchWidget: React.FC<AvailabilitySearchWidgetProps> = ({
  initialCheckin,
  initialCheckout,
  onCheckAvailability,
  loading = false,
  hotelCode,
}) => {
  const { t, i18n } = useTranslation();
  const { guestDetails } = useSelector((state) => state.hotel);
  const [localLoading, setLocalLoading] = useState(false);
  const [dates, setDates] = useState<string[] | undefined>([
    initialCheckin,
    initialCheckout,
  ]);

  useEffect(() => {
    if (initialCheckin && initialCheckout) {
      setDates([initialCheckin, initialCheckout]);
    }
  }, [initialCheckin, initialCheckout]);
  const handleCheckAvailability = async () => {
    if (!dates || dates.length !== 2) {
      console.warn("Dates missing");
      return;
    }

    setLocalLoading(true);
    try {
      await onCheckAvailability(dates[0], dates[1], guestDetails);
    } finally {
      setLocalLoading(false);
    }
  };
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-tripswift-black/5 p-3 font-noto-sans">
      <div className="flex flex-col gap-2 md:flex-row items-center md:gap-3.5">
        {/* Date Range */}
        <div className="w-full sm:w-auto sm:flex-1">
          <div className="relative group">
            <div
              className={`absolute inset-y-0 ${
                i18n.language === "ar" ? "right-3" : "left-3"
              } flex items-center pointer-events-none`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-tripswift-blue/10 transition-colors duration-300">
                <Calendar className="h-4 w-4 text-tripswift-black group-hover:text-tripswift-blue transition-colors duration-200 " />
              </div>
            </div>
            <div
              className={`bg-tripswift-off-white border border-tripswift-black/10 text-[16px] hover:border-tripswift-blue/30 rounded-md shadow-sm transition-all duration-200 h-11 ${
                i18n.language === "ar" ? "pr-12" : "pl-12"
              } flex items-center`}
            >
              <DateRange
                hotelCode={hotelCode}
                dates={dates}
                setDates={setDates}
              />
            </div>
          </div>
        </div>

        {/* Guest Box */}
        <div className="sm:w-full w-auto  sm:flex-1">
          <GuestBox />
        </div>

        {/* Check Availability Button */}
        <div className="w-full md:w-auto">
          <button
            type="button"
            disabled={localLoading}
            onClick={handleCheckAvailability}
            className="btn-tripswift-primary h-11 px-6 flex items-center justify-center gap-2"
          >
            {localLoading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Check Availability</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilitySearchWidget;
