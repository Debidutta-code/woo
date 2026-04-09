"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { useDispatch } from "@/Redux/store";
import { setGuestDetails } from "@/Redux/slices/hotelcard.slice";
import dayjs from "dayjs";

const TRAVELER_PRESETS = [
    { id: "solo", label: "Solo traveler", rooms: 1, adults: 1, children: 0, expandable: false },
    { id: "couple", label: "Couple/Pair", rooms: 1, adults: 2, children: 0, expandable: false },
    { id: "family", label: "Family travelers", rooms: 1, adults: 2, children: 0, expandable: true },
    { id: "group", label: "Group travelers", rooms: 1, adults: 4, children: 0, expandable: true },
    { id: "business", label: "Business travelers", rooms: 1, adults: 1, children: 0, expandable: true },
] as const;

export interface GuestBoxProps {
    isOpen?: boolean;
    onToggle?: () => void;
    onChange?: (details: { rooms: number; adults: number; children: number }) => void;
    autoOpen?: boolean;
}

const GuestBox: React.FC<GuestBoxProps> = ({ isOpen: controlledOpen, onToggle, onChange, autoOpen }) => {
    const dispatch = useDispatch();
    const [childAges, setChildAges] = useState<number[]>([]);   // e.g. [5, 8]
    const [infantAges, setInfantAges] = useState<number[]>([]); // e.g. [1]
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const [selectedPreset, setSelectedPreset] = useState<string>("couple");
    const [rooms, setRooms] = useState(1);
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);

    const triggerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentPreset = TRAVELER_PRESETS.find(p => p.id === selectedPreset);
    const showRightPanel = isOpen && currentPreset?.expandable;

    const handleToggle = () => {
        onToggle?.() || setInternalOpen(prev => !prev);
    };

    const close = () => {
        onToggle?.() || setInternalOpen(false);
    };

    useEffect(() => {
        if (autoOpen) {
            close();
        }

    }, [autoOpen])


    // Click outside & Escape to close
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                triggerRef.current &&
                dropdownRef.current &&
                !triggerRef.current.contains(e.target as Node) &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                close();
            }
        };

        const handleEscape = (e: KeyboardEvent) => e.key === "Escape" && close();

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    // Notify parent
    useEffect(() => {
        onChange?.({ rooms, adults, children });
    }, [rooms, adults, children, onChange]);

    const handlePresetClick = (preset: typeof TRAVELER_PRESETS[number]) => {
        setSelectedPreset(preset.id);
        setRooms(preset.rooms);
        setAdults(preset.adults);
        setChildren(preset.children);

        // For solo & couple → instantly apply and close dropdown (optional but feels great)
        if (!preset.expandable) {
            setTimeout(() => close(), 150);
        }
    };

    const inc = (
        setter: React.Dispatch<React.SetStateAction<number>>,
        val: number,
        min = 0,
        max?: number
    ) => {
        setter(prev => {
            const next = prev + val;
            if (next < min) return min;
            if (max !== undefined && next > max) return prev;
            return next;
        });
    };
    // Fixed function name
    const handlePreset = (preset: typeof TRAVELER_PRESETS[number]) => {
        setSelectedPreset(preset.id);
        setRooms(preset.rooms);
        setAdults(preset.adults);
        setChildren(preset.children);

        // Auto-close for solo & couple (feels instant and clean)
        if (!preset.expandable) {
            setTimeout(() => close(), 180);
        }
    };

    // Keep adults + children as “guests” for the old onChange callback
    const guests = adults + children;

    // Dispatch the full payload whenever relevant values change
    useEffect(() => {
        const guestData = {
            rooms,
            guests,                     // adults + children
            children,
            childAges,                  // array of numbers
            infants: infantAges.length,
            infantAges,                 // array of numbers
            childDOBs: childAges.map(age => dayjs().subtract(age, "year").format("YYYY-MM-DD")),
            infantDOBs: infantAges.map(age => dayjs().subtract(age, "year").format("YYYY-MM-DD")),
        };

        dispatch(setGuestDetails(guestData));
    }, [rooms, adults, children, childAges, infantAges, dispatch]);

    return (
        <div className="relative w-full max-w-sm">
            {/* Trigger Button */}
            <div
                ref={triggerRef}
                onClick={handleToggle}
                className="flex h-9 sm:h-10 md:h-11 cursor-pointer items-center justify-between rounded-lg px-2.5 sm:px-3 md:px-4 transition hover:shadow-sm"
            >
                <div className="text-xs sm:text-sm leading-tight min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">
                        {adults} {adults === 1 ? "adult" : "adults"}
                        {children > 0 && <span className="text-gray-600">, {children} child{children > 1 ? "ren" : ""}</span>}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500">{rooms} room{rooms > 1 ? "s" : ""}</div>
                </div>
                <ChevronDown className={`h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-gray-500 transition flex-shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute left-0 right-0 sm:left-auto sm:right-0 sm:w-auto top-full z-[9999] mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl transition-all duration-200"
                >
                    <div className="flex flex-col md:flex-row max-h-[70vh] sm:max-h-[80vh] md:max-h-none overflow-y-auto md:overflow-visible">
                        {/* Left: Preset List */}
                        <div className={`${showRightPanel ? 'w-full md:w-[220px] lg:w-[240px]' : 'w-full min-w-[280px] sm:min-w-[320px]'} py-1.5 sm:py-2`}>
                            {TRAVELER_PRESETS.map(preset => {
                                const selected = selectedPreset === preset.id;
                                return (
                                    <div
                                        key={preset.id}
                                        onClick={() => handlePreset(preset)}
                                        className={`flex cursor-pointer items-center justify-between px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 transition-colors active:bg-gray-100 ${selected
                                            ? "bg-tripswift-off-white text-tripswift-blue font-medium"
                                            : "hover:bg-gray-50"
                                            }`}
                                    >
                                        <div className="flex-1 min-w-0 mr-2">
                                            <div className="text-sm sm:text-base font-medium truncate">{preset.label}</div>
                                            <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                                {preset.rooms} room{preset.rooms > 1 ? "s" : ""}, {preset.adults} adult{preset.adults > 1 ? "s" : ""}
                                            </div>
                                        </div>
                                        {preset.expandable && (
                                            <ChevronRight className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-gray-400 flex-shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right: Customization Panel (only for expandable) */}
                        {showRightPanel && (
                            <div className="w-full md:w-[220px] lg:w-[240px] border-t md:border-t-0 md:border-l border-gray-200 bg-gray-50/30 p-3 sm:p-4 md:p-5">
                                <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-2.5">
                                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-tripswift-off-white flex-shrink-0">
                                        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-tripswift-blue" />
                                    </div>
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{currentPreset?.label}</h3>
                                </div>

                                <div className="space-y-3 sm:space-y-3.5">
                                    {[
                                        { label: "Rooms", value: rooms, set: setRooms, min: 1, max: 8 },
                                        { label: "Adults", value: adults, set: setAdults, min: 1 },
                                        { label: "Children", value: children, set: setChildren, min: 0 },
                                    ].map(({ label, value, set, min, max }) => (
                                        <div key={label} className="flex items-center justify-between gap-3">
                                            <div className="min-w-0 flex-shrink-0">
                                                <div className="text-lg sm:text-xl md:text-2xl font-bold text-tripswift-blue leading-none">{value}</div>
                                                <div className="text-xs sm:text-sm text-gray-600 mt-1">{label}</div>
                                            </div>
                                            <div className="flex gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => inc(set, -1, min)}
                                                    disabled={value <= min}
                                                    className="flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-gray-300 disabled:opacity-40 hover:bg-gray-100 active:bg-gray-200 disabled:hover:bg-white text-base sm:text-lg font-medium transition-colors touch-manipulation"
                                                    type="button"
                                                >
                                                    −
                                                </button>
                                                <button
                                                    onClick={() => inc(set, +1, min, max)}
                                                    disabled={max !== undefined && value >= max}
                                                    className="flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-tripswift-blue text-white hover:bg-tripswift-blue active:scale-95 disabled:opacity-40 disabled:hover:bg-tripswift-blue text-base sm:text-lg font-medium transition-all touch-manipulation"
                                                    type="button"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Child Ages Input Section */}
                                {children > 0 && (
                                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                                        <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                                            Children's ages (at time of travel)
                                        </div>
                                        <div className="space-y-2 sm:space-y-2.5">
                                            {Array.from({ length: children }).map((_, idx) => (
                                                <div key={idx} className="flex items-center gap-2 sm:gap-3">
                                                    <label className="text-xs sm:text-sm text-gray-600 w-14 sm:w-16 flex-shrink-0">
                                                        Child {idx + 1}
                                                    </label>
                                                    <select
                                                        value={childAges[idx] ?? 0}
                                                        onChange={(e) => {
                                                            const newAges = [...childAges];
                                                            newAges[idx] = parseInt(e.target.value);
                                                            setChildAges(newAges);
                                                        }}
                                                        className="flex-1 h-9 sm:h-10 text-xs sm:text-sm rounded-md border border-gray-300 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-tripswift-blue bg-white appearance-none cursor-pointer"
                                                    >
                                                        <option value={0}>Select age</option>
                                                        {Array.from({ length: 18 }, (_, i) => i).map(age => (
                                                            <option key={age} value={age}>
                                                                {age} {age === 1 ? 'year' : 'years'}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedPreset === "family" && (
                                    <div className="mt-3 sm:mt-4 rounded-lg bg-tripswift-off-white p-2.5 sm:p-3 text-[10px] sm:text-xs text-tripswift-blue leading-relaxed">
                                        💡 Add children to see family-friendly hotels and best prices
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuestBox;