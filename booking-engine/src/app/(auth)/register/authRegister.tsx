"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import AuthLayout from "../../../components/auth/AuthLayout";
import FormInput from "../../../components/auth/FormInput";
import PasswordInput from "../../../components/auth/PasswordInput";
import AuthButton from "../../../components/auth/AuthButton";
import { useFormValidation } from "../../../components/auth/hooks/useFormValidation";
import { registerApi } from "./api";

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [promotionalEmailEnabled, setPromotionalEmailEnabled] = useState(false);
  const router = useRouter();

  const {
    values,
    errors,
    formFocus,
    handleChange,
    handleFocus,
    handleBlur,
    validateForm,
  } = useFormValidation(
    {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      mobilePhone: "",
    },
    {
      firstName: { required: true, namePattern: true },
      lastName: { required: true, namePattern: true },
      email: { required: true, email: true },
      mobilePhone: { required: true },
      password: { required: true, passwordStrength: true },
    },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await registerApi({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        mobilePhone: values.mobilePhone,
        promotionalEmailEnabled,
      });

      if (response?.success) {
        toast.success(t("Auth.Register.successMessage"));
        router.push("/login");
      } else {
        toast.error(response?.message || t("Auth.Register.registrationFailed"));
      }
    } catch (error: any) {
      toast.error(
        error?.message || t("Auth.Register.registrationFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("Auth.Register.title")}
      subtitle={t("Auth.Register.subtitle")}
      heroTitle={
        <>
          {t("Auth.Register.heroTitle.join")}{" "}
          <span className="text-blue-200">
            {t("Auth.Register.heroTitle.now")}
          </span>
        </>
      }
      heroSubtitle={t("Auth.Register.heroSubtitle")}
      benefits={[
        t("Auth.Register.benefits.memberPricing"),
        t("Auth.Register.benefits.personalizedRecommendations"),
        t("Auth.Register.benefits.manageBookings"),
      ]}
      footerContent={
        <p className="text-center text-gray-600">
          {t("Auth.Register.alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            {t("Auth.Register.signIn")}
          </Link>
        </p>
      }
    >
      <form className="space-y-2" onSubmit={handleSubmit}>
        {/* First Name */}
        <FormInput
          id="firstName"
          name="firstName"
          label={t("Auth.Register.firstNameLabel")}
          type="text"
          value={values.firstName}
          onChange={handleChange}
          placeholder={t("Auth.Register.firstNamePlaceholder")}
          error={errors.firstName}
          icon={<User />}
          isFocused={formFocus === "firstName"}
          onFocus={() => handleFocus("firstName")}
          onBlur={() => handleBlur("firstName")}
        />

        {/* Last Name */}
        <FormInput
          id="lastName"
          name="lastName"
          label={t("Auth.Register.lastNameLabel")}
          type="text"
          value={values.lastName}
          onChange={handleChange}
          placeholder={t("Auth.Register.lastNamePlaceholder")}
          error={errors.lastName}
          icon={<User />}
          isFocused={formFocus === "lastName"}
          onFocus={() => handleFocus("lastName")}
          onBlur={() => handleBlur("lastName")}
        />

        {/* Email */}
        <FormInput
          id="email"
          name="email"
          label={t("Auth.Register.emailLabel")}
          type="email"
          value={values.email}
          onChange={handleChange}
          placeholder={t("Auth.Register.emailPlaceholder")}
          error={errors.email}
          icon={<Mail />}
          isFocused={formFocus === "email"}
          onFocus={() => handleFocus("email")}
          onBlur={() => handleBlur("email")}
        />

        {/* Mobile Phone */}
        <FormInput
          id="mobilePhone"
          name="mobilePhone"
          label="Mobile Number"
          type="tel"
          value={values.mobilePhone}
          onChange={handleChange}
          placeholder="+91 98765 43210"
          error={errors.mobilePhone}
          icon={<Phone />}
          isFocused={formFocus === "mobilePhone"}
          onFocus={() => handleFocus("mobilePhone")}
          onBlur={() => handleBlur("mobilePhone")}
        />

        {/* Password */}
        <PasswordInput
          id="password"
          name="password"
          label={t("Auth.Register.passwordLabel")}
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          isFocused={formFocus === "password"}
          onFocus={() => handleFocus("password")}
          onBlur={() => handleBlur("password")}
          helpText={t("Auth.Register.passwordHelp")}
        />

        {/* Promotional Email Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group pt-1">
          <input
            type="checkbox"
            checked={promotionalEmailEnabled}
            onChange={(e) => setPromotionalEmailEnabled(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors leading-snug">
            I'd like to receive exclusive deals, travel inspiration, and promotional
            emails from Wooho Trip.
          </span>
        </label>

        {/* Submit */}
        <AuthButton
          loading={loading}
          text={t("Auth.Register.createAccountButton")}
        />
      </form>
    </AuthLayout>
  );
};

export default Register;