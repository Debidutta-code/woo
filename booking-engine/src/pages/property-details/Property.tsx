import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, ArrowLeft, Check, Users, Maximize, Eye, Ban, Coffee, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { mockProperties } from '@/data/mockData';
import type { Room, RatePlan } from '@/types';

const PropertyDetails = () => {
  const { propertyId } = useParams();
  const property = mockProperties.find((p) => p.id === propertyId);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRatePlan, setSelectedRatePlan] = useState<RatePlan | null>(null);

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
            <Button asChild>
              <Link to="/"> <ChevronLeft/>Back to Home</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleBookNow = (room: Room, ratePlan: RatePlan) => {
    setSelectedRoom(room);
    setSelectedRatePlan(ratePlan);
    setBookingDialogOpen(true);
  };

  const getCancellationColor = (policy: RatePlan['cancellationPolicy']) => {
    switch (policy) {
      case 'free':
        return 'text-success';
      case 'partial':
        return 'text-warning';
      case 'non-refundable':
        return 'text-destructive';
    }
  };

  const getCancellationLabel = (policy: RatePlan['cancellationPolicy']) => {
    switch (policy) {
      case 'free':
        return 'Free cancellation';
      case 'partial':
        return 'Partial refund available';
      case 'non-refundable':
        return 'Non-refundable';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Back Button */}
          <Link
            to="/search"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </Link>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="md:col-span-2 md:row-span-2">
              <img
                src={property.images[0]}
                alt={property.name}
                className="w-full h-64 md:h-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  setSelectedImageIndex(0);
                  setGalleryOpen(true);
                }}
              />
            </div>
            {property.images.slice(1, 5).map((image, index) => (
              <div key={index} className="hidden md:block">
                <img
                  src={image}
                  alt={`${property.name} ${index + 2}`}
                  className="w-full h-full object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    setSelectedImageIndex(index + 1);
                    setGalleryOpen(true);
                  }}
                />
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Property Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {Array.from({ length: property.starRating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                  <span className="text-muted-foreground capitalize ml-2">
                    {property.propertyType}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{property.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {property.location}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-xl font-bold text-xl">
                  {property.rating}
                </div>
                <div>
                  <p className="font-semibold">Excellent</p>
                  <p className="text-sm text-muted-foreground">{property.reviewCount} reviews</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-4">About this property</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Check className="h-4 w-4 text-success" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rooms */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Available Rooms</h2>
                <div className="space-y-6">
                  {property.rooms.map((room) => (
                    <div key={room.id} className="border border-border rounded-xl overflow-hidden">
                      <div className="grid md:grid-cols-3">
                        {/* Room Image */}
                        <div className="md:col-span-1">
                          <img
                            src={room.images[0]}
                            alt={room.name}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        </div>

                        {/* Room Details */}
                        <div className="md:col-span-2 p-5">
                          <h3 className="text-lg font-semibold mb-3">{room.name}</h3>
                          
                          {/* Room Features */}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1.5">
                              <Maximize className="h-4 w-4" />
                              {room.size} {room.sizeUnit}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-4 w-4" />
                              {room.maxAdults} adults, {room.maxChildren} children
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Eye className="h-4 w-4" />
                              {room.viewType} view
                            </div>
                            <div className="flex items-center gap-1.5">
                              {room.smokingAllowed ? (
                                <Coffee className="h-4 w-4" />
                              ) : (
                                <Ban className="h-4 w-4" />
                              )}
                              {room.smokingAllowed ? 'Smoking' : 'Non-smoking'}
                            </div>
                          </div>

                          {/* Room Amenities */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {room.amenities.slice(0, 4).map((amenity) => (
                              <span key={amenity} className="amenity-tag">
                                {amenity}
                              </span>
                            ))}
                          </div>

                          {/* Rate Plans */}
                          <div className="space-y-3 pt-4 border-t border-border/50">
                            {room.ratePlans.map((ratePlan) => (
                              <div
                                key={ratePlan.id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">{ratePlan.name}</p>
                                  <p className={`text-sm ${getCancellationColor(ratePlan.cancellationPolicy)}`}>
                                    {getCancellationLabel(ratePlan.cancellationPolicy)}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {ratePlan.inclusions.join(' • ')}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold">${ratePlan.totalPrice}</p>
                                  <p className="text-xs text-muted-foreground">includes taxes</p>
                                  <Button
                                    variant="booking"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => handleBookNow(room, ratePlan)}
                                    disabled={!ratePlan.available}
                                  >
                                    {ratePlan.available ? 'Book Now' : 'Sold Out'}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 border border-border rounded-xl bg-card shadow-lg">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold">${property.pricePerNight}</span>
                  <span className="text-muted-foreground">/ night</span>
                </div>
                <div className="flex items-center gap-2 mb-6 text-sm">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-medium">{property.rating}</span>
                  <span className="text-muted-foreground">({property.reviewCount} reviews)</span>
                </div>
                <Button variant="cta" size="lg" className="w-full">
                  Check Availability
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  You won't be charged yet
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Gallery Modal */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-5xl p-0 bg-foreground">
          <DialogHeader className="sr-only">
            <DialogTitle>Property Gallery</DialogTitle>
            <DialogDescription>View property images</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <img
              src={property.images[selectedImageIndex]}
              alt={`${property.name} gallery`}
              className="w-full h-[80vh] object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-background hover:bg-background/20"
              onClick={() => setGalleryOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-background hover:bg-background/20"
              onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-background hover:bg-background/20"
              onClick={() => setSelectedImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === selectedImageIndex ? 'bg-background' : 'bg-background/50'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
            <DialogDescription>
              {selectedRoom?.name} - {selectedRatePlan?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Booking Summary */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-3">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Room</span>
                  <span>{selectedRoom?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate Plan</span>
                  <span>{selectedRatePlan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Price</span>
                  <span>${selectedRatePlan?.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span>${selectedRatePlan?.taxes}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total</span>
                  <span>${selectedRatePlan?.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Sign In Prompt */}
            <div className="text-center p-6 border border-dashed border-border rounded-lg">
              <h4 className="font-medium mb-2">Sign in to continue</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Create an account or sign in to complete your booking
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline">Sign In</Button>
                <Button>Create Account</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PropertyDetails;
