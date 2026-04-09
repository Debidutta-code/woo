"use client";
import React from "react";
import Image from "next/image";
import img from "../assets/woohotrip.png";
import { usePathname } from "next/navigation";
import { Facebook, Twitter, Instagram, Linkedin, Apple, Download } from "lucide-react";

const Footer = () => {
  const pathname = usePathname();
  const isFooterVisible = pathname !== "/my-trip" && pathname !== "/login" && pathname !== "/register";
  const currentYear = new Date().getFullYear();

  const footerSections = {
    help: {
      title: "Help",
      links: [
        "Help center",
        "FAQs",
        "Privacy policy",
        "Cookie policy",
        "Terms of use",
        "Manage cookie settings",
        "Digital Services Act (EU)",
        "Content guidelines & reporting",
        "Modern Slavery Statement"
      ]
    },
    company: {
      title: "Company",
      links: [
        "About us",
        "Careers",
        "Press",
        "Blog",
        "PointsMAX"
      ]
    },
    destinations: {
      title: "Destinations",
      links: [
        "Countries/Territories",
        "All Flight Routes"
      ]
    },
    partner: {
      title: "Partner with us",
      links: [
        "YCS partner portal",
        "Partner Hub",
        "Advertise on Woohoo-Trip",
        "Affiliates",
        "Woohoo-Trip API Documentation"
      ]
    },
    app: {
      title: "Get the app",
      links: [
        "iOS app",
        "Android app"
      ]
    }
  };

  const destinationCities = {
    title: "Destination Cities",
    cities: [
      "Asia", "Bali Hotels", "Bandung Hotels", "Bangkok Hotels", "Boracay Island Hotels",
      "Busan Hotels", "Cebu Hotels", "Chiang Mai Hotels", "Da Nang Hotels", "Fukuoka Hotels",
      "Hanoi Hotels", "Hat Yai Hotels", "Ho Chi Minh City Hotels", "Hoi An Hotels",
      "Hong Kong Hotels", "Hua Hin Hotels", "Hualien Hotels", "Ipoh Hotels", "Jakarta Hotels",
      "Jeju Island Hotels", "Johor Bahru Hotels", "Kaohsiung Hotels", "Kota Kinabalu Hotels"
    ]
  };

  const countries = {
    title: "Countries & Territories",
    regions: [
      { name: "Africa", items: ["Morocco Hotels", "South Africa Hotels"] },
      { name: "Americas", items: ["Argentina Hotels", "Brazil Hotels", "Canada Hotels", "Chile Hotels", "United States Hotels", "Venezuela Hotels"] },
      { name: "Asia", items: ["Cambodia Hotels", "China Hotels", "India Hotels", "Indonesia Hotels", "Japan Hotels", "Laos Hotels", "Malaysia Hotels"] }
    ]
  };

  return (
    <>
      {isFooterVisible && (
        <div className="flex flex-col bg-gray-100 w-full border-t border-tripswift-blue/10 font-noto-sans">

          {/* Logo & App Download Section - NEW */}
          <div className="bg-gradient-to-r from-tripswift-blue/5 to-tripswift-blue/5 border-b border-tripswift-blue/10">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

                {/* Logo Section */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-start mb-1 -ml-3">
                    <Image
                      src="/assets/woohotrip.png"
                      width={180}
                      height={52}
                      alt="Woohoo-Trip"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="text-sm text-tripswift-blue/70 leading-relaxed max-w-sm">
                    Discover amazing places and unique experiences with the world's leading travel booking platform.
                  </p>
                </div>

                {/* App Download Section */}
                <div className="flex flex-col justify-center items-start md:items-end">
                  <h4 className="text-sm font-bold mb-2 text-tripswift-blue">Get the app</h4>
                  <div className="flex gap-2">
                    <a
                      href="#"
                      className="flex items-center gap-1 px-3 py-2 bg-tripswift-blue text-white rounded text-xs hover:bg-tripswift-blue transition-colors duration-200"
                    >
                      <Apple size={16} /> iOS
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-1 px-3 py-2 bg-tripswift-blue text-white rounded text-xs hover:bg-tripswift-blue transition-colors duration-200"
                    >
                      <Download size={16} /> Android
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Section - Main Links */}
          <div className="bg-tripswift-blue/5">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
                {Object.entries(footerSections).map(([key, section]) => (
                  <div key={key} className="flex flex-col">
                    <h3 className="text-base font-bold mb-3 text-tripswift-blue">
                      {section.title}
                    </h3>
                    <div className="flex flex-col space-y-2">
                      {section.links.map((link, index) => (
                        <a
                          key={index}
                          href="#"
                          className="text-sm text-tripswift-blue/70 hover:text-tripswift-blue cursor-pointer transition-colors duration-200"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Section - Destination Cities & Countries */}
          <div className="bg-tripswift-off-white/30 border-y border-tripswift-blue/10">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
              {/* Destination Cities */}
              <div className="mb-8">
                <h3 className="text-sm font-bold mb-4 text-tripswift-blue">
                  {destinationCities.title}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2">
                  {destinationCities.cities.map((city, index) => (
                    <a
                      key={index}
                      href="#"
                      className="text-xs text-tripswift-blue/70 hover:text-tripswift-blue cursor-pointer transition-colors duration-200 truncate"
                    >
                      {city}
                    </a>
                  ))}
                </div>
              </div>

              {/* Countries & Territories */}
              <div>
                <h3 className="text-sm font-bold mb-4 text-tripswift-blue">
                  {countries.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {countries.regions.map((region, index) => (
                    <div key={index}>
                      <h4 className="text-xs font-semibold mb-2 text-tripswift-blue">
                        {region.name}
                      </h4>
                      <div className="flex flex-col space-y-1.5">
                        {region.items.map((item, itemIndex) => (
                          <a
                            key={itemIndex}
                            href="#"
                            className="text-xs text-tripswift-blue/70 hover:text-tripswift-blue cursor-pointer transition-colors duration-200"
                          >
                            {item}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Copyright & Social */}
          <div className="bg-tripswift-blue/5">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Copyright */}
                <div className="text-sm text-tripswift-blue/70 text-center sm:text-left order-2 sm:order-1">
                  All material herein © 2006–{currentYear} Woohoo-Trip Company Pte. Ltd. All Rights Reserved.
                  <br className="hidden sm:block" />
                  Woohoo-Trip is an independent online travel and hospitality services platform., the world leader in online travel & related services.
                </div>

                {/* Social Media Icons */}
                <div className="flex items-center gap-4 order-1 sm:order-2">
                  <a
                    href="#"
                    className="text-tripswift-blue/60 hover:text-tripswift-blue transition-all duration-300 cursor-pointer hover:scale-110 transform"
                    aria-label="Facebook"
                  >
                    <Facebook size={20} />
                  </a>
                  <a
                    href="#"
                    className="text-tripswift-blue/60 hover:text-tripswift-blue transition-all duration-300 cursor-pointer hover:scale-110 transform"
                    aria-label="Twitter"
                  >
                    <Twitter size={20} />
                  </a>
                  <a
                    href="#"
                    className="text-tripswift-blue/60 hover:text-tripswift-blue transition-all duration-300 cursor-pointer hover:scale-110 transform"
                    aria-label="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                  <a
                    href="#"
                    className="text-tripswift-blue/60 hover:text-tripswift-blue transition-all duration-300 cursor-pointer hover:scale-110 transform"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;