"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  User,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { agencyApplicationApi } from "./api/agencyapplicationapi";

interface RootState {
  auth: {
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
    } | null;
  };
}

interface AgencyStatusResponse {
  success: boolean;
  approved: boolean;
  status: "pending" | "approved" | "rejected" | "not_submitted";
  message?: string;
  data?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    agency_name: string;
    agency_email: string;
    agency_contact: string;
    agency_type: string;
    address: string;
    tax_number: string;
    iata_code?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    commission_rate?: {
      type: string;
      value: number;
    };
    assigned_properties?: any[];
  };
}

export default function AgencyApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const agencyTypeParam = searchParams.get("type") as
    | "travel"
    | "corporate"
    | null;

  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [applicationStatus, setApplicationStatus] =
    useState<AgencyStatusResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    agency_name: "",
    agency_email: "",
    agency_contact: "",
    agency_type: agencyTypeParam || "travel",
    address: "",
    tax_number: "",
    iata_code: "",
    commission_rate: {
      type: "percentage",
      value: "0",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check application status on mount
  useEffect(() => {
    checkApplicationStatus();
  }, []);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phoneNumber || "",
      }));
    }
  }, [user]);

  const checkApplicationStatus = async () => {
    setCheckingStatus(true);
    try {
      if (false) {
        setShowForm(true);
        return;
      }

      const response = await agencyApplicationApi.checkStatus(accessToken);

      if (response.success) {
        setApplicationStatus(response);

        // Show form for: not_submitted or rejected
        if (
          response.status === "not_submitted" ||
          response.status === "rejected"
        ) {
          setShowForm(true);
        }
        // Hide form for: pending or approved
        else if (
          response.status === "pending" ||
          response.status === "approved"
        ) {
          setShowForm(false);
        }
      }
    } catch (error) {
      console.error("Error checking status:", error);
      setShowForm(true); // Show form if status check fails
    } finally {
      setCheckingStatus(false);
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Phone must have at least 10 digits (minimum international number)
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };

  const validateTaxNumber = (taxNumber: string): boolean => {
    // International tax number validation
    // Alphanumeric, 5-20 characters
    const pattern = /^[A-Z0-9\-]{5,20}$/i;
    return pattern.test(taxNumber.trim());
  };

  const validateIATACode = (iataCode: string): boolean => {
    if (!iataCode.trim()) return true; // Optional field
    // IATA codes: 7-8 alphanumeric characters
    const pattern = /^[A-Z0-9]{7,8}$/i;
    return pattern.test(iataCode.trim());
  };

  const validateCommissionValue = (type: string, value: string): boolean => {
    const numValue = parseFloat(value);

    if (isNaN(numValue) || numValue < 0) return false;

    if (type === "percentage" && numValue > 100) return false;

    return true;
  };

  const handlePhoneChange = (
    value: string,
    field: "phone" | "agency_contact"
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "commission_type") {
      setFormData((prev) => ({
        ...prev,
        commission_rate: { ...prev.commission_rate, type: value },
      }));
    } else if (name === "commission_value") {
      setFormData((prev) => ({
        ...prev,
        commission_rate: { ...prev.commission_rate, value: value },
      }));
    } else if (name === "address") {
      // Limit address to 500 characters
      if (value.length <= 500) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = "Invalid phone number";
    }

    if (!formData.agency_name.trim())
      newErrors.agency_name = "Agency name is required";

    if (!formData.agency_email.trim()) {
      newErrors.agency_email = "Agency email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.agency_email)) {
      newErrors.agency_email = "Invalid email format";
    }

    if (!formData.agency_contact.trim()) {
      newErrors.agency_contact = "Agency contact is required";
    } else if (!validatePhoneNumber(formData.agency_contact)) {
      newErrors.agency_contact = "Invalid phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters";
    }

    if (!formData.tax_number.trim()) {
      newErrors.tax_number = "Tax number is required";
    } else if (!validateTaxNumber(formData.tax_number)) {
      newErrors.tax_number =
        "Invalid tax number (5-20 alphanumeric characters)";
    }

    if (formData.iata_code.trim() && !validateIATACode(formData.iata_code)) {
      newErrors.iata_code = "Invalid IATA code (7-8 alphanumeric characters)";
    }

    if (
      !validateCommissionValue(
        formData.commission_rate.type,
        formData.commission_rate.value
      )
    ) {
      if (formData.commission_rate.type === "percentage") {
        newErrors.commission_value = "Percentage must be between 0 and 100";
      } else {
        newErrors.commission_value = "Fixed amount must be 0 or greater";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setLoading(true);

    try {
      if (false) {
        toast.error("Please login to submit application");
        router.push("/login");
        return;
      }

      // Convert commission_rate.value to number
      const payload = {
        ...formData,
        commission_rate: {
          ...formData.commission_rate,
          value: Number(formData.commission_rate.value) || 0,
        },
      };

      const response = await agencyApplicationApi.submitApplication(
        payload,
        accessToken
      );

      if (response.success) {
        toast.success("Application submitted successfully!");
        await checkApplicationStatus();
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Checking application status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Agency Partner Application
              </h1>
              <p className="text-gray-600 text-sm">
                Join our network of trusted travel partners
              </p>
            </div>
          </div>
        </div>

        {/* Status Display (if exists and not rejected) */}
        {applicationStatus && applicationStatus.data && !showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-6">
            {/* Pending Status */}
            {applicationStatus.status === "pending" &&
              applicationStatus.data && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Application Under Review
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Your application is being reviewed by our team. We'll
                        notify you via email once the review is complete.
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          PENDING
                        </span>
                        <span className="text-sm text-gray-500">
                          Applied on{" "}
                          {new Date(
                            applicationStatus.data.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">
                      Application Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-blue-700">Agency Name:</span>
                        <p className="font-medium text-blue-900">
                          {applicationStatus.data.agency_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700">Agency Type:</span>
                        <p className="font-medium text-blue-900 capitalize">
                          {applicationStatus.data.agency_type}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700">Tax Number:</span>
                        <p className="font-medium text-blue-900">
                          {applicationStatus.data.tax_number}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700">Contact:</span>
                        <p className="font-medium text-blue-900">
                          {applicationStatus.data.agency_contact}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      What's Next?
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>
                          Our team will review your application within 5-7
                          business days
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>
                          We may contact you for additional information if
                          needed
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>
                          You'll receive an email notification once your
                          application is processed
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

            {/* Approved Status */}
            {applicationStatus.status === "approved" &&
              applicationStatus.data && (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Congratulations! You're Approved
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Your agency has been approved as our trusted partner.
                        You now have access to our platform and can start making
                        bookings.
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          APPROVED
                        </span>
                        <span className="text-sm text-gray-500">
                          Approved on{" "}
                          {new Date(
                            applicationStatus.data.updatedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-3">
                        Your Benefits
                      </h3>
                      <ul className="text-sm text-blue-800 space-y-2">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>
                            {applicationStatus.data.commission_rate?.value ||
                              10}
                            % commission on all bookings
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>
                            Access to{" "}
                            {applicationStatus.data.assigned_properties
                              ?.length || 0}{" "}
                            premium properties
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>Dedicated partner support</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-3">
                        Agency Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-green-700">Agency Name:</span>
                          <p className="font-medium text-green-900">
                            {applicationStatus.data.agency_name}
                          </p>
                        </div>
                        <div>
                          <span className="text-green-700">
                            Commission Rate:
                          </span>
                          <p className="font-medium text-green-900">
                            {applicationStatus.data.commission_rate?.value ||
                              10}
                            %
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/")}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
                  >
                    Go Back Home
                  </button>
                </div>
              )}
          </div>
        )}

        {/* Rejection Notice */}
        {applicationStatus?.status === "rejected" && showForm && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">
                  Previous Application Rejected
                </h4>
                <p className="text-sm text-red-800 mb-2">
                  Your previous application was not approved. Please review your
                  information and submit a new application with updated details.
                </p>
                {applicationStatus.data && (
                  <p className="text-xs text-red-600">
                    Last updated:{" "}
                    {new Date(
                      applicationStatus.data.updatedAt
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Application Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Name - Non-editable */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      disabled
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      placeholder="John Doe"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This field is auto-filled from your profile
                  </p>
                </div>

                {/* Email - Non-editable */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      placeholder="john@example.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This field is auto-filled from your profile
                  </p>
                </div>

                {/* Phone - Editable with react-phone-input-2 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone *
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={formData.phone}
                    onChange={(value) => handlePhoneChange(value, "phone")}
                    inputClass={`${errors.phone ? "!border-red-500" : ""}`}
                    containerClass="phone-input-container"
                    buttonClass="phone-input-button"
                    inputStyle={{
                      width: "100%",
                      height: "48px",
                      fontSize: "16px",
                      borderRadius: "0.5rem",
                      border: errors.phone
                        ? "1px solid #ef4444"
                        : "1px solid #d1d5db",
                    }}
                    buttonStyle={{
                      borderRadius: "0.5rem 0 0 0.5rem",
                      border: errors.phone
                        ? "1px solid #ef4444"
                        : "1px solid #d1d5db",
                      borderRight: "none",
                    }}
                    dropdownStyle={{
                      borderRadius: "0.5rem",
                    }}
                    enableSearch
                    searchPlaceholder="Search country"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Select country and enter phone number
                  </p>
                </div>
              </div>
            </div>

            {/* Agency Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Agency Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Agency Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Agency Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <input
                      type="text"
                      name="agency_name"
                      value={formData.agency_name}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 border ${
                        errors.agency_name
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500`}
                      placeholder="Sunrise Travels"
                    />
                  </div>
                  {errors.agency_name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.agency_name}
                    </p>
                  )}
                </div>

                {/* Agency Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Agency Type *
                  </label>
                  <select
                    name="agency_type"
                    value={formData.agency_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="travel">Travel Agency</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>

                {/* Agency Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Agency Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <input
                      type="email"
                      name="agency_email"
                      value={formData.agency_email}
                      onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-3 border ${
                        errors.agency_email
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500`}
                      placeholder="contact@agency.com"
                    />
                  </div>
                  {errors.agency_email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.agency_email}
                    </p>
                  )}
                </div>

                {/* Agency Contact - react-phone-input-2 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Agency Contact *
                  </label>
                  <PhoneInput
                    country={"in"}
                    value={formData.agency_contact}
                    onChange={(value) =>
                      handlePhoneChange(value, "agency_contact")
                    }
                    inputClass={`${
                      errors.agency_contact ? "!border-red-500" : ""
                    }`}
                    containerClass="phone-input-container"
                    buttonClass="phone-input-button"
                    inputStyle={{
                      width: "100%",
                      height: "48px",
                      fontSize: "16px",
                      borderRadius: "0.5rem",
                      border: errors.agency_contact
                        ? "1px solid #ef4444"
                        : "1px solid #d1d5db",
                    }}
                    buttonStyle={{
                      borderRadius: "0.5rem 0 0 0.5rem",
                      border: errors.agency_contact
                        ? "1px solid #ef4444"
                        : "1px solid #d1d5db",
                      borderRight: "none",
                    }}
                    dropdownStyle={{
                      borderRadius: "0.5rem",
                    }}
                    enableSearch
                    searchPlaceholder="Search country"
                  />
                  {errors.agency_contact && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.agency_contact}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Select country and enter contact number
                  </p>
                </div>

                {/* TAX Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    TAX Number *
                  </label>
                  <input
                    type="text"
                    name="tax_number"
                    value={formData.tax_number}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      errors.tax_number ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500`}
                    placeholder="29ABCDE1234F2Z5"
                  />
                  {errors.tax_number && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.tax_number}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Commission Type
                  </label>
                  <select
                    name="commission_type"
                    value={formData.commission_rate.type}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      errors.commission_type
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                  {errors.commission_type && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.commission_type}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Commission Value
                  </label>
                  <input
                    type="number"
                    name="commission_value"
                    value={formData.commission_rate.value}
                    onChange={handleInputChange}
                    step="0.01"
                    className={`w-full px-4 py-3 border ${
                      errors.commission_value
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500`}
                    placeholder="0"
                  />
                  {errors.commission_value && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.commission_value}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    IATA Code{" "}
                    {formData.agency_type === "travel" && "(Required)"}
                  </label>
                  <input
                    type="text"
                    name="iata_code"
                    value={formData.iata_code}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${
                      errors.iata_code ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500`}
                    placeholder="IATA123"
                  />
                  {errors.iata_code && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.iata_code}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
  name="address"
  value={formData.address}
  onChange={handleInputChange}
  rows={3}
  className={`w-full pl-11 pr-4 py-3 border ${
    errors.address ? "border-red-500" : "border-gray-300"
  } rounded-lg focus:ring-2 focus:ring-blue-500 resize-none`}
  placeholder="123, MG Road, Bengaluru, Karnataka, India - 560001"
/>

                  </div>
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-md disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
