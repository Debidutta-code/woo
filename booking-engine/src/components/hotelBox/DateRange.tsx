import React, { useState, useEffect } from "react";
import { DatePicker, Skeleton } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch } from "../../Redux/store";
import { setDateRangeDetails } from "../../Redux/slices/hotelcard.slice";
import { useTranslation } from "react-i18next";
import axios from "axios";

// Type for date range values
type DateRange = [Dayjs | null, Dayjs | null] | null;

// Type for availability data
interface DayAvailability {
  checkIn: string;
  minPriceFormat: string;
  available: boolean;
  currencyCode: string;
}

interface AvailabilityResponse {
  success: boolean;
  hotelCode: string;
  totalDays: number;
  days: DayAvailability[];
}

const { RangePicker } = DatePicker;

type Props = {
  dates: string[] | undefined;
  setDates: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  hotelCode?: string; // Optional hotel code
};

const DateRange: React.FC<Props> = ({ dates, setDates, hotelCode }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [availabilityData, setAvailabilityData] =
    useState<AvailabilityResponse | null>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  // Fetch availability data when hotelCode is provided
  useEffect(() => {
    if (hotelCode) {
      fetchAvailability();
    }
  }, [hotelCode]);

  const fetchAvailability = async () => {
    if (!hotelCode) return;

    setIsLoadingPrices(true);
    try {
      // Use today's date as the starting point for fetching availability
      const checkInDate = dayjs().format("YYYY-MM-DD");

      // ✅ Use the correct booking-engine endpoint
      const response = await axios.get<AvailabilityResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/filters/availability`,
        {
          params: {
            hotelCode: hotelCode,
            checkIn: checkInDate,
            checkOut: dayjs(checkInDate).add(30, "day").format("YYYY-MM-DD"), // Fetch 30 days availability
          },
        },
      );

      if (response.data.success) {
        setAvailabilityData(response.data);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Create a map of dates to prices for quick lookup
  const priceMap = React.useMemo(() => {
    if (!availabilityData?.days) return new Map();

    const map = new Map<
      string,
      { price: string; available: boolean; currencyCode: string }
    >();
    availabilityData.days.forEach((day) => {
      const dateKey = dayjs(day.checkIn).format("YYYY-MM-DD");
      map.set(dateKey, {
        price: day.minPriceFormat,
        available: day.available,
        currencyCode: day.currencyCode,
      });
    });
    return map;
  }, [availabilityData]);

  // Disable dates before today and unavailable dates
  const disabledDate = (current: Dayjs) => {
    if (current && current.isBefore(dayjs().startOf("day"))) {
      return true;
    }

    // If we have availability data, disable unavailable dates
    if (hotelCode && availabilityData) {
      const dateKey = current.format("YYYY-MM-DD");
      const dayData = priceMap.get(dateKey);
      return dayData ? !dayData.available : true;
    }

    return false;
  };

  // Handle date change
  const handleDateChange = (values: DateRange) => {
    if (values && values[0] && values[1]) {
      const formattedDates = values.map(
        (date) => date?.format("YYYY-MM-DD") || "",
      );
      setDates(formattedDates as string[]);
      dispatch(setDateRangeDetails({ dates: formattedDates as string[] }));
    } else {
      setDates(undefined);
      dispatch(setDateRangeDetails({ dates: [] }));
    }
  };

  // Convert string dates to Dayjs objects if they exist
  const dayjsDates: DateRange =
    dates && dates.length === 2 ? [dayjs(dates[0]), dayjs(dates[1])] : null;

  // Custom cell render to show prices
  const cellRender = (current: Dayjs | string | number) => {
    const currentDate = dayjs.isDayjs(current) ? current : dayjs(current);
    if (!hotelCode || !availabilityData) {
      return <div className="ant-picker-cell-inner">{currentDate.date()}</div>;
    }

    const dateKey = currentDate.format("YYYY-MM-DD");
    const dayData = priceMap.get(dateKey);

    if (!dayData) {
      return <div className="ant-picker-cell-inner">{currentDate.date()}</div>;
    }

    return (
      <div className="ant-picker-cell-inner flex flex-col items-center">
        <div className="text-sm">{currentDate.date()}</div>
        {dayData.available && (
          <div className="text-[10px] text-tripswift-blue font-tripswift-medium">
            {dayData.currencyCode === "USD"
              ? "$"
              : dayData.currencyCode === "INR"
                ? "₹"
                : "€"}
            {dayData.price}
          </div>
        )}
      </div>
    );
  };

  // Show skeleton while loading prices
  // if (hotelCode && isLoadingPrices) {
  //   return (
  //     <div className="w-full p-3">
  //       <Skeleton.Input active size="small" className="w-full mb-2" />
  //       <Skeleton active paragraph={{ rows: 2 }} />
  //     </div>
  //   );
  // }

  return (
    <div className="">
      <RangePicker
        value={dayjsDates}
        onChange={handleDateChange}
        disabledDate={disabledDate}
        suffixIcon={<></>}
        format="DD-MM-YYYY"
        picker="date"
        separator={
          <span className="lg:pr-8 px-2.5 text-tripswift-black/40">–</span>
        }
        allowClear={false}
        placeholder={[
          t("HotelBox.DateRange.checkInPlaceholder"),
          t("HotelBox.DateRange.checkOutPlaceholder"),
        ]}
        className="w-full flex items-center [&_.ant-picker-input]:flex-1 [&_.ant-picker-input]:text-center [&_.ant-picker-range-separator]:flex-none"
        style={{ border: "none", background: "transparent" }}
        cellRender={hotelCode ? cellRender : undefined}
        renderExtraFooter={() =>
          hotelCode && availabilityData ? (
            <div className="text-center text-xs text-gray-500 py-2 border-t">
              {t("HotelBox.DateRange.approximatePrices", {
                defaultValue: "Approximate prices for a 1-night stay",
              })}
            </div>
          ) : null
        }
      />
    </div>
  );
};

export default DateRange;
