
export interface ChildPax {
  type: 'Child';
  age: number;
}

export interface GuestDetail {
  FirstName: string;
  LastName: string;
  Primary: boolean;
  Email?: string;
  EmailType?: number;
  ProfileType?: number;
  Phone?: string;
  Line1?: string;
  City?: string;
  StateCode?: string;
  CountryCode?: string;
  PostalCode?: string;
  Remarks?: string;
  ServiceRequest?: string;
}

export interface RoomSelectionBase {
  RoomTypeCode: string;
  NumberOfRooms: number;
  NumberOfAdults: number;
  NumberOfChild: number;
  allocationDetails?: string | null;
  RoomSelectionKey: string;
  RoomRate: number;
  BoardName?: string;
  Guest: GuestDetail[];
  Children?: ChildPax[];
}



export interface PreCheckBookReservation {
  ResStatus: number;
  CurrencyCode: string;
  GuaranteeMethod: string;
  GuaranteeType: string;
  propertyID: string;
  PropertyCode: string;
  BrandCode: string;
  checkin: string;
  checkout: string;
  EchoToken: string;
  Session?: string;
  CountryCode?: string;
  Currency?: string;
  RoomSelection: RoomSelectionBase[];
}

export interface PreCheckRequest {
  BookReservation: PreCheckBookReservation;
}

export interface PreCheckCancellationPolicy {
  amount: string;
  from: string;
  toDate: string | null;
  amendCharge: string | null;
  amendRestricted: boolean | null;
  cancelRestricted: boolean | null;
  noShowPolicy: boolean | null;
}

export interface PreCheckTax {
  included: boolean;
  amount: string;
  currency: string;
  clientAmount: string;
  clientCurrency: string;
}

export interface PreCheckFee {
  Name: string;
  Description: string;
  Included: boolean;
  Amount: string;
  Currency: string;
}

export interface PreCheckOffer {
  name: string;
  type: 'Percentage' | 'Amount' | null;
  value: string | null;
  remark: string | null;
}

export interface PreCheckRate {
  rateKey: string;
  RateCode: string;
  rateType: string;
  totalPrice: string;
  isMandatory: boolean;
  Msp: string;
  CommissionAmt: string;
  CommissionPct: string;
  allotment: number;
  rateName: string;
  rateCommentsId: string | null;
  rateComments: string | null;
  paymentType: string;
  packaging: boolean;
  boardCode: string;
  boardName: string;
  cancellationPolicies: PreCheckCancellationPolicy[];
  taxes: {
    allIncluded: boolean;
    taxes: PreCheckTax[];
  };
  Fees: PreCheckFee[];
  rooms: number;
  adults: number;
  children: number;
  childrenAges: string;
  offers: PreCheckOffer[];
  allocationDetails: string;
  status: string;
}

export interface PreCheckRoom {
  RoomCode: string;
  name: string;
  status: string | null;
  paxes: null;
  rates: PreCheckRate[];
}

export interface PreCheckResponseBody {
  checkin: string;
  checkout: string;
  propertyCode: string;
  hotelName: string;
  categoryCode: string;
  categoryName: string;
  destinationCode: string;
  destinationName: string;
  zoneCode: number;
  zoneName: string;
  latitude: string;
  longitude: string;
  rooms: PreCheckRoom[];
  minRate: string | null;
  maxRate: string | null;
  currency: string;
  totalNet: string;
  Msp: string;
  CommissionAmt: string;
  CommissionPct: string;
  paymentDataRequired: boolean;
  modificationPolicies: {
    cancellation: boolean;
    modification: boolean;
  };
}

export interface PreCheckApiResponse {
  body: {
    preCheckResponse: PreCheckResponseBody;
    booking: null;
  };
  status: boolean;
  description: string | null;
  statusCode: number;
}


export interface CreditCard {
  ExpirationDate: string; 
  IssuedName: string;
  Number: string;
  TypeIdentifier: string; 
}

export interface CommitRoomSelection extends RoomSelectionBase {
  Comment?: string;
  SpecialRequest?: string;
}

export interface CommitBookReservation {
  ResStatus: number;
  DemandBookingId: string;
  CurrencyCode: string;
  GuaranteeMethod: string;
  GuaranteeType: string;
  TimeStamp: string;
  checkin: string;
  checkout: string;
  ReservationDate: string;
  propertyID: string;
  PropertyCode: string;
  BrandCode: string;
  EchoToken: string;
  BookingRate: number;
  Session?: string;
  CountryCode?: string;
  Currency?: string;
  CreditCard?: CreditCard; 
  RoomSelection: CommitRoomSelection[];
}

export interface CommitRequest {
  BookReservation: CommitBookReservation;
}

