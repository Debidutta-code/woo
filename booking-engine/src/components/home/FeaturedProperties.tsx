import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin } from 'lucide-react';
import { mockProperties } from '@/data/mockData';
import { Button } from '@/components/ui/button';

const FeaturedProperties = () => {
  const featured = mockProperties.slice(0, 3);

  return (
    <section className="py-16 lg:py-24 bg-muted/50">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Featured Properties</h2>
            <p className="text-muted-foreground text-lg">Hand-picked stays for your next trip</p>
          </div>
          <Link 
            to="/search" 
            className="hidden md:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            View all properties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((property, index) => (
            <Link
              key={property.id}
              to={`/property/${property.id}`}
              className="property-card group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 flex items-center gap-1 bg-background/95 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-semibold text-sm">{property.rating}</span>
                  <span className="text-muted-foreground text-sm">({property.reviewCount})</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {property.location}
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {property.name}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  {Array.from({ length: property.starRating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                  <span className="text-sm text-muted-foreground capitalize">
                    {property.propertyType}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold">${property.pricePerNight}</span>
                    <span className="text-muted-foreground"> / night</span>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-8 md:hidden">
          <Button asChild variant="outline">
            <Link to="/search">
              View all properties
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
