import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import PopularDestinations from '@/components/home/PopularDestinations';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import WhyChooseUs from '@/components/home/WhyChooseUs';

const Index = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <PopularDestinations />
        <FeaturedProperties />
        <WhyChooseUs />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
