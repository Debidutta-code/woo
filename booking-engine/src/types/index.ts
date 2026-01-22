// Property Types
export interface Property {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  description: string;
  starRating: number;
  images: string[];
  amenities: string[];
  propertyType: 'hotel' | 'resort' | 'apartment' | 'villa' | 'hostel';
  pricePerNight: number;
  currency: string;
  rating: number;
  reviewCount: number;
  rooms: Room[];
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  type: 'standard' | 'deluxe' | 'suite' | 'executive' | 'family';
  size: number;
  sizeUnit: 'sqm' | 'sqft';
  maxAdults: number;
  maxChildren: number;
  smokingAllowed: boolean;
  viewType: 'city' | 'ocean' | 'garden' | 'pool' | 'mountain' | 'none';
  amenities: string[];
  images: string[];
  ratePlans: RatePlan[];
}

export interface RatePlan {
  id: string;
  roomId: string;
  name: string;
  basePrice: number;
  taxes: number;
  totalPrice: number;
  currency: string;
  cancellationPolicy: 'free' | 'partial' | 'non-refundable';
  inclusions: string[];
  available: boolean;
}

export interface SearchParams {
  location: string;
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  rooms: number;
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface BookingState {
  property: Property | null;
  room: Room | null;
  ratePlan: RatePlan | null;
  searchParams: SearchParams;
  guestDetails: GuestDetails | null;
}

export interface FilterState {
  priceRange: [number, number];
  starRating: number[];
  amenities: string[];
  propertyTypes: string[];
  sortBy: 'price-low' | 'price-high' | 'rating' | 'popularity';
}