export interface BookingHolder {
  name: string;
  surname: string;
  email: string | null;
  phone: string | null;
}

export interface BookingPax {
  roomId: number;
  type: string;
  name: string | null;
  surname: string | null;
  age: number;
}

export interface BookingCancellationPolicy {
  amount: string;
  from: string;
  toDate?: string | null;
  amendCharge?: string | null;
  amendRestricted?: boolean | null;
  cancelRestricted?: boolean | null;
  noShowPolicy?: boolean | null;
}

export interface BookingRate {
  rateKey: string | null;
  RateCode: string;
  rateType: string | null;
  rateName: string;
  allotment: number;
  rateCommentsId: string | null;
  rateComments: string | null;
  paymentType: string;
  packaging: boolean;
  boardCode: string;
  boardName: string;
  cancellationPolicies: BookingCancellationPolicy[];
  taxes: PreCheckTax[];
  Fees: PreCheckFee[];
  rooms: number;
  adults: number;
  children: number;
  offers: PreCheckOffer[];
}

export interface BookingRoom {
  RoomCode: string;
  name: string;
  status: string;
  paxes: BookingPax[];
  rates: BookingRate[];
}

export interface BookingHotel {
  checkIn: string;
  checkout: string;
  code: number;
  brandCode: string;
  hotelName: string;
  categoryCode: string;
  categoryName: string;
  destinationCode: string;
  destinationName: string;
  countryCode: string;
  countryName: string | null;
  stateCode: string;
  stateName: string | null;
  address: string;
  street: string | null;
  city: string;
  postalCode: string | null;
  phone: string;
  zoneCode: number;
  zoneName: string;
  latitude: string;
  longitude: string;
  rooms: BookingRoom[];
  paymentDataRequired: boolean;
  accomodationType: string;
}

export interface CommitBookingResult {
  confirmationNumber: string;
  echotoken: string;
  creationDate: string;
  status: string;
  modificationPolicies: {
    cancellation: boolean;
    modification: boolean;
  };
  holder: BookingHolder;
  hotel: BookingHotel;
  remark: string | null;
  totalNet: number;
  Msp: string;
  CommissionAmt: string;
  CommissionPct: string;
  voucherRemark: string;
  currency: string;
  reservationId: string;
}

export interface CommitApiResponse {
  body: {
    preCheakResponse: null;
    booking: CommitBookingResult;
  };
  status: boolean;
  description: string | null;
  statusCode: number;
}


export interface CancelRequest {
  ConfirmationNumber: string;
  DemandCancelId: string;
  ReservationId: string;
  EchoToken?: string;
  PropertyId: string;
  TimeStamp: string;
  PropertyCode: string;
  BrandCode?:string;
}

export interface CancelGuestResponse {
  firstName: string;
  lastName: string;
  primary: boolean;
  email: string | null;
  phone: string | null;
}

export interface CancelResponseBody {
  cancellationNumber: string;
  confirmationNumber: string;
  hotelComments: string | null;
  checkin: string;
  checkout: string;
  propertyCode: string;
  token: string | null;
  guest: CancelGuestResponse;
  status: string;
  hotelName: string;
  roomType: string;
  totalAmount: string;
  currency: string;
  numberOfRooms: number;
  numberOfAdults: number;
  numberOfChildren: number;
}

export interface CancelApiResponse {
  body: CancelResponseBody;
  status: boolean;
  description: string | null;
  statusCode: number;
}


export interface PreCheckDto {
  propertyID: string;
  PropertyCode: string;
  BrandCode: string;
  checkin: string;
  checkout: string;
  CurrencyCode?: string;
  CountryCode?: string;
  Session?: string;
  RoomSelection: RoomSelectionBase[];
  EchoToken?: string;
}

export interface CommitDto {
  DemandBookingId:string;
  propertyID: string;
  PropertyCode: string;
  BrandCode: string;
  checkin: string;
  checkout: string;
  CurrencyCode?: string;
  CountryCode?: string;
  Session?: string;
  CreditCard?: CreditCard; 
  RoomSelection: CommitRoomSelection[];
}

export interface CancelDto {
  confirmationNumber: string;
  reservationId: string;
  DemandCancelId: string;
  PropertyId?: string;    
  PropertyCode?: string;  
  EchoToken?: string;
  BrandCode?:string;
}

export interface CancellationPolicyRow {
  amount:           number;
  windowFrom:       Date;
  windowTo:         Date | null;
  amendCharge:      number | null;
  amendRestricted:  boolean | null;
  cancelRestricted: boolean | null;
  noShowPolicy:     boolean | null;
}

export interface CancellationSummary {
  isNonRefundable: boolean;
  policies:        CancellationPolicyRow[];
}