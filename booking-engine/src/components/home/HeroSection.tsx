import SearchWidget from '@/components/search/SearchWidget';

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-foreground/30" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-16 lg:py-24">
        <div className="max-w-3xl mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 leading-tight">
            Find Your Perfect
            <span className="block text-accent">Stay Anywhere</span>
          </h1>
          <p className="text-lg md:text-xl text-background/80 max-w-xl">
            Discover amazing hotels, resorts, and unique stays around the world. Book with confidence and save on your next adventure.
          </p>
        </div>

        {/* Search Widget */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <SearchWidget variant="hero" />
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap gap-8 mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2 text-background/80">
            <span className="text-2xl font-bold text-background">500K+</span>
            <span className="text-sm">Properties</span>
          </div>
          <div className="flex items-center gap-2 text-background/80">
            <span className="text-2xl font-bold text-background">150+</span>
            <span className="text-sm">Countries</span>
          </div>
          <div className="flex items-center gap-2 text-background/80">
            <span className="text-2xl font-bold text-background">10M+</span>
            <span className="text-sm">Happy Guests</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
