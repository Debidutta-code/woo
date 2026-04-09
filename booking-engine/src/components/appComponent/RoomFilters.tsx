// ==========================================
// Room Filters Component
// ==========================================

import React from "react";
import { Search, Filter } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RoomFiltersProps {
  roomTypes: string[];
  filterType: string;
  searchQuery: string;
  onFilterChange: (type: string) => void;
  onSearchChange: (query: string) => void;
}

export const RoomFilters: React.FC<RoomFiltersProps> = ({
  roomTypes,
  filterType,
  searchQuery,
  onFilterChange,
  onSearchChange,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="bg-tripswift-off-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 mt-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        {/* Room type filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="text-gray-500 flex items-center mr-1 font-tripswift-medium">
            <Filter
              className={`h-4 w-4 ${i18n.language === "ar" ? "ml-1.5" : "mr-1.5"}`}
            />
            {t("RoomsPage.filter")}
          </div>
          {roomTypes.map((type) => (
            <button
              key={type}
              onClick={() => onFilterChange(type)}
              className={`px-3.5 py-1.5 rounded-lg text-sm whitespace-nowrap font-tripswift-medium transition-colors duration-300 ${
                filterType === type
                  ? "bg-tripswift-blue text-tripswift-off-white"
                  : "bg-gray-100 text-tripswift-black/70 hover:bg-gray-200"
              }`}
            >
              {type === "all" ? t("RoomsPage.allRooms") : type}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:max-w-xs">
          <div
            className={`absolute inset-y-0 ${i18n.language === "ar" ? "right-0 pr-3" : "left-0 pl-3"} flex items-center pointer-events-none`}
          >
            <Search className="h-4 w-4 text-tripswift-black/50" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("RoomsPage.searchRoomName")}
            className={`${i18n.language === "ar" ? "pr-10" : "pl-10"} w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-tripswift-regular bg-tripswift-off-white focus:outline-none focus:ring-2 focus:ring-tripswift-blue/30 focus:border-tripswift-blue transition-colors duration-300`}
          />
        </div>
      </div>
    </div>
  );
};

