import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Star, MapPin, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchWidget from '@/components/search/SearchWidget';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockProperties } from '@/data/mockData';
import type { FilterState, Property } from '@/types';

const amenityOptions = ['Pool', 'Spa', 'Beach Access', 'Restaurant', 'Gym', 'WiFi', 'Parking', 'Room Service'];
const propertyTypes = ['hotel', 'resort', 'apartment', 'villa', 'hostel'];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location') || '';

  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1500],
    starRating: [],
    amenities: [],
    propertyTypes: [],
    sortBy: 'popularity',
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredProperties = useMemo(() => {
    let result = [...mockProperties];

    // Filter by location
    if (location) {
      result = result.filter(
        (p) =>
          p.city.toLowerCase().includes(location.toLowerCase()) ||
          p.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filter by price range
    result = result.filter(
      (p) => p.pricePerNight >= filters.priceRange[0] && p.pricePerNight <= filters.priceRange[1]
    );

    // Filter by star rating
    if (filters.starRating.length > 0) {
      result = result.filter((p) => filters.starRating.includes(p.starRating));
    }

    // Filter by amenities
    if (filters.amenities.length > 0) {
      result = result.filter((p) => filters.amenities.every((a) => p.amenities.includes(a)));
    }

    // Filter by property type
    if (filters.propertyTypes.length > 0) {
      result = result.filter((p) => filters.propertyTypes.includes(p.propertyType));
    }

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.pricePerNight - b.pricePerNight);
        break;
      case 'price-high':
        result.sort((a, b) => b.pricePerNight - a.pricePerNight);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [location, filters]);

  const toggleArrayFilter = (key: keyof Pick<FilterState, 'starRating' | 'amenities' | 'propertyTypes'>, value: string | number) => {
    setFilters((prev) => {
      const arr = prev[key] as (string | number)[];
      const newArr = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [key]: newArr };
    });
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="filter-section">
        <h3 className="font-semibold mb-4">Price per night</h3>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => setFilters({ ...filters, priceRange: value as [number, number] })}
          max={1500}
          step={50}
          className="mb-3"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}+</span>
        </div>
      </div>

      {/* Star Rating */}
      <div className="filter-section">
        <h3 className="font-semibold mb-4">Star Rating</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={filters.starRating.includes(rating)}
                onCheckedChange={() => toggleArrayFilter('starRating', rating)}
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div className="filter-section">
        <h3 className="font-semibold mb-4">Property Type</h3>
        <div className="space-y-2">
          {propertyTypes.map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={filters.propertyTypes.includes(type)}
                onCheckedChange={() => toggleArrayFilter('propertyTypes', type)}
              />
              <span className="capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="filter-section">
        <h3 className="font-semibold mb-4">Amenities</h3>
        <div className="space-y-2">
          {amenityOptions.map((amenity) => (
            <label key={amenity} className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={() => toggleArrayFilter('amenities', amenity)}
              />
              <span>{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const PropertyCard = ({ property }: { property: Property }) => (
    <Link
      to={`/property/${property.id}`}
      className="property-card flex flex-col md:flex-row overflow-hidden"
    >
      {/* Image */}
      <div className="relative md:w-72 lg:w-80 flex-shrink-0">
        <img
          src={property.images[0]}
          alt={property.name}
          className="w-full h-48 md:h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-background/95 backdrop-blur-sm px-2 py-1 rounded-lg">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span className="font-semibold text-sm">{property.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-1">
            <MapPin className="h-3.5 w-3.5" />
            {property.location}
          </div>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
            {property.name}
          </h3>
          <div className="flex items-center gap-2 mb-3">
            {Array.from({ length: property.starRating }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
            ))}
            <span className="text-sm text-muted-foreground capitalize">
              {property.propertyType}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {property.amenities.slice(0, 4).map((amenity) => (
              <span key={amenity} className="amenity-tag">
                {amenity}
              </span>
            ))}
            {property.amenities.length > 4 && (
              <span className="amenity-tag">+{property.amenities.length - 4} more</span>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between pt-4 border-t border-border/50">
          <div>
            <p className="text-sm text-muted-foreground">{property.reviewCount} reviews</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">${property.pricePerNight}</span>
            <span className="text-muted-foreground"> / night</span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      
      {/* Search Bar */}
      <div className="border-b border-border/50 bg-background py-4">
        <div className="container">
          <SearchWidget variant="compact" />
        </div>
      </div>

      <main className="flex-1 py-8">
        <div className="container">
          <div className="flex gap-8">
            {/* Desktop Filters */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <FilterPanel />
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">
                    {location ? `Hotels in ${location}` : 'All Properties'}
                  </h1>
                  <p className="text-muted-foreground">
                    {filteredProperties.length} properties found
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden">
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[320px] overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterPanel />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort Dropdown */}
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => setFilters({ ...filters, sortBy: value as FilterState['sortBy'] })}
                  >
                    <SelectTrigger className="w-[180px] bg-background">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      <SelectItem value="popularity">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Property List */}
              <div className="space-y-4">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}

                {filteredProperties.length === 0 && (
                  <div className="text-center py-16">
                    <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or search criteria
                    </p>
                    <Button onClick={() => setFilters({
                      priceRange: [0, 1500],
                      starRating: [],
                      amenities: [],
                      propertyTypes: [],
                      sortBy: 'popularity',
                    })}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
