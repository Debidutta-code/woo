"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FaTimes,
  FaSpinner,
  FaShoppingCart,
  FaInfoCircle,
} from "react-icons/fa";
import { AvailableAddon, fetchAvailableAddons } from "../../api/addon";
import Image from "next/image";

interface AddonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyCode: string;
  roomCode?: string;
  ratePlanCode?: string;
  startDate: string;
  endDate: string;
  numberOfNights: number;
  currencyCode?: string;
  onAddonsSelected?: (selectedAddons: AvailableAddon[]) => void;
}

export const AddonsModal: React.FC<AddonsModalProps> = ({
  isOpen,
  onClose,
  propertyCode,
  ratePlanCode,
  startDate,
  endDate,
  currencyCode = "USD",
  onAddonsSelected,
}) => {
  const { t } = useTranslation();
  const [addons, setAddons] = useState<AvailableAddon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // quantity map: addonId -> count
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const groupedAddons = React.useMemo(() => {
    const groups: Record<string, AvailableAddon[]> = {};
    addons.forEach((addon) => {
      if (!groups[addon.addonId]) groups[addon.addonId] = [];
      groups[addon.addonId].push(addon);
    });
    return groups;
  }, [addons]);

  useEffect(() => {
    if (isOpen) fetchAddons();
  }, [isOpen, propertyCode, startDate, endDate, ratePlanCode]);

  const fetchAddons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAvailableAddons(
        propertyCode,
        startDate,
        endDate,
        ratePlanCode
      );
      setAddons(data);
    } catch (err: any) {
      setError(err.message || "Failed to load addons");
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = (addonId: string) => {
    setQuantities((prev) => ({ ...prev, [addonId]: (prev[addonId] || 0) + 1 }));
  };

  const handleDecrement = (addonId: string) => {
    setQuantities((prev) => {
      const current = prev[addonId] || 0;
      if (current <= 0) return prev;
      return { ...prev, [addonId]: current - 1 };
    });
  };

  const handleContinue = () => {
    const selected: AvailableAddon[] = [];
    Object.entries(quantities).forEach(([addonId, qty]) => {
      if (qty > 0) {
        const entries = groupedAddons[addonId] || [];
        for (let i = 0; i < qty; i++) {
          selected.push(...entries);
        }
      }
    });
    if (onAddonsSelected) onAddonsSelected(selected);
    onClose();
  };

  const totalSelected = Object.values(quantities).reduce(
    (sum, q) => sum + (q > 0 ? 1 : 0),
    0
  );

  const totalPrice = Object.entries(quantities).reduce((sum, [addonId, qty]) => {
    if (qty <= 0) return sum;
    const entries = groupedAddons[addonId] || [];
    const unitPrice = entries.reduce((acc, e) => acc + e.price, 0);
    return sum + unitPrice * qty;
  }, 0);

  // Rhythm label helper
  const getRhythmBadge = (rhythm: string) => {
    const r = rhythm?.toUpperCase() || "";
    if (r.includes("PERSON") && r.includes("NIGHT")) return "Per Person Per Night";
    if (r.includes("NIGHT")) return "Per Night";
    if (r.includes("STAY")) return "Per Stay";
    if (r.includes("PERSON")) return "Per Person";
    return rhythm.replace(/_/g, " ");
  };

  const getRhythmColor = (rhythm: string) => {
    const r = rhythm?.toUpperCase() || "";
    if (r.includes("PERSON") && r.includes("NIGHT"))
      return { bg: "#FFF3E0", color: "#E65100" };
    if (r.includes("NIGHT")) return { bg: "#E8F5E9", color: "#2E7D32" };
    if (r.includes("STAY")) return { bg: "#EDE7F6", color: "#4527A0" };
    return { bg: "#E3F2FD", color: "#1565C0" };
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col"
        style={{ maxWidth: 820, maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #1E90FF 0%, #0056D2 100%)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 7H4C2.9 7 2 7.9 2 9v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"
                  stroke="white"
                  strokeWidth="1.8"
                  fill="none"
                />
                <path
                  d="M16 3H8C6.9 3 6 3.9 6 5v2h12V5c0-1.1-.9-2-2-2z"
                  stroke="white"
                  strokeWidth="1.8"
                  fill="none"
                />
                <path d="M12 12v4M10 14h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                Enhance Your Stay
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Select optional add-ons to make your stay even more memorable
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 ml-4 flex-shrink-0"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <FaSpinner className="animate-spin h-7 w-7 text-blue-600 mr-3" />
              <span className="text-gray-500 text-sm">Loading add-ons…</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={fetchAddons}
                className="mt-2 text-red-600 hover:text-red-700 text-xs font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && addons.length === 0 && (
            <div className="text-center py-16">
              <FaShoppingCart className="h-12 w-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                No add-ons available for these dates
              </p>
            </div>
          )}

          {!loading && !error && addons.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(groupedAddons).map(([addonId, addonEntries]) => {
                const first = addonEntries[0];
                const qty = quantities[addonId] || 0;
                const unitPrice = addonEntries.reduce(
                  (sum, e) => sum + e.price,
                  0
                );
                const rhythm = first.addon.postingRhythm || "";
                const badgeLabel = getRhythmBadge(rhythm);
                const badgeStyle = getRhythmColor(rhythm);

                // Date label (first date in entries)
                const dateLabel = first.date
                  ? new Date(first.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : null;

                return (
                  <div
                    key={addonId}
                    className="border rounded-2xl overflow-hidden transition-all"
                    style={{
                      borderColor: qty > 0 ? "#1E90FF" : "#E5E7EB",
                      boxShadow:
                        qty > 0
                          ? "0 0 0 2px rgba(30,144,255,0.15)"
                          : "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Top section: image + info */}
                    <div className="flex gap-0">
                      {/* Image area */}
                      {first.addon.images && first.addon.images.length > 0 ? (
                        <div
                          className="relative flex-shrink-0"
                          style={{ width: 110, height: 110 }}
                        >
                          <Image
                            src={first.addon.images[0]}
                            alt={first.addon.name}
                            fill
                            className="object-cover"
                            sizes="110px"
                          />
                        </div>
                      ) : null}

                      {/* Info */}
                      <div className="flex-1 px-4 pt-3 pb-2 min-w-0">
                        {/* Rhythm badge */}
                        <span
                          className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5"
                          style={{
                            background: badgeStyle.bg,
                            color: badgeStyle.color,
                          }}
                        >
                          {badgeLabel}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">
                          {first.addon.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {first.addon.description}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 mx-4" />

                    {/* Bottom: date + price + quantity */}
                    <div className="flex items-center justify-between px-4 py-3 gap-3">
                      <div>
                        {dateLabel && (
                          <p className="text-xs text-gray-500">{dateLabel}</p>
                        )}
                        <p className="text-xs font-semibold text-gray-700 mt-0.5">
                          {currencyCode} {unitPrice.toFixed(0)} each
                        </p>
                      </div>

                      {/* Quantity stepper */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecrement(addonId)}
                          disabled={qty === 0}
                          className="flex items-center justify-center rounded-full border-2 transition-all"
                          style={{
                            width: 30,
                            height: 30,
                            borderColor: qty > 0 ? "#1E90FF" : "#D1D5DB",
                            color: qty > 0 ? "#1E90FF" : "#9CA3AF",
                            cursor: qty === 0 ? "not-allowed" : "pointer",
                          }}
                        >
                          <span className="text-base leading-none font-bold">
                            −
                          </span>
                        </button>

                        <span
                          className="text-sm font-bold tabular-nums"
                          style={{
                            minWidth: 20,
                            textAlign: "center",
                            color: qty > 0 ? "#1E90FF" : "#374151",
                          }}
                        >
                          {qty}
                        </span>

                        <button
                          onClick={() => handleIncrement(addonId)}
                          className="flex items-center justify-center rounded-full text-white transition-all"
                          style={{
                            width: 30,
                            height: 30,
                            background: "#1E90FF",
                          }}
                        >
                          <span className="text-base leading-none font-bold">
                            +
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info notes */}
          {!loading && !error && addons.length > 0 && (
            <div className="mt-6 flex items-start gap-2 text-xs text-gray-400">
              <FaInfoCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>
                Add-on prices are per the listed posting rhythm. You can adjust
                quantities before confirming.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-4 bg-white">
          {/* Left: selection summary */}
          <div className="text-sm text-gray-500 min-w-0">
            {totalSelected === 0 ? (
              <span>No add-ons selected</span>
            ) : (
              <span className="font-semibold text-gray-800">
                {totalSelected} add-on{totalSelected !== 1 ? "s" : ""} ·{" "}
                <span className="text-blue-600">
                  {currencyCode} {totalPrice.toFixed(2)}
                </span>
              </span>
            )}
          </div>

          {/* Right: buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleContinue}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background:
                  totalSelected > 0
                    ? "linear-gradient(135deg, #1E90FF 0%, #0056D2 100%)"
                    : "#D1D5DB",
                cursor: totalSelected === 0 ? "default" : "pointer",
                boxShadow:
                  totalSelected > 0
                    ? "0 4px 14px rgba(30,144,255,0.35)"
                    : "none",
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddonsModal;