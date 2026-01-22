import { Shield, CreditCard, Clock, HeadphonesIcon } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure Booking',
    description: 'Your payment and personal information are always protected with bank-level security.',
  },
  {
    icon: CreditCard,
    title: 'Best Price Guarantee',
    description: 'Find a lower price? We\'ll match it and give you an additional 10% off.',
  },
  {
    icon: Clock,
    title: 'Flexible Cancellation',
    description: 'Plans change. Enjoy free cancellation on most bookings up to 24 hours before check-in.',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Our customer support team is available around the clock to assist you.',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Book With Us</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We make travel planning simple, secure, and worry-free
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="text-center p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-5">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
