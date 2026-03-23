
export interface RateGainHeaders {
  ApiKey: string;
  ApiSecret: string;
  'Content-Type': string;
  'Accept-Encoding': string;
  [key: string]: string;
}


export interface Destination {
  destCode: string;
  destName: string;
  countryCode: string;
  countryName: string;
}

export interface GetDestinationsResponse {
  body: Destination[];
}


export interface Pax {
  type: 'Adult' | 'Child';
  age?: number;
}

export interface Room {
  NumberOfRoom: number;
  Adults: number;
  Children: number;
  paxes?: Pax[];
}

export interface GeoFilter {
  latitude: string;
  longitude: string;
  radius: number;
}

export interface GetBestPropertyRequest {
  destinationCode: string;
  checkin: string;
  checkout: string;
  CountryCode?: string;
  Currency?: string;
  starRating?: string;
  Rooms: Room[];
  pageNo?: number;
  Echotoken: string;
  Geofilter?: GeoFilter;
}

export interface HotelSegment {
  code: string;
  name: string;
}

export interface HotelBoard {
  code: string;
  name: string;
}

export interface FacilityInfo {
  facilityName: string;
  facilityDescription: string;
}

export interface HotelFacility {
  facilityGroupName: string;
  facilityInfo: FacilityInfo[];
}

export interface Hotel {
  propertyId: string;
  propertyName: string;
  description: string;
  images: string[];
  propertyCode: string;
  brandCode: string;
  countryCode: string;
  countryName: string;
  stateCode: string;
  stateName: string;
  destinationCode: string;
  destinationName: string;
  zoneCode: string;
  zoneName: string;
  longitude: number;
  latitude: number;
  categoryCode: string;
  categoryName: string;
  categoryGroupCode: string;
  categoryGroupDesc: string;
  chainCode: string;
  chainName: string;
  accomodationType: string;
  accMultiDesc: string;
  accTypeDesc: string;
  address: string;
  street: string;
  city: string;
  postalCode: string;
  s2C: string;
  ranking: number;
  currency: string;
  price: number;
  phone: string;
  hotelSegments: HotelSegment[];
  hotelBoard: HotelBoard[];
  hotelFacility: HotelFacility[];
  hotelAmenities: string[];
}

export interface GetBestPropertyResponse {
  body: Hotel[];
  status: boolean;
  description: string;
  statusCode: number;
  totalRecord: number;
}

// ─── GetAllProducts ───────────────────────────────────────────────────────────

export interface GetAllProductsRequest {
  propertyID: string;
  PropertyCode: string;
  BrandCode: string;
  checkin: string;
  checkout: string;
  CountryCode?: string;
  Currency?: string;
  Rooms: Room[];
  echoToken?: string;
}

export interface CancellationPolicy {
  amount: string;
  from: string;
  toDate: string | null;
   amendCharge: string  | null; 
  amendRestricted: boolean | null;
  cancelRestricted: boolean | null;
  noShowPolicy: boolean | null;
}

export interface Tax {
  included: boolean;
  amount: string;
  currency: string;
  clientAmount: string;
  clientCurrency: string;
}

export interface Taxes {
  allIncluded: boolean;
  taxes: Tax[];
}

export interface Fee {
  Name: string;
  Description: string;
  Included: boolean;
  Amount: string;
  Currency: string;
}

export interface Offer {
  name: string;
  type: 'Percentage' | 'Amount' | null;
  value: string | null;
  remark: string | null;
}

export interface Rate {
  rateKey: string;
  RateCode: string;
  rateType: string;
  rateName: string;
  isMandatory: boolean;
  totalPrice: string;
  Msp: string;
  CommissionAmt: string;
  CommissionPct: string;
  allotment: number;
  rateCommentsId: string | null;
  rateComments: string | null;
  paymentType: string;
  packaging: boolean;
  boardCode: string;
  boardName: string;
  cancellationPolicies: CancellationPolicy[];
  taxes: Taxes;
  Fees: Fee[];
  rooms: number;
  adults: number;
  children: number;
  childrenAges: string;
  offers: Offer[];
  allocationDetails: string;
  status: string;
}

export interface Product {
  roomCode: string;
  name: string;
  nativeCurrency: string;
  images: string[];
  rate: Rate[];
}

export interface ProductBody {
  products: Product[];
  propertyId: string;
  propertyName: string;
  description: string;
  images: string[];
  propertyCode: string;
  brandCode: string;
  countryCode: string;
  countryName: string;
  stateCode: string;
  stateName: string;
  destinationCode: string;
  categoryCode: string;
  categoryName: string;
  address: string;
  street: string;
  city: string;
  postalCode: string;
  phone: string;
}

export interface GetAllProductsResponse {
  status: boolean;
  description: string;
  statusCode: number;
  body: ProductBody;
}

// ─── Sync Query Params ────────────────────────────────────────────────────────

export interface SyncQueryParams {
  countryCode?: string;
}