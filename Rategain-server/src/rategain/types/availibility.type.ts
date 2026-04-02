import { GeoFilter } from "./rategain.type";

export interface BestPropertiesRoomInput {
  NumberOfRoom: number;
  Adults:       number;
  Children:     number;
  paxes?:       { type: 'Child'; age: number }[];
}

export interface BestPropertiesDto {
  destinationCode?: string;
  checkin:          string;
  checkout:         string;
  CountryCode?:     string;
  Currency?:        string;
  starRating?:      string;
  PropertyId?:      string;
  Rooms:            BestPropertiesRoomInput[];
  Geofilter?:       GeoFilter;
  pageNo?:          number;
  Echotoken:        string;
}

export interface BestPropertiesApiResponse {
  body:        any[];
  status:      boolean;
  description: string | null;
  statusCode:  number;
  totalRecord: number;
}


export interface ProductsRoomInput {
  numberOfRoom: number;
  adults:       number;
  children:     number;
  paxes?:       { type: string; age: number }[];
}

export interface GetProductsDto {
  propertyID:   string;
  PropertyCode: string;
  BrandCode:    string;
  checkin:      string;
  checkout:     string;
  CountryCode?: string;
  Currency?:    string;
  Rooms:        ProductsRoomInput[];
  echoToken?:   string;
}

export interface GetProductsApiResponse {
  body:        any;
  status:      boolean;
  description: string | null;
  statusCode:  number;
}