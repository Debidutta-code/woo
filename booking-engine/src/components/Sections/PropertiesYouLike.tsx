import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

export default function PropertiesYouLike() {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const promotions = [
        {
            id: 1,
            title: "All",
            titleBold: "ACCOR",
            description: "Exclusive Offers with Accor",
            subtext: "T&Cs apply",
            image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop",
            overlayBgGradient: "from-blue-900/80 to-blue-950/90",
            position: "right"
        },
        {
            id: 2,
            title: "◎live",
            description: "This is how you Hotel!",
            subtext: "T&Cs apply",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
            overlayBgGradient: "from-pink-500/80 to-pink-600/90",
            position: "right"
        },
        {
            id: 3,
            title: "U",
            description: "Uncomplicated. Inspiring. You.",
            subtext: "Book your perfect stay!",
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
            overlayBgGradient: "from-purple-600/80 to-purple-700/90",
            position: "right"
        },
        {
            id: 4,
            title: "Luxury",
            description: "Exclusive Retreat",
            subtext: "Experience the best",
            image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop",
            overlayBgGradient: "from-amber-600/80 to-amber-700/90",
            position: "right"
        },
        {
            id: 5,
            title: "Beach",
            description: "Paradise Awaits",
            subtext: "Summer deals",
            image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=400&fit=crop",
            overlayBgGradient: "from-teal-600/80 to-teal-700/90",
            position: "right"
        },
        {
            id: 6,
            title: "Urban",
            description: "City Adventure",
            subtext: "Explore more",
            image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=400&fit=crop",
            overlayBgGradient: "from-slate-700/80 to-slate-800/90",
            position: "right"
        },
        {
            id: 7,
            title: "Wellness",
            description: "Spa & Relaxation",
            subtext: "Rejuvenate yourself",
            image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop",
            overlayBgGradient: "from-green-600/80 to-green-700/90",
            position: "right"
        },
        {
            id: 8,
            title: "Adventure",
            description: "Thrilling Escapes",
            subtext: "Limited time offer",
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
            overlayBgGradient: "from-orange-600/80 to-orange-700/90",
            position: "right"
        }
    ];

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
    }, [promotions]);

    // Handle scroll button clicks
    const handleScroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = 340; // Card width (320px) + gap (16px)
        const newPosition =
            direction === 'right'
                ? container.scrollLeft + scrollAmount
                : container.scrollLeft - scrollAmount;

        container.scrollTo({
            left: newPosition,
            behavior: 'smooth',
        });
    };

    return (
        <section className="py-4 md:py-8 bg-white font-noto-sans">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl md:text-[28px] font-bold text-gray-900">
                        Properties we think you'll like
                    </h2>
                </div>

                {/* Scroll Container Wrapper */}
                <div className="relative">

                    {/* Left Fade Gradient */}
                    {canScrollLeft && (
                        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                    )}

                    {/* Right Fade Gradient */}
                    {canScrollRight && (
                        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                    )}

                    {/* Scroll Container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-auto pb-2"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {promotions.map((promo) => (
                            <div key={promo.id} className="flex-shrink-0 w-80">
                                <div
                                    className="relative h-48 rounded-2xl overflow-hidden cursor-pointer group"
                                >
                                    {/* Background Image */}
                                    <img
                                        src={promo.image}
                                        alt={promo.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />

                                    {/* Colored Overlay - Right Side */}
                                    <div className={`absolute inset-0 bg-gradient-to-l ${promo.overlayBgGradient}`}></div>

                                    {/* Property Badge - Top Left */}
                                    <div className="absolute top-3 left-3 z-20 bg-white/85 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                                        <p className="text-xs font-bold text-gray-800 leading-tight">Falgship</p>
                                        <p className="text-xs text-gray-600 leading-tight">Store</p>
                                    </div>

                                    {/* Content - Right Side */}
                                    <div className="absolute inset-0 flex flex-col justify-center items-end px-6 z-10">
                                        {/* Title */}
                                        <div className="text-right">
                                            {promo.title && (
                                                <h3 className="text-white text-3xl font-bold mb-0.5">
                                                    {promo.title}
                                                </h3>
                                            )}
                                            {promo.titleBold && (
                                                <p className="text-white text-sm font-bold mb-2">
                                                    {promo.titleBold}
                                                </p>
                                            )}

                                            {/* Description */}
                                            {promo.description && (
                                                <p className="text-white text-sm font-semibold mb-1">
                                                    {promo.description}
                                                </p>
                                            )}

                                            {/* Subtext */}
                                            {promo.subtext && (
                                                <p className="text-gray-200 text-xs">
                                                    {promo.subtext}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Hover Effect */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
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