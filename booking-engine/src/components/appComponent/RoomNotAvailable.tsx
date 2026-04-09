// ==========================================
// Room Not Available Overlay Component
// ==========================================

import React from "react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RoomNotAvailableProps {
  isOpen: boolean;
  onGoBack: () => void;
}

export const RoomNotAvailable: React.FC<RoomNotAvailableProps> = ({
  isOpen,
  onGoBack,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 relative">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-xl font-tripswift-semibold text-gray-900 mb-2">
            {t("RoomsPage.noRoomsAvailableTitle")}
          </h3>
          <p className="text-gray-600 mb-6 font-tripswift-regular">
            {t("RoomsPage.noRoomsAvailableMessage")}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onGoBack}
              className="flex-1 bg-tripswift-blue hover:bg-tripswift-blue/90 text-white font-tripswift-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
            >
              {t("RoomsPage.goBack", { defaultValue: "Go Back" })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

