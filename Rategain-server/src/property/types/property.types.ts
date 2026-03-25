// ─── Request Types ───────────────────────────────────────────────

export interface PropertySearchQuery {
  q: string;
  city?: string;
  countryCode?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryCode?: string;
  chainCode?: string;
  page?: number;
  limit?: number;
}

// ─── Response Types ───────────────────────────────────────────────

export interface PropertyThumbnail {
  id: string;
  propertyId: string;
  propertyName: string;
  city: string | null;
  country: string | null;
  category: string | null;
  chain: string | null;
  startingPrice: number | null;
  currency: string | null;
  ranking: number | null;
  thumbnail: string | null;
}

export interface PropertyAddress {
  address: string | null;
  street: string | null;
  city: string | null;
  postalCode: string | null;
  countryCode: string | null;
  countryName: string | null;
  stateName: string | null;
  zoneName: string | null;
  destinationName: string | null;
}

export interface PropertyFacility {
  facilityGroupName: string;
  facilityName: string;
  facilityDesc: string | null;
}

export interface RoomRate {
  rateKey: string;
  rateName: string | null;
  totalPrice: number;
  boardName: string | null;
  paymentType: string | null;
  cancellationPolicies: {
    amount: number;
    fromDate: Date;
    toDate: Date | null;
  }[];
}

export interface RoomType {
  roomCode: string;
  name: string;
  images: { url: string }[];
  rates: RoomRate[];
}

export interface PropertyDetail {
  id: string;
  propertyId: string;
  propertyName: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  ranking: number | null;
  startingPrice: number | null;
  currency: string | null;
  categoryName: string | null;
  chainName: string | null;
  hotelAmenities: string[];
  address: PropertyAddress | null;
  images: { url: string }[];
  facilities: PropertyFacility[];
  roomTypes: RoomType[];
}

// ─── API Response Wrappers ────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PropertySearchResponse extends ApiResponse<PropertyThumbnail[]> {
  count: number;
  requiresDisambiguation: boolean;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PropertyDetailResponse extends ApiResponse<PropertyDetail | null> {}