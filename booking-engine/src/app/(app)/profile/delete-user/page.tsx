"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../../Redux/store";
import { deleteAccount } from "../../../../Redux/slices/auth.slice";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  User,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  ShieldAlert,
} from "lucide-react";

const DELETE_REASONS = [
  "I no longer need this account",
  "I found a better alternative",
  "Privacy concerns",
  "Too many emails/notifications",
  "Difficulty using the platform",
  "Account security concerns",
  "Other",
];

export default function DeleteUserPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user: authUser } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (authUser) {
      setFormData((prev) => ({
        ...prev,
        name: `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim(),
        email: authUser.email || "",
        phone: authUser.phone || "",
      }));
    }
  }, [authUser]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("Profile.delete.nameRequired", {
        defaultValue: "Name is required",
      });
    }
    if (!formData.email.trim()) {
      newErrors.email = t("Profile.delete.emailRequired", {
        defaultValue: "Email is required",
      });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("Profile.delete.emailInvalid", {
        defaultValue: "Please enter a valid email address",
      });
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t("Profile.delete.phoneRequired", {
        defaultValue: "Phone number is required",
      });
    }
    if (!formData.reason) {
      newErrors.reason = t("Profile.delete.reasonRequired", {
        defaultValue: "Please select a reason for deletion",
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteAccount(formData)).unwrap();
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      setShowConfirmModal(false);
      toast.error(
        error ||
          t("Profile.delete.deleteAccountFailed", {
            defaultValue: "Failed to delete account",
          }),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-4 sm:py-5">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              {t("Profile.delete.deleteAccount", {
                defaultValue: "Delete Account",
              })}
            </h1>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              {t("Profile.delete.verifyIdentity", {
                defaultValue: "Verify Your Identity",
              })}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {t("Profile.delete.verifyIdentityDesc", {
                defaultValue:
                  "Please confirm your details before proceeding with account deletion",
              })}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="delete-name"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
              >
                <User className="h-4 w-4 text-gray-400" />
                {t("Profile.delete.nameLabel", { defaultValue: "Full Name" })}
              </label>
              <input
                type="text"
                id="delete-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t("Profile.delete.namePlaceholder", {
                  defaultValue: "Enter your full name",
                })}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.name
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } text-sm transition-colors focus:outline-none focus:ring-2`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="delete-email"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
              >
                <Mail className="h-4 w-4 text-gray-400" />
                {t("Profile.delete.emailLabel", {
                  defaultValue: "Email Address",
                })}
              </label>
              <input
                type="email"
                id="delete-email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t("Profile.delete.emailPlaceholder", {
                  defaultValue: "Enter your email address",
                })}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.email
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } text-sm transition-colors focus:outline-none focus:ring-2`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="delete-phone"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
              >
                <Phone className="h-4 w-4 text-gray-400" />
                {t("Profile.delete.phoneLabel", {
                  defaultValue: "Phone Number",
                })}
              </label>
              <input
                type="tel"
                id="delete-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t("Profile.delete.phonePlaceholder", {
                  defaultValue: "Enter your phone number",
                })}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.phone
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } text-sm transition-colors focus:outline-none focus:ring-2`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label
                htmlFor="delete-reason"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
              >
                <MessageSquare className="h-4 w-4 text-gray-400" />
                {t("Profile.delete.reasonLabel", {
                  defaultValue: "Reason for Deletion",
                })}
              </label>
              <select
                id="delete-reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.reason
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                } text-sm transition-colors focus:outline-none focus:ring-2 bg-white`}
              >
                <option value="">
                  {t("Profile.delete.reasonPlaceholder", {
                    defaultValue: "Select a reason",
                  })}
                </option>
                {DELETE_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              {errors.reason && (
                <p className="mt-1 text-xs text-red-500">{errors.reason}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="delete-description"
                className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
              >
                <FileText className="h-4 w-4 text-gray-400" />
                {t("Profile.delete.descriptionLabel", {
                  defaultValue: "Additional Details (Optional)",
                })}
              </label>
              <textarea
                id="delete-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder={t("Profile.delete.descriptionPlaceholder", {
                  defaultValue:
                    "Tell us more about why you're leaving. Your feedback helps us improve.",
                })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors focus:outline-none focus:ring-2 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {t("Profile.delete.deleteAccountCancelButton", {
                  defaultValue: "Cancel",
                })}
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t("Profile.delete.deleteAccountConfirmButton", {
                  defaultValue: "Delete Account",
                })}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !isDeleting && setShowConfirmModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t("Profile.delete.deleteAccountConfirm", {
                        defaultValue: "Delete Account",
                      })}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {t("Profile.delete.confirmSubtitle", {
                        defaultValue: "This is a permanent action",
                      })}
                    </p>
                  </div>
                </div>
                {!isDeleting && (
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-600">
                {t("Profile.delete.deleteAccountConfirmDesc", {
                  defaultValue:
                    "Are you sure you want to delete your account? This action cannot be undone.",
                })}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {t("Profile.delete.deleteAccountCancelButton", {
                  defaultValue: "Cancel",
                })}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("Profile.delete.deleting", {
                      defaultValue: "Deleting...",
                    })}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    {t("Profile.delete.deleteAccountConfirmButton", {
                      defaultValue: "Delete Account",
                    })}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal — shows warning points after successful deletion */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
                {t("Profile.delete.deleteAccountSuccess", {
                  defaultValue: "Account Deleted Successfully",
                })}
              </h3>

              {/* Warning notice with the data removal points */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-2 mb-2">
                  <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-red-800">
                    {t("Profile.delete.warningTitle", {
                      defaultValue: "Warning: This action is irreversible",
                    })}
                  </p>
                </div>
                <ul className="text-sm text-red-700 space-y-1.5 list-disc list-inside ml-1">
                  <li>
                    {t("Profile.delete.warningPoint1", {
                      defaultValue:
                        "All your personal data will be permanently removed within 30 days",
                    })}
                  </li>
                  <li>
                    {t("Profile.delete.warningPoint2", {
                      defaultValue:
                        "Your booking history and saved preferences will be deleted",
                    })}
                  </li>
                  <li>
                    {t("Profile.delete.warningPoint3", {
                      defaultValue:
                        "Any active bookings will need to be cancelled separately",
                    })}
                  </li>
                  <li>
                    {t("Profile.delete.warningPoint4", {
                      defaultValue:
                        "Loyalty points and rewards will be forfeited",
                    })}
                  </li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={handleSuccessClose}
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--color-primary-blue)] text-white text-sm font-medium hover:bg-[#054B8F] transition-colors"
              >
                {t("Profile.delete.goToHome", {
                  defaultValue: "Go to Home",
                })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
