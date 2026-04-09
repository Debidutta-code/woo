import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

export default function AccommodationPromotions() {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const promotions = [
    {
      id: 1,
      title: "Grab all your",
      subtitle: "DEALS",
      subtext: "here!",
      bgGradient: "from-purple-600 to-purple-700",
      badges: ["50%", "35%", "70%"],
      type: "deals"
    },
    {
      id: 2,
      title: "Exclusive Summer Deals",
      subtitle: "Save on Beach Resorts",
      bgGradient: "from-blue-400 to-blue-600",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      type: "image"
    },
    {
      id: 3,
      title: "All Accor",
      subtitle: "Exclusive Offers with Accor",
      subtext: "T&Cs apply",
      bgGradient: "from-slate-800 to-slate-900",
      type: "accor"
    },
    {
      id: 4,
      title: "This is how",
      subtitle: "you Hotel!",
      subtext: "T&Cs apply",
      bgGradient: "from-pink-400 to-pink-600",
      type: "live"
    },
    {
      id: 5,
      title: "Beach Paradise",
      subtitle: "Summer Escape",
      bgGradient: "from-orange-400 to-orange-600",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
      type: "image"
    }
  ];

  // Check scroll position
  const checkScrollPosition = () => {
    const container = document.getElementById('promotions-scroll-container');
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    const container = document.getElementById('promotions-scroll-container');
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition(); // Initial check
      
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [promotions]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('promotions-scroll-container');
    if (container) {
      const scrollAmount = 300;
      const newPosition = direction === 'right' 
        ? container.scrollLeft + scrollAmount 
        : container.scrollLeft - scrollAmount;
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-4 md:py-8 bg-white font-noto-sans">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-[28px] font-bold text-gray-900">
            Accommodation Promotions
          </h2>
          <a 
            href="#" 
            className="text-tripswift-blue hover:text-tripswift-blue whitespace-nowrap ml-auto font-noto-sans flex items-center text-sm font-bold"
          >
            View all
            <ChevronRight size={20} />
          </a>
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
            id="promotions-scroll-container"
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {promotions.map((promo) => (
              <div key={promo.id} className="flex-shrink-0 w-80">
                <div 
                  className={`bg-gradient-to-br ${promo.bgGradient} rounded-2xl h-40 flex flex-col justify-center items-center relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200`}
                >
                  {/* Deals Card */}
                  {promo.type === 'deals' && (
                    <>
                      <div className="absolute top-3 left-4 text-yellow-300 text-2xl font-bold opacity-70">50%</div>
                      <div className="absolute top-8 right-6 text-yellow-300 text-xl font-bold opacity-60">35%</div>
                      <div className="absolute bottom-6 left-12 text-yellow-300 text-2xl font-bold opacity-70">70%</div>
                      
                      <div className="text-center z-10">
                        <p className="text-white text-sm font-semibold">{promo.title}</p>
                        <p className="text-white text-4xl font-bold">{promo.subtitle}</p>
                        <p className="text-white text-sm font-semibold">{promo.subtext}</p>
                      </div>
                    </>
                  )}

                  {/* Image Card */}
                  {promo.type === 'image' && (
                    <>
                      <img 
                        src={promo.image} 
                        alt={promo.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                      <div className="absolute bottom-4 left-4 z-10">
                        <p className="text-white text-xs font-semibold">Falgship Store</p>
                      </div>
                    </>
                  )}

                  {/* Accor Card */}
                  {promo.type === 'accor' && (
                    <>
                      <div className="absolute top-3 left-4 text-white opacity-80 text-xl">🏨</div>
                      <div className="text-center z-10">
                        <p className="text-white text-2xl font-bold">{promo.title}</p>
                        <p className="text-white text-xs mt-2">{promo.subtitle}</p>
                        <p className="text-gray-300 text-xs mt-1">{promo.subtext}</p>
                      </div>
                    </>
                  )}

                  {/* Live Card */}
                  {promo.type === 'live' && (
                    <>
                      <div className="absolute top-3 right-4 text-yellow-300 text-2xl opacity-70">☀️</div>
                      <div className="text-center z-10">
                        <p className="text-white text-2xl font-bold">◎live</p>
                        <p className="text-white text-sm mt-1">{promo.title} {promo.subtitle}!</p>
                        <p className="text-gray-200 text-xs mt-1">{promo.subtext}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Left Navigation Button */}
          {canScrollLeft && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-0 top-[70px] -translate-y-1/2 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 z-20 border border-gray-200"
              style={{ transform: 'translateY(-50%) translateX(-24px)' }}
              aria-label="Previous"
            >
              <ChevronRight className="w-5 h-5 text-gray-800 rotate-180" />
            </button>
          )}
          
          {/* Right Navigation Button */}
          {canScrollRight && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-0 top-[70px] -translate-y-1/2 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 z-20 border border-gray-200"
              style={{ transform: 'translateY(-50%) translateX(24px)' }}
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}