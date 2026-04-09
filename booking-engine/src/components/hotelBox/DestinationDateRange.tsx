import React, { useMemo, useState, useEffect, use } from "react";
import { DatePicker } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch } from "../../Redux/store";
import { setDateRangeDetails } from "../../Redux/slices/hotelcard.slice";
import { useTranslation } from "react-i18next";

const { RangePicker } = DatePicker;

type Props = {
    dates: string[] | undefined;
    setDates: React.Dispatch<React.SetStateAction<string[] | undefined>>;
    onOpenChange?: (open: boolean) => void;
    autoOpen?: boolean;
};

// 🔥 normalize any date input into Dayjs
const toDayjs = (d: any): Dayjs | null => {
    const date = dayjs(d);
    return date.isValid() ? date : null;
};

const DateRange: React.FC<Props> = ({ dates, setDates, onOpenChange, autoOpen = false }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [hoveredDate, setHoveredDate] = useState<Dayjs | null>(null);
    const [tempStartDate, setTempStartDate] = useState<Dayjs | null>(null);
    const [tempEndDate, setTempEndDate] = useState<Dayjs | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    // Sync with autoOpen prop
    useEffect(() => {
        console.log("autoOpen:", autoOpen);
        setIsOpen(autoOpen);
    }, [autoOpen]);


    const disabledDate = (current: Dayjs) =>
        current && current.isBefore(dayjs().startOf("day"));

    // Convert incoming props dates → Dayjs
    const dayjsDates = useMemo<[Dayjs | null, Dayjs | null] | null>(() => {
        if (!dates || dates.length !== 2) return null;
        const s = toDayjs(dates[0]);
        const e = toDayjs(dates[1]);
        return s && e ? [s, e] : null;
    }, [dates]);

    useEffect(() => {
        if (dayjsDates) {
            setTempStartDate(null);
            setTempEndDate(null);
            setHoveredDate(null);
        }
    }, [dayjsDates]);

    // Save actual date
    const handleDateChange = (values: [Dayjs | null, Dayjs | null] | null) => {
        if (values?.[0] && values?.[1]) {
            const formatted = [
                values[0].format("YYYY-MM-DD"),
                values[1].format("YYYY-MM-DD"),
            ];
            setDates(formatted);
            dispatch(setDateRangeDetails({ dates: formatted }));

            // Close calendar after both dates selected
            setIsOpen(false);
            onOpenChange?.(false);
        } else {
            setDates(undefined);
            dispatch(setDateRangeDetails({ dates: [] }));
        }

        setTempStartDate(null);
        setTempEndDate(null);
        setHoveredDate(null);
    };

    const handleCalendarChange = (values: [Dayjs | null, Dayjs | null] | null) => {
        if (values) {
            setTempStartDate(values[0]);
            setTempEndDate(values[1]);
        } else {
            setTempStartDate(null);
            setTempEndDate(null);
        }
    };

    // PREVIEW LOGIC (hover update)
    const getPreviewRange = () => {
        // When no start date is selected yet, show hovered date as start
        if (!tempStartDate && !tempEndDate && hoveredDate) {
            return [hoveredDate, null];
        }

        // When start date is selected and hovering, show as end date
        if (tempStartDate && hoveredDate && hoveredDate.isAfter(tempStartDate)) {
            return [tempStartDate, hoveredDate];
        }

        // When only start date is selected
        if (tempStartDate && !tempEndDate) {
            return [tempStartDate, null];
        }

        // When both are selected
        if (tempStartDate && tempEndDate) {
            return [tempStartDate, tempEndDate];
        }

        // Fallback to existing dates
        return dayjsDates || [null, null];
    };

    const [previewStart, previewEnd] = getPreviewRange();

    const handleCellMouseEnter = (date: Dayjs) => {
        setHoveredDate(date);
    };

    const handleCellMouseLeave = () => {
        setHoveredDate(null);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        onOpenChange?.(open);
        if (!open) {
            // Reset temp states when closing
            setTempStartDate(null);
            setTempEndDate(null);
            setHoveredDate(null);
        }
    };

    // Custom header
    const CustomHeader = () => (
        <div className="px-6 py-4 text-center border-b border-gray-200 bg-white">
            <p className="text-sm text-gray-600 font-medium">
                Confirm your travel dates to see prices
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
                {previewStart && previewEnd ? (
                    <>
                        {previewStart.format("ddd, D MMM YYYY")} –{" "}
                        {previewEnd.format("ddd, D MMM YYYY")} (
                        {previewEnd.diff(previewStart, "day")} nights)
                    </>
                ) : previewStart ? (
                    `${previewStart.format("ddd, D MMM YYYY")} – Select end date`
                ) : (
                    "Select your travel dates"
                )}
            </p>
        </div>
    );

    return (
        <RangePicker
            value={dayjsDates}
            open={isOpen}
            onOpenChange={handleOpenChange}
            onChange={handleDateChange}
            onCalendarChange={handleCalendarChange}
            disabledDate={disabledDate}
            suffixIcon={<></>}
            format="DD-MM-YYYY"
            picker="date"
            allowClear={false}
            separator={<span className="lg:pr-8 px-2.5 text-tripswift-black/40">–</span>}
            placeholder={[
                t("HotelBox.DateRange.checkInPlaceholder"),
                t("HotelBox.DateRange.checkOutPlaceholder"),
            ]}
            className="w-full flex items-center [&_.ant-picker-input]:flex-1 [&_.ant-picker-input]:text-center [&_.ant-picker-range-separator]:flex-none text-black"
            style={{ border: "none", background: "transparent" }}
            cellRender={(current, info) => {
                if (info.type !== "date") return info.originNode;

                const date = toDayjs(current);
                if (!date) return info.originNode;

                return (
                    <div
                        className="ant-picker-cell-inner"
                        onMouseEnter={() => handleCellMouseEnter(date)}
                        onMouseLeave={handleCellMouseLeave}
                    >
                        {date.date()}
                    </div>
                );
            }}
            panelRender={(panel) => (
                <>
                    <CustomHeader />

                    {/* Wrap entire calendar to detect hover */}
                    <div
                        onMouseMove={(e: any) => {
                            const title = e?.target?.getAttribute("title");
                            if (!title) return;
                            const d = toDayjs(title);
                            if (d) handleCellMouseEnter(d);
                        }}
                        onMouseLeave={handleCellMouseLeave}
                    >
                        {panel}
                    </div>
                </>
            )}
        />
    );
};

export default DateRange;