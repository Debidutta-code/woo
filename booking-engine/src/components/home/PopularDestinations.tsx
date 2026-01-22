import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { popularDestinations } from '@/data/mockData';

const PopularDestinations = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Popular Destinations</h2>
            <p className="text-muted-foreground text-lg">Explore our most booked cities</p>
          </div>
          <Link 
            to="/destinations" 
            className="hidden md:flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            View all destinations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {popularDestinations.map((destination, index) => (
            <Link
              key={destination.city}
              to={`/hotel-listing?location=${destination.city}`}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={destination.image}
                alt={destination.city}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-xl md:text-2xl font-bold text-background mb-1">
                  {destination.city}
                </h3>
                <p className="text-background/80 text-sm">
                  {destination.properties} properties
                </p>
              </div>
            </Link>
          ))}
        </div>

        <Link 
          to="/destinations" 
          className="flex md:hidden items-center justify-center gap-2 text-primary font-medium mt-6"
        >
          View all destinations
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default PopularDestinations;
