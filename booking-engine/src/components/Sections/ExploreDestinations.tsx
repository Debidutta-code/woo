'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCheckInDate, setCheckOutDate } from '../../Redux/slices/pmsHotelCard.slice';
import { format, addDays } from 'date-fns';

interface Destination {
    id: string;
    name: string;
    description: string;
    image: string;
    propertyCount?: number;
}

export function ExploreDestinations() {
    const { t } = useTranslation();
    const router = useRouter();
    const dispatch = useDispatch();
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Static city list
    const staticCities = [
        'Dubai, UAE',
        'Singapore, Singapore',
        'Bangkok, Thailand',
        'Kuala Lumpur, Malaysia',
        'Istanbul, Turkey',
        'London, United Kingdom',
        'New York City, USA',
        'Paris, France',
        'Sydney, Australia',
        'Tokyo, Japan',
    ];

    // Updated diverse destination images
    const curatedImages = [
        'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=800&h=600&fit=crop&q=80', // Dubai skyline
        'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop&q=80', // Singapore Marina Bay
        'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&h=600&fit=crop&q=80', // Bangkok temple
        'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop&q=80', // Kuala Lumpur Petronas
        'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop&q=80', // Istanbul
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80', // London skyline
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop&q=80', // New York City
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop&q=80', // Paris Eiffel
        'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop&q=80', // Sydney Opera House
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&q=80', // Tokyo cityscape
    ];

    // Initialize destinations from static data
    useEffect(() => {
        const mappedDestinations = staticCities.map((city, index) => {
            // Extract just the city name for translation key (e.g., "Dubai" from "Dubai, UAE")
            const cleanCityName = city.split(',')[0].trim().toLowerCase();

            const translatedName = t(
                `HomeSections.ExploreDestinations.destinations.${cleanCityName}.name`,
                { defaultValue: city }
            );

            return {
                id: `${index + 1}`,
                name: translatedName,
                description: '',
                image: curatedImages[index],
                propertyCount: Math.floor(Math.random() * 200) + 50,
            };
        });

        setDestinations(mappedDestinations);
    }, [t]);

    // Check scroll position
    const checkScrollPosition = () => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setCanScrollLeft(scrollLeft > 5);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    // Set up scroll listener and initial check
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // Initial check after a short delay to ensure content is rendered
        const timer = setTimeout(() => {
            checkScrollPosition();
        }, 100);

        // Add scroll listener
        container.addEventListener('scroll', checkScrollPosition);

        // Check on window resize
        const handleResize = () => checkScrollPosition();
        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timer);
            container.removeEventListener('scroll', checkScrollPosition);
            window.removeEventListener('resize', handleResize);
        };
    }, [destinations]);

    // Handle scroll button clicks
    const handleScroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = 320; // Slightly more than card width (200px) + gap (16px)
        const newPosition =
            direction === 'right'
                ? container.scrollLeft + scrollAmount
                : container.scrollLeft - scrollAmount;

        container.scrollTo({
            left: newPosition,
            behavior: 'smooth',
        });
    };

    // Handle destination click - pass complete destination object
    const handleLocationClick = (destination: Destination) => {
        // Extract only the city name (before the comma)
        const cityName = destination.name.split(',')[0].trim();

        const checkin = format(addDays(new Date(), 1), 'yyyy-MM-dd');
        const checkout = format(addDays(new Date(), 2), 'yyyy-MM-dd');
        dispatch(setCheckInDate(checkin));
        dispatch(setCheckOutDate(checkout));

        const guestParams = '&rooms=1&adults=1&children=0&infant=0';

        // ✅ Pass the image URL as a query parameter
        const imageParam = destination.image ? `&image=${encodeURIComponent(destination.image)}` : '';

        router.push(
            `/destination?location=${encodeURIComponent(cityName)}&checkin=${encodeURIComponent(
                checkin
            )}&checkout=${encodeURIComponent(checkout)}${guestParams}${imageParam}`
        );
    };

    return (
        <section className="py-4 md:py-8 bg-white font-noto-sans">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl md:text-[28px] font-bold text-gray-900">
                        Popular destinations outside India
                    </h2>
                </div>

                {/* Content */}
                {destinations.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 font-noto-sans">
                            {t('HomeSections.AllHotelLists.noHotels', { defaultValue: 'No destinations available.' })}
                        </p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Left Fade Gradient */}
                        {canScrollLeft && (
                            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                        )}

                        {/* Right Fade Gradient */}
                        {canScrollRight && (
                            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                        )}

                        {/* Scroll Container */}
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-4 overflow-x-auto pb-2"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch',
                            }}
                        >
                            {destinations.map((destination) => (
                                <div
                                    key={destination.id}
                                    className="flex-shrink-0 w-[200px] cursor-pointer group"
                                    onClick={() => handleLocationClick(destination)}
                                >
                                    <div className="relative mb-3 rounded-2xl overflow-hidden">
                                        <img
                                            src={destination.image}
                                            alt={destination.name}
                                            className="w-full h-[200px] object-cover transition-transform duration-300 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-tripswift-blue transition-colors">
                                            {destination.name}
                                        </h3>
                                        {destination.propertyCount && (
                                            <p className="text-sm text-gray-600">
                                                {destination.propertyCount.toLocaleString()}{' '}
                                                {t('HomeSections.ExploreDestinations.accommodations', { defaultValue: 'accommodations' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Left Navigation Button */}
                        {canScrollLeft && (
                            <button
                                onClick={() => handleScroll('left')}
                                className="absolute left-0 top-[100px] -translate-y-1/2 -translate-x-5 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 z-20 border border-gray-200 hover:scale-110"
                                aria-label="Scroll left"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-800 rotate-180" />
                            </button>
                        )}

                        {/* Right Navigation Button */}
                        {canScrollRight && (
                            <button
                                onClick={() => handleScroll('right')}
                                className="absolute right-0 top-[100px] -translate-y-1/2 translate-x-5 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 z-20 border border-gray-200 hover:scale-110"
                                aria-label="Scroll right"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-800" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
                div[style*='scrollbarWidth'] {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                div[style*='scrollbarWidth']::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}