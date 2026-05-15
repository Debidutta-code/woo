"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CheckCircle2, Gift, UserPlus, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface LoyaltyField {
  id: string;
  fieldName: string;
  required: boolean;
}

interface LoyaltyConfig {
  discountType: string;
  discountValue: number;
  currencyCode: string;
  discountImage: string | null;
  terms: Array<{ id: string; text: string }>;
  specialTerms: Array<{ id: string; title: string; subTitle: string | null }>;
  fields: LoyaltyField[];
}

interface LoyaltyJoinCardProps {
  propertyId: string;
  propertyName?: string;
}

export default function LoyaltyJoinCard({ propertyId, propertyName }: LoyaltyJoinCardProps) {
  const router = useRouter();
  const authUser = useSelector((state: any) => state.auth?.user);
  const [isLoading, setIsLoading] = useState(false);
  const [joinEnabled, setJoinEnabled] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const email = String(authUser?.email || "").trim();

  const summaryText = useMemo(() => {
    if (!config) return "Member-Only Rates";
    if (config.discountType === "percentage") {
      return `${config.discountValue}% members only discount`;
    }
    return `${config.currencyCode} ${config.discountValue} members only discount`;
  }, [config]);

  const headlineText = useMemo(() => {
    const special = config?.specialTerms?.[0];
    if (special?.title) return special.title;
    return "Designed to reward you with special privileges, personalized experiences & unbeatable value every time you stay with us.";
  }, [config]);

  const benefitText = useMemo(() => {
    if (config?.terms?.length) {
      return config.terms.map((t) => `✅ ${t.text}`).join(" ");
    }
    return "✅ Exclusive discounted room rates ✅ Early check-in & late check-out (Subject to availability) ✅ Dining & spa discounts ✅ Priority support";
  }, [config]);

  const autoApplyText = useMemo(() => {
    if (!config) return "Auto-applied on eligible bookings";
    if (config.discountType === "percentage") {
      return `Auto-applied ${config.discountValue}% on eligible bookings`;
    }
    return `Auto-applied ${config.currencyCode} ${config.discountValue} on eligible bookings`;
  }, [config]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/extranet/loyalty/guest/customer-config/${propertyId}`,
        { withCredentials: true }
      );
      if (!response?.data?.success || !response?.data?.data) {
        toast.error(response?.data?.message || "Loyalty details unavailable");
        return null;
      }

      const cfg = response.data.data as LoyaltyConfig;
      setConfig(cfg);
      setFieldValues((prev) => {
        const next = { ...prev };
        (cfg.fields || []).forEach((field) => {
          if (next[field.fieldName] !== undefined) return;
          if (field.fieldName === "email") next[field.fieldName] = email;
          else next[field.fieldName] = "";
        });
        return next;
      });
      return cfg;
    } catch (_error) {
      toast.error("Failed to fetch loyalty details");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!propertyId || config) return;
    loadConfig();
  }, [propertyId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleJoinToggle = async (checked: boolean) => {
    setJoinEnabled(checked);
    if (!checked) {
      setShowJoinModal(false);
      return;
    }
    if (!email) {
      toast.error("Please login to join loyalty program");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    const cfg = config || (await loadConfig());
    if (cfg) {
      setShowJoinModal(true);
    }
  };

  const handleRegister = async () => {
    if (!email) {
      toast.error("Please login to join loyalty program");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    const cfg = config || (await loadConfig());
    if (!cfg) return;

    for (const field of cfg.fields || []) {
      if (field.required && !String(fieldValues[field.fieldName] || "").trim()) {
        toast.error(`${field.fieldName.replace(/_/g, " ")} is required`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/extranet/loyalty/guest/register`,
        {
          email,
          propertyId,
          metadata: {
            fields: fieldValues,
          },
        },
        { withCredentials: true }
      );

      if (response?.data?.success) {
        toast.success("Successfully joined loyalty program");
        setJoinEnabled(true);
        setShowJoinModal(false);
        return;
      }
      const msg = String(response?.data?.message || "");
      if (msg.toLowerCase().includes("already registered")) {
        toast.success("You are already a loyalty member");
        setJoinEnabled(true);
      } else {
        toast.error(msg || "Failed to join loyalty program");
      }
    } catch (error: any) {
      const apiMessage = String(
        error?.response?.data?.message || error?.message || ""
      );
      if (apiMessage.toLowerCase().includes("already registered")) {
        toast.success("You are already registered");
        setJoinEnabled(true);
        setShowJoinModal(false);
      } else {
        toast.error(apiMessage || "Failed to join loyalty program");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldLabel = (fieldName: string) => {
    const key = fieldName.toLowerCase();
    if (key === "first_name" || key === "firstname") return "Guest Name";
    if (key === "phone" || key === "mobile" || key === "mobile_number")
      return "Mobile Number";
    if (key === "email") return "Email Address";
    return fieldName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getFieldPlaceholder = (fieldName: string) => {
    const key = fieldName.toLowerCase();
    if (key === "first_name" || key === "firstname") return "Enter guest name";
    if (key === "phone" || key === "mobile" || key === "mobile_number")
      return "Enter mobile number";
    if (key === "email") return "your.email@example.com";
    return `Enter ${fieldName.replace(/_/g, " ")}`;
  };

  const sortedFields = useMemo(() => {
    if (!config?.fields?.length) return [];
    const priority = ["email", "first_name", "firstname", "phone", "mobile", "mobile_number"];
    return [...config.fields].sort((a, b) => {
      const ai = priority.indexOf(a.fieldName.toLowerCase());
      const bi = priority.indexOf(b.fieldName.toLowerCase());
      const av = ai === -1 ? 999 : ai;
      const bv = bi === -1 ? 999 : bi;
      return av - bv;
    });
  }, [config?.fields]);

  return (
    <div className="bg-tripswift-off-white rounded-xl border border-gray-200 p-4 mt-4 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5 space-y-4 self-center">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-1 text-tripswift-black/45" />
            <p className="text-sm leading-5 font-tripswift-medium text-tripswift-black">
              {summaryText}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-1 text-tripswift-black/45" />
            <p className="text-sm leading-5 font-tripswift-semibold text-tripswift-black">
              {headlineText}
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4 self-center">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-1 text-tripswift-black/45" />
            <p className="text-sm leading-5 text-tripswift-black">
              Member-Only Rates Enjoy special discounted prices you won&apos;t find anywhere else
              {" "}guaranteed best value when you book direct.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-1 text-tripswift-black/45" />
            <p className="text-sm leading-5 text-tripswift-black/95">
              {benefitText}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col items-end justify-between min-h-[120px] gap-3">
          {config?.discountImage ? (
            <img
              src={config.discountImage}
              alt="Loyalty Discount"
              className="w-12 h-12 object-contain rounded-lg border border-gray-200 bg-white p-1"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg border border-gray-200 bg-white" />
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-tripswift-semibold text-tripswift-black whitespace-nowrap">
              Join Program
            </span>
            <button
              type="button"
              onClick={() => handleJoinToggle(!joinEnabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${joinEnabled ? "bg-tripswift-blue" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${joinEnabled ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>

          <p className="text-sm text-tripswift-black/70 text-right">
            <span>Are you registered?</span>{" "}
            <span className="underline cursor-pointer font-tripswift-medium" onClick={() => {
              if (!email) {
                router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
                return;
              }
              handleJoinToggle(true);
            }}>
              Identify yourself
            </span>
          </p>
        </div>
      </div>

      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-4xl flex items-center gap-2 font-tripswift-semibold text-tripswift-black">
                  <UserPlus className="h-5 w-5 text-tripswift-blue" />
                  {`Join ${propertyName || "Loyalty Program"}`}
                </h3>
                <p className="text-sm text-tripswift-black/65 mt-1">
                  Register to unlock member-only discount and offers
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinEnabled(false);
                }}
                className="text-tripswift-black/60 hover:text-tripswift-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-lg border border-tripswift-blue/25 bg-tripswift-blue/5 p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-tripswift-blue text-white flex items-center justify-center">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-tripswift-semibold text-tripswift-black">
                    {summaryText}
                  </p>
                  <p className="text-sm text-tripswift-black/70">
                    {autoApplyText}
                  </p>
                </div>
              </div>

              {!!sortedFields.length && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedFields.map((field) => (
                    <div
                      key={field.id}
                      className={
                        field.fieldName.toLowerCase().includes("email")
                          ? "md:col-span-2"
                          : ""
                      }
                    >
                      <label className="text-sm font-tripswift-medium text-tripswift-black/90">
                        {getFieldLabel(field.fieldName)}
                        {field.required ? <span className="text-red-500"> *</span> : null}
                      </label>
                      <input
                        type={field.fieldName.toLowerCase().includes("email") ? "email" : "text"}
                        value={fieldValues[field.fieldName] || ""}
                        onChange={(e) =>
                          setFieldValues((prev) => ({
                            ...prev,
                            [field.fieldName]: e.target.value,
                          }))
                        }
                        placeholder={getFieldPlaceholder(field.fieldName)}
                        className="w-full mt-1 px-3 py-2.5 border border-tripswift-black/25 rounded-lg text-sm outline-none focus:ring-2 focus:ring-tripswift-blue/35 focus:border-tripswift-blue bg-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinEnabled(false);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-tripswift-black bg-white hover:bg-gray-50 font-tripswift-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-white font-tripswift-medium ${isLoading ? "bg-gray-400" : "bg-tripswift-blue hover:bg-tripswift-blue/90"}`}
                >
                  {isLoading ? "Please wait..." : "Register"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
