// src/app/(app)/destination/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, MapPin } from 'lucide-react';
import DestinationSearchBar from '@/components/hotelBox/DestinationSerachBar';

export default function DestinationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();

  // Get parameters from URL
  const location = searchParams.get('location') || 'Colombo';
  const checkin = searchParams.get('checkin') || '';
  const checkout = searchParams.get('checkout') || '';
  const imageUrl = searchParams.get('image') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [imageError, setImageError] = useState(false);

  // Set background image from URL parameter or fallback
  useEffect(() => {
    if (imageUrl) {
      setBackgroundImage(imageUrl);
    } else {
      // Fallback to default image if no image provided
      setBackgroundImage('/images/destinations/default.jpg');
    }
  }, [imageUrl]);

  // Handle search from CompactSearchBar
  const handleSearch = (
    newLocation: string,
    newCheckin: string,
    newCheckout: string,
    guestDetails?: any
  ) => {
    setIsLoading(true);

    // Build query parameters
    const params = new URLSearchParams({
      location: newLocation,
      checkin: newCheckin,
      checkout: newCheckout,
      rooms: guestDetails?.rooms?.toString() || '1',
      adults: guestDetails?.guests?.toString() || '2',
      children: guestDetails?.children?.toString() || '0',
      infant: guestDetails?.infants?.toString() || '0',
    });

    // Navigate to hotel listing page
    router.push(`/hotel-listing?${params.toString()}`);
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="min-h-screen bg-tripswift-off-white">
      {/* Hero Section with Background Image - Full Screen */}
      <div
        className="relative min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: imageError
            ? 'linear-gradient(135deg, #8B4513 0%, #D2691E 100%)'
            : `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.45)), url('${backgroundImage}')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Hidden image element to detect errors */}
        {!imageError && backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            className="hidden"
            onError={handleImageError}
            referrerPolicy="no-referrer"
          />
        )}

        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />

        {/* Content Container */}
        <div className="relative min-h-screen flex flex-col items-center justify-start pt-32 md:pt-40 px-4 sm:px-6 lg:px-8 pb-12">

          {/* Title Section */}
          <div className="text-center mb-8 md:mb-10 space-y-2 md:space-y-3 max-w-4xl mx-auto">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-2xl leading-tight">
              {location} {t('destination.hotelsAndPlaces', { defaultValue: 'hotels & places to stay' })}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/95 drop-shadow-lg max-w-3xl mx-auto px-4">
              {t('destination.subtitle', {
                defaultValue: 'Search to compare prices and discover great deals with free cancellation'
              })}
            </p>
          </div>

          {/* Search Bar Container */}
          <div className="w-full max-w-6xl px-2 sm:px-0">
            <DestinationSearchBar
              initialLocation={location}
              initialCheckin={checkin}
              initialCheckout={checkout}
              onSearch={handleSearch}
              isRoomPage={false}
            />
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 shadow-2xl flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-tripswift-burgundy" />
                <span className="text-tripswift-black font-medium">
                  {t('destination.searching', { defaultValue: 'Searching hotels...' })}
                </span>
              </div>
            </div>
          )}

          {/* Fallback Icon (shown when image fails to load) */}
          {imageError && (
            <div className="absolute top-8 right-8 opacity-20">
              <MapPin className="w-32 h-32 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}