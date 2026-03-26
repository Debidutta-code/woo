
export interface PropertySearchQuery {
  propertyName: string;
  page?: number;
  limit?: number;
}

export interface PropertySearchItem {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyCode: string;
  phone: string | null;           
  ranking: number | null;
  startingPrice: number | null;
  currency: string | null;
  categoryName: string | null;
  chainName: string | null;
  city: string | null;
  countryName: string | null;
  thumbnail: string | null;
}

export interface PropertySearchResponse {
  success: boolean;
  message: string;
  count: number;
  requiresDisambiguation: boolean;
  page: number;
  limit: number;
  totalPages: number;
  data: PropertySearchItem[];
}


export interface PropertyDetailData {
  id: string;
  propertyId: string;
  propertyName: string;          
  propertyCode: string;
  brandCode: string | null;
  description: string | null;    
  phone: string | null;          
  ranking: number | null;
  startingPrice: number | null;
  currency: string | null;
  accomodationType: string | null;
  accTypeDesc: string | null;
  categoryCode: string | null;
  categoryName: string | null;   
  categoryGroupCode: string | null;
  categoryGroupDesc: string | null;
  chainCode: string | null;
  chainName: string | null;
  latitude: number | null;
  longitude: number | null;
  hotelAmenities: string[];
  images: { id: string; url: string }[];  
  facilities: {
    id: string;
    facilityGroupName: string;
    facilityName: string;
    facilityDesc: string | null;
  }[];
  boards: { id: string; code: string; name: string }[];
  segments: { id: string; code: string; name: string }[];

}

export interface PropertyDetailResponse {
  success: boolean;
  message: string;
  data: PropertyDetailData | null;
}


export interface PropertyAddressData {
  id: string;
  address: string | null;        
  street: string | null;         
  city: string | null;           
  postalCode: string | null;     
  countryCode: string | null;
  countryName: string | null;    
  stateCode: string | null;
  stateName: string | null;      
  zoneCode: string | null;
  zoneName: string | null;
  destinationCode: string | null;
  destinationName: string | null;
 }

export interface PropertyAddressResponse {
  success: boolean;
  message: string;
  data: PropertyAddressData | null;
}


export interface RoomData {
  id: string;
  roomCode: string;              
  name: string;                  
  nativeCurrency: string | null;
  images: { id: string; url: string }[];  
  rates: {
    id: string;
    rateKey: string;
    rateName: string | null;
    totalPrice: number;
    boardCode: string | null;
    boardName: string | null;
    paymentType: string | null;
    adults: number | null;
    children: number | null;
    rooms: number | null;        
  }[];
  
}

export interface PropertyRoomsResponse {
  success: boolean;
  message: string;
  count: number;
  data: RoomData[];
}