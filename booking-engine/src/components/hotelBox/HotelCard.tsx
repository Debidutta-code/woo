"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "../../Redux/store";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getHotelsByCity } from "../../api/hotel";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import i18next from "../../i18n/Index";
import CompactSearchBar from "./CompactSearchBar";
import { format, addDays } from "date-fns";

const HotelCard = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  // Set default dates (tomorrow and day after tomorrow)
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const dayAfterTomorrow = format(addDays(new Date(), 2), "yyyy-MM-dd");
  const isArabic = i18n.language === "ar";
  const isHindi = i18n.language === "hi";

  // Monitor scroll position for subtle parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add animation class after component mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Ensure document direction is set
  useEffect(() => {
    document.documentElement.dir = i18next.language === "ar" ? "rtl" : "ltr";
    const handleLanguageChange = () => {
      document.documentElement.dir = i18next.language === "ar" ? "rtl" : "ltr";
    };
    i18next.on("languageChanged", handleLanguageChange);
    return () => {
      i18next.off("languageChanged", handleLanguageChange);
    };
  }, []);

  // Handle search from CompactSearchBar
  const handleSearch = useCallback(
    async (location: string, checkin: string, checkout: string) => {
      try {
        // ✅ FIX: Pass filters with required dates
        await getHotelsByCity(location, {
          startDate: checkin,
          endDate: checkout,
        });

        router.push(
          `/hotel-listing?location=${encodeURIComponent(
            location,
          )}&checkin=${encodeURIComponent(
            checkin,
          )}&checkout=${encodeURIComponent(checkout)}`,
        );
      } catch (error) {
        toast.error(t("HotelCard.errorNoHotels"));
      }
    },
    [router, t],
  );

  return (
    <div className="relative w-full h-[420px] sm:h-[480px] md:h-[500px] lg:h-[450px] overflow-hidden font-noto-sans">
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-1000"
        style={{ transform: `translateY(${isScrolled ? "5%" : "0"})` }}
      >
        <Image
          src="/assets/booking_widget.jpg"
          alt="Luxury Accommodation - Woohoo Trip"
          className="object-cover w-full h-full"
          width={800}
          height={500}
          priority
          quality={95}
          unoptimized
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-tripswift-black/50 via-tripswift-black/30 to-tripswift-black/60" />
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 h-full max-w-7xl mx-auto w-full sm:px-6 lg:px-8 flex flex-col items-center justify-center px-4 transition-all duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Hero Text */}
        <div className="max-w-4xl text-center mb-4 animate-in slide-in-from-bottom duration-700">
          {/* Exclusive Offers Badge */}
          <div className="bg-white/10 backdrop-blur-md text-white text-sm font-tripswift-medium px-6 py-2 rounded-full inline-flex items-center mb-4 shadow-lg border border-white/20">
            <span
              className={`inline-block w-2 h-2 bg-tripswift-blue rounded-full animate-pulse ${
                i18n.language === "ar" ? "ml-2" : "mr-2"
              }`}
            ></span>
            <span>{t("HotelCard.exclusiveOffers")}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-xl md:text-xl lg:text-2xl xl:text-4xl font-tripswift-extrabold text-white mb-4 leading-tight tracking-tight drop-shadow-2xl">
            {t("HotelCard.heroTitle")}
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-tripswift-regular max-w-3xl mx-auto drop-shadow-lg">
            {t("HotelCard.heroSubtitle")}
          </p>
        </div>

        {/* Search Container */}
        <div className="w-[290px] md:w-full max-w-6xl animate-in slide-in-from-bottom duration-700 delay-200">
          {/* Search Box */}
          <CompactSearchBar
            initialLocation="Dubai"
            initialCheckin={tomorrow}
            initialCheckout={dayAfterTomorrow}
            onSearch={handleSearch}
          />
        </div>

        {/* Trust Badges - Below Search */}
        <div className="mt-2 animate-in slide-in-from-bottom duration-700 delay-300 hidden md:block">
          <div className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full shadow-lg flex items-center gap-6 border border-white/20">
            <div className="flex items-center">
              <span
                className={`inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse ${
                  i18n.language === "ar" ? "ml-2" : "mr-2"
                }`}
              ></span>
              <span className="text-sm font-tripswift-medium text-white">
                {t("HotelCard.freeCancellation")}
              </span>
            </div>
            <div className="flex items-center">
              <span
                className={`inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse ${
                  i18n.language === "ar" ? "ml-2" : "mr-2"
                }`}
              ></span>
              <span className="text-sm font-tripswift-medium text-tripswift-off-white">
                {t("HotelCard.bestPriceGuarantee")}
              </span>
            </div>
            <div className="hidden sm:flex items-center">
              <span
                className={`inline-block w-2 h-2 bg-tripswift-blue rounded-full animate-pulse ${
                  i18n.language === "ar" ? "ml-2" : "mr-2"
                }`}
              ></span>
              <span className="text-sm font-tripswift-medium text-white">
                {t("HotelCard.specialOffer")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
