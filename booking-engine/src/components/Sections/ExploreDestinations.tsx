"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  setCheckInDate,
  setCheckOutDate,
} from "../../Redux/slices/pmsHotelCard.slice";
import { format, addDays } from "date-fns";

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
    "UAEParis, France",
    "London, UK",
    "Rome, Italy",
    "Barcelona, Spain",
    "Amsterdam, Netherlands",
    "Prague, Czech Republic",
    "Venice, Italy",
    "Vienna, Austria",
    "Lisbon, Portugal",
    "Athens, Greece",
    "Dubai, UAE",
    "Abu Dhabi, UAE",
    "Riyadh, Saudi Arabia",
    "Jeddah, Saudi Arabia",
    "Makkah, Saudi Arabia",
    "Medina, Saudi Arabia",
    "Doha, Qatar",
    "Muscat, Oman",
    'Salalah, Oman',
    'Istanbul, Turkey',
    'Cairo, Egypt',
    'Sharm El Sheikh, Egypt',
    'Hurghada, Egypt',
    'North Coast, Egypt',
    'Marrakech, Morocco',
    "Cape Town, South Africa",
    "New York City, USA",
    "Los Angeles, USA",
    'San Francisco, USA',
    'Miami, USA',
    'Las Vegas, USA',
    'Toronto, Canada',
    'Vancouver, Canada',
    "Mexico City, Mexico",
    'Rio de Janeiro, Brazil',
    "Buenos Aires, Argentina",
    "Tokyo, Japan",
    "Kyoto, Japan",
    "Bangkok, Thailand",
    "Singapore",
    "Bali, Indonesia",
    "Seoul, South Korea",
    "Hong Kong",
    "Shanghai, China",
    "Beijing, China",
    "Mumbai, India",
    "Delhi, India",
    "Jaipur, India",
    "Sydney, Australia",
    "Melbourne, Australia"
  ];

  // Updated diverse destination images
  const curatedImages = [
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Dubai skyline
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Singapore Marina Bay
    "https://images.unsplash.com/photo-1531572753322-ad063cecc140?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Bangkok temple
    "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Kuala Lumpur Petronas
    "https://www.holland.com/upload_mm/2/3/6/75601_fullimage_aerial%20view%20of%20downtown%20amsterdam%2C%20the%20netherlands%20during%20a%20dramatic%20beautiful%20sunset%20foto%20repistu%20via%20istock.jpg", // Istanbul
    "https://www.mayflowercruisesandtours.com/wp-content/uploads/2025/05/Historic-Prague.jpg", // London skyline
    "https://expertvagabond.com/wp-content/uploads/venice-italy-highlights-guide.jpg", // New York City
    "https://i0.wp.com/www.withoutapath.com/wp-content/uploads/2024/02/things-to-do-in-vienna.jpg?resize=1024%2C683&ssl=1", // Paris Eiffel
    "https://images.winalist.com/blog/wp-content/uploads/2025/04/24112929/adobestock-138702507-768x508.jpeg", // Sydney Opera House
    "https://www.grayline.com/wp-content/uploads/2025/03/Gray-Line-Athens-Cover-Photo-scaled.jpg", // Tokyo cityscape
    "https://estatly.ae/wp-content/uploads/2024/04/img_0994.jpg.webp",
    "https://imageio.forbes.com/specials-images/imageserve/6619375bcffe0fbca392d032/Aerial-view-of-Abu-Dhabi-high-rise-buildings-and-some-of-the-emirate-s-200-plus/960x0.jpg?format=jpg&width=960",
    "https://upload.wikimedia.org/wikipedia/commons/2/20/Riyadh_Skyline.jpg",
    "https://www.pelago.com/img/destinations/jeddah/0210-0851_jeddah.jpg",
    "https://idsb.tmgrup.com.tr/ly/uploads/images/2023/06/23/279495.jpg",
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/13/60/b1/42/medina.jpg?w=1400&h=1400&s=1",
    "https://img.freepik.com/premium-photo/traditional-boats-persian-gulf-doha-qatar_261932-2961.jpg?semt=ais_hybrid&w=740&q=80",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyXOyRyx1eWROhaQgEHbiVCJeR0Q4yqxPtxg&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLZA721kqQFRGLRvhBIvhFw6eZb5MtqInFMg&s",
    "https://bomag.o0bc.com/wp-content/uploads/sites/2/2025/10/Nov2025_traveler_web_leadcrop.jpg",
    "https://cdn.britannica.com/46/189746-050-C790AE3F/Skyline-Cairo.jpg",
    "https://images.goway.com/production/hero/iStock-1414210153-compressed.jpg?VersionId=VGmZYe8xJYHm6Sf5AQCryUCBwYkwQQb9",
    "https://www.tripsinegypt.com/wp-content/uploads/2023/02/how-to-enjoy-hurghada-trips-in-egypt.jpg",
    "https://www.shutterstock.com/image-photo/north-coast-alexandria-egypt-260nw-2299259495.jpg",
    "https://www.aviontourism.com/images/1260-2600-fix/f53d8411-a0a9-40ea-bbee-59e5fe37c881",
    "https://www.go2africa.com/wp-content/uploads/2024/11/Banner-.jpg",
    "https://1.bp.blogspot.com/-klHXHFbBkcg/Vh_oH8aFeyI/AAAAAAAADkI/WvdVpR4LWTc/s640/CORT-NYC-StudyUSA07.jpg",
    "https://www.nationsonline.org/gallery/USA/Downtown-Los-Angeles.jpg",
    "https://cdn.britannica.com/51/178051-050-3B786A55/San-Francisco.jpg",
    "https://www.nationsonline.org/gallery/USA/Miami-from-above.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8yb2jNjo_slVMo70x722xhQUj1jLmzsZHFQ&s",
    "https://upload.wikimedia.org/wikipedia/commons/3/30/Toronto_skyline%2C_2024_%2852592814618%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Concord_Pacific_Master_Plan_Area.jpg/330px-Concord_Pacific_Master_Plan_Area.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCE43hghufy4Pz2UiWBQ5yncywZaN-GElnLg&s",
    "https://www.ytravelblog.com/wp-content/uploads/2022/09/christ-the-redeemer-rio-de-janeiro.jpg",
    "https://ca-times.brightspotcdn.com/dims4/default/9c9e2e9/2147483647/strip/true/crop/1200x801+0+0/resize/1200x801!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F2f%2F38%2F28600db24207b9631df8fe1ef7c4%2Fbuenos-aires-cityscape.jpg",
    "https://plus.unsplash.com/premium_photo-1661914240950-b0124f20a5c1?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dG9reW98ZW58MHx8MHx8fDA%3D",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjtiLEJze2JTkzmz16oh9-WCVanfusI1N7Qg&s",
    "https://vpt-en.b-cdn.net/wp-content/uploads/b/42/Bangkok-venice.jpg.webp",
    "https://backpackersunited.in/_next/image?url=https%3A%2F%2Fbpu-images-v1.s3.eu-north-1.amazonaws.com%2Fuploads%2F1718566497636_julien-de-salaberry-viwdmfrbXfI-unsplash.jpg&w=1920&q=75",
    "https://etimg.etb2bimg.com/photo/115997634.cms",
    "https://ik.imgkit.net/3vlqs5axxjf/external/ik-seo/http://images.ntmllc.com/v4/destination/South-Korea/Seoul/219740_SCN_Seoul_iStock521707831_ZC35CD/Seoul-Scenery.jpg?tr=w-780%2Ch-437%2Cfo-auto",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8QQN04dmX05vNhcYHqXCD-nDo_ETTxDUMWQ&s",
    "https://www.china-briefing.com/news/wp-content/uploads/2019/04/China-Briefing-Shanghai-Industry-Economics-and-Policy.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQgcWnMmhwXRYww95AenXJe7s-3_DcENROP4g&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQD3ugodQXOXlIcg9dPyEsFzaxGU5swjxuirA&s",
    "https://images.immediate.co.uk/production/volatile/sites/7/2017/11/GettyImages-682789526-36d8f33.jpg?quality=90&resize=980,654",
    "https://gotripzi.com/_astro/sydney-au-hero.CwZGDzj7.webp",
    "https://media.nomadicmatt.com/2024/melbthings.jpeg"






  ];

  // Initialize destinations from static data
  useEffect(() => {
    const mappedDestinations = staticCities.map((city, index) => {
      // Extract just the city name for translation key (e.g., "Dubai" from "Dubai, UAE")
      const cleanCityName = city.split(",")[0].trim().toLowerCase();

      const translatedName = t(
        `HomeSections.ExploreDestinations.destinations.${cleanCityName}.name`,
        { defaultValue: city },
      );

      return {
        id: `${index + 1}`,
        name: translatedName,
        description: "",
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
    container.addEventListener("scroll", checkScrollPosition);

    // Check on window resize
    const handleResize = () => checkScrollPosition();
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", handleResize);
    };
  }, [destinations]);

  // Handle scroll button clicks
  const handleScroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 320; // Slightly more than card width (200px) + gap (16px)
    const newPosition =
      direction === "right"
        ? container.scrollLeft + scrollAmount
        : container.scrollLeft - scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
  };

  // Handle destination click - pass complete destination object
  const handleLocationClick = (destination: Destination) => {
    // Extract only the city name (before the comma)
    const cityName = destination.name.split(",")[0].trim();

    const checkin = format(addDays(new Date(), 1), "yyyy-MM-dd");
    const checkout = format(addDays(new Date(), 2), "yyyy-MM-dd");
    dispatch(setCheckInDate(checkin));
    dispatch(setCheckOutDate(checkout));

    const guestParams = "&rooms=1&adults=1&children=0&infant=0";

    // ✅ Pass the image URL as a query parameter
    const imageParam = destination.image
      ? `&image=${encodeURIComponent(destination.image)}`
      : "";

    router.push(
      `/destination?location=${encodeURIComponent(cityName)}&checkin=${encodeURIComponent(
        checkin,
      )}&checkout=${encodeURIComponent(checkout)}${guestParams}${imageParam}`,
    );
  };

  return (
    <section className="py-4 md:py-8 bg-white font-noto-sans">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-[28px] font-bold text-gray-900">
            Must Visit Cities
          </h2>
        </div>

        {/* Content */}
        {destinations.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <p className="text-gray-600 font-noto-sans">
              {t("HomeSections.AllHotelLists.noHotels", {
                defaultValue: "No destinations available.",
              })}
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
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
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
                        {destination.propertyCount.toLocaleString()}{" "}
                        {t("HomeSections.ExploreDestinations.accommodations", {
                          defaultValue: "accommodations",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Left Navigation Button */}
            {canScrollLeft && (
              <button
                onClick={() => handleScroll("left")}
                className="absolute left-0 top-[100px] -translate-y-1/2 -translate-x-5 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200 z-20 border border-gray-200 hover:scale-110"
                aria-label="Scroll left"
              >
                <ChevronRight className="w-5 h-5 text-gray-800 rotate-180" />
              </button>
            )}

            {/* Right Navigation Button */}
            {canScrollRight && (
              <button
                onClick={() => handleScroll("right")}
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
        div[style*="scrollbarWidth"] {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        div[style*="scrollbarWidth"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
