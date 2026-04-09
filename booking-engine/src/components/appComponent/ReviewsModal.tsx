// ==========================================
// Reviews Modal Component
// ==========================================

import React from "react";
import HotelReviewsSliding from "../reviewSystem/HotelReviews";

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyCode: string;
  propertyName?: string;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({
  isOpen,
  onClose,
  propertyCode,
  propertyName,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed rounded-lg top-0 right-0 h-full w-full sm:w-[600px] lg:w-[700px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Panel Header */}
        <div className="sticky top-0 bg-white rounded-lg px-6 py-5 z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 pr-10">
                Hotel Reviews
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
            >
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Panel Content - Scrollable */}
        <div className="overflow-y-auto h-full pb-20">
          <div className="px-6 py-4">
            {propertyCode && <HotelReviewsSliding hotelCode={propertyCode} />}
          </div>
        </div>
      </div>
    </>
  );
};
