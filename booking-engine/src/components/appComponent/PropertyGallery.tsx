// ==========================================
// Property Gallery Component
// ==========================================

import React, { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Image as ImageIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import FullscreenGallery from "./FullscreenGallery";
import { PropertyDetails } from "../../types/room.types";

interface PropertyGalleryProps {
  propertyDetails: PropertyDetails | null;
  isLoading: boolean;
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({
  propertyDetails,
  isLoading,
}) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState<number>(0);

  const images = propertyDetails?.images || [];

  if (isLoading) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="w-full h-[280px] rounded-xl bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="w-full h-[280px] rounded-xl flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <span className="text-gray-400 font-tripswift-medium">
              {t("RoomsPage.noImagesAvailable")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative rounded-xl overflow-hidden bg-white shadow-sm">
        {images.length === 1 ? (
          <div
            className="h-[280px] rounded-xl overflow-hidden cursor-pointer group relative"
            onClick={() => {
              setGalleryInitialIndex(0);
              setIsGalleryOpen(true);
            }}
          >
            <Image
              src={images[0]}
              alt={propertyDetails?.propertyName || "Property"}
              fill
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
          </div>
        ) : images.length === 2 ? (
          <div className="grid grid-cols-2 gap-2 h-[280px]">
            {images.map((img, index) => (
              <div
                key={index}
                className="relative h-full rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => {
                  setGalleryInitialIndex(index);
                  setIsGalleryOpen(true);
                }}
              >
                <Image
                  src={img}
                  alt={`${propertyDetails?.propertyName || "Property"} view ${index + 1}`}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
              </div>
            ))}
          </div>
        ) : images.length <= 4 ? (
          <div className="grid grid-cols-2 gap-2 h-[280px]">
            <div
              className="col-span-2 md:col-span-1 row-span-2 relative rounded-xl overflow-hidden cursor-pointer group"
              style={{ minHeight: "280px" }}
              onClick={() => {
                setGalleryInitialIndex(selectedImage);
                setIsGalleryOpen(true);
              }}
            >
              <Image
                src={images[selectedImage]}
                alt={propertyDetails?.propertyName || "Property"}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
            <div
              className="hidden md:grid md:grid-cols-1 gap-2"
              style={{ height: "280px" }}
            >
              {images
                .filter((_, i) => i !== selectedImage)
                .slice(0, 2)
                .map((img, index) => {
                  const images = propertyDetails?.images;
                  const originalIndex = images?.findIndex((i) => i === img);
                  return (
                    <div
                      key={index}
                      className="relative cursor-pointer rounded-xl overflow-hidden group flex-1"
                      style={{ minHeight: "136px" }}
                      onClick={() => {
                        if (images && Array.isArray(images)) {
                          const newIndex = images.findIndex((i) => i === img);
                          if (newIndex !== -1) {
                            setSelectedImage(newIndex);
                          }
                        }
                      }}
                      onDoubleClick={() => {
                        if (originalIndex !== undefined && originalIndex !== -1) {
                          setGalleryInitialIndex(originalIndex);
                          setIsGalleryOpen(true);
                        }
                      }}
                    >
                      <Image
                        src={img}
                        alt={`Property view ${index + 1}`}
                        fill
                        className="object-cover object-center group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                  );
                })}
              {images.length > 3 && selectedImage !== 3 && (
                <div
                  className="relative cursor-pointer rounded-xl overflow-hidden group flex-1"
                  style={{ minHeight: "136px" }}
                  onClick={() => setSelectedImage(3)}
                  onDoubleClick={() => {
                    setGalleryInitialIndex(3);
                    setIsGalleryOpen(true);
                  }}
                >
                  <Image
                    src={images[3]}
                    alt="Property view 4"
                    fill
                    className="object-cover object-center group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                  />
                </div>
              )}
            </div>
          </div>
        ) : images.length <= 6 ? (
          // 5-6 images layout
          <div className="grid grid-cols-4 gap-2 h-[280px]">
            <div
              className="col-span-4 md:col-span-2 md:row-span-2 relative rounded-xl overflow-hidden cursor-pointer group"
              style={{ minHeight: "280px" }}
              onClick={() => {
                setGalleryInitialIndex(selectedImage);
                setIsGalleryOpen(true);
              }}
            >
              <Image
                src={images[selectedImage]}
                alt={propertyDetails?.propertyName || "Property"}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
            <div
              className="hidden md:grid md:col-span-2 md:grid-cols-2 md:grid-rows-2 gap-2"
              style={{ height: "280px" }}
            >
              {images
                .filter((_, i) => i !== selectedImage)
                .slice(0, 4)
                .map((img, index) => {
                  const imgArray = propertyDetails?.images;
                  const originalIndex = imgArray?.findIndex((i) => i === img);
                  return (
                    <div
                      key={index}
                      className="relative cursor-pointer rounded-xl overflow-hidden group"
                      style={{ minHeight: "136px" }}
                      onClick={() => {
                        if (imgArray && Array.isArray(imgArray)) {
                          const newIndex = imgArray.findIndex((i) => i === img);
                          if (newIndex !== -1) {
                            setSelectedImage(newIndex);
                          }
                        }
                      }}
                      onDoubleClick={() => {
                        if (originalIndex !== undefined && originalIndex !== -1) {
                          setGalleryInitialIndex(originalIndex);
                          setIsGalleryOpen(true);
                        }
                      }}
                    >
                      <Image
                        src={img}
                        alt={`Property view ${index + 1}`}
                        fill
                        className="object-cover object-center group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          // 7+ images layout - 1 large (2 cols) + 6 small (3x2 grid)
          <div className="grid grid-cols-5 gap-2 h-[280px]">
            <div
              className="col-span-5 md:col-span-2 md:row-span-2 relative rounded-xl overflow-hidden cursor-pointer group"
              style={{ minHeight: "280px" }}
              onClick={() => {
                setGalleryInitialIndex(selectedImage);
                setIsGalleryOpen(true);
              }}
            >
              <Image
                src={images[selectedImage]}
                alt={propertyDetails?.propertyName || "Property"}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>
            <div
              className="hidden md:grid md:col-span-3 md:grid-cols-3 md:grid-rows-2 gap-2"
              style={{ height: "280px" }}
            >
              {images
                .filter((_, i) => i !== selectedImage)
                .slice(0, 6)
                .map((img, index) => {
                  const imgArray = propertyDetails?.images;
                  const originalIndex = imgArray?.findIndex((i) => i === img);
                  const isLastImage = index === 5 && images.length > 7;
                  return (
                    <div
                      key={index}
                      className="relative cursor-pointer rounded-xl overflow-hidden group"
                      style={{ minHeight: "136px" }}
                      onClick={() => {
                        if (isLastImage) {
                          setGalleryInitialIndex(originalIndex ?? 0);
                          setIsGalleryOpen(true);
                        } else if (imgArray && Array.isArray(imgArray)) {
                          const newIndex = imgArray.findIndex((i) => i === img);
                          if (newIndex !== -1) {
                            setSelectedImage(newIndex);
                          }
                        }
                      }}
                      onDoubleClick={() => {
                        if (originalIndex !== undefined && originalIndex !== -1) {
                          setGalleryInitialIndex(originalIndex);
                          setIsGalleryOpen(true);
                        }
                      }}
                    >
                      <Image
                        src={img}
                        alt={`Property view ${index + 1}`}
                        fill
                        className={`object-cover object-center group-hover:scale-105 transition-all duration-300 ${isLastImage ? 'brightness-75 group-hover:brightness-50' : 'group-hover:opacity-90'
                          }`}
                      />
                      {isLastImage && (
                        <div className="absolute inset-0 flex items-center justify-center text-tripswift-off-white">
                          <div className="text-center">
                            <ImageIcon className="h-5 w-5 mx-auto mb-1" />
                            <span className="font-tripswift-medium text-sm">
                              +{images.length - 7}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {images.length > 2 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (images && Array.isArray(images) && images.length > 0) {
                  setSelectedImage((prev) =>
                    prev <= 0 ? images.length - 1 : prev - 1
                  );
                }
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-tripswift-off-white backdrop-blur-sm rounded-full p-2.5 shadow-lg z-10 group border border-white/20"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors duration-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (images && Array.isArray(images) && images.length > 0) {
                  setSelectedImage((prev) =>
                    prev >= images.length - 1 ? 0 : prev + 1
                  );
                }
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-tripswift-off-white backdrop-blur-sm rounded-full p-2.5 shadow-lg z-10 group border border-white/20"
            >
              <ChevronRight className="h-5 w-5 text-gray-700 group-hover:text-black transition-colors duration-300" />
            </button>
            <div className="absolute text-white bottom-4 left-4 bg-black/70 backdrop-blur-sm text-xs py-1.5 px-4 rounded-full font-tripswift-medium shadow-lg z-10 border border-white/20">
              {selectedImage + 1} / {images.length}
            </div>
          </>
        )}

        {/* View All Photos button - Bottom center of main image */}
        {images.length >= 3 && (
          <button
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-tripswift-off-white backdrop-blur-sm text-tripswift-black text-xs font-tripswift-medium px-3.5 py-2 rounded-full shadow-lg flex items-center hover:bg-white transition-colors duration-300 z-10 border border-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setGalleryInitialIndex(selectedImage);
              setIsGalleryOpen(true);
            }}
          >
            <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
            {t("RoomsPage.viewAllPhotos", {
              defaultValue: "View all photos",
            })}
          </button>
        )}

        {/* Heart/Wishlist button - Top right corner */}
        <button
          className="absolute top-4 right-4 bg-tripswift-off-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg bg-white duration-300 z-10 border border-white/20"
          onClick={(e) => {
            e.stopPropagation();
            // Add your wishlist toggle handler here
            // handleToggleWishlist(e);
          }}
        >
          <Heart className="h-5 w-5 text-gray-700 hover:text-red-500 transition-colors duration-300" />
        </button>
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-tripswift-medium px-2.5 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 border border-white/20">
          Click to view
        </div>
      </div>

      {/* Thumbnails */}
      {images.length >= 3 && (
        <div className="flex mt-3 space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(index)}
              onDoubleClick={() => {
                setGalleryInitialIndex(index);
                setIsGalleryOpen(true);
              }}
              className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer relative transition-all duration-300 group border-2 ${selectedImage === index
                ? "shadow-lg scale-105 border-tripswift-blue"
                : "opacity-70 hover:opacity-90 border-transparent"
                }`}
              title="Click to select, double-click to view fullscreen"
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
              {selectedImage === index && (
                <div className="absolute inset-0 bg-tripswift-blue/20 flex items-center justify-center">
                  <div className="w-3 h-3 bg-tripswift-blue rounded-full" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      <FullscreenGallery
        images={images}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        initialIndex={galleryInitialIndex}
        propertyName={propertyDetails?.propertyName}
      />
    </>
  );
};

