// ============ Repository Return Types ============

import {
    AmenityType,
    CurrencyCode,
    DeviceType,
    DiscountType,
    geoRestrictionType,
    geoRestrictionTypeAction,
    PolicyType,
    PromotionType,
    SmokingPolicy,
} from '../../../../../prisma/generated/prisma/enums';


export interface PropertyAddress {
    id: string;
    addressLine1: string;
    addressLine2: string|null;
    country: string;
    state: string;
    city: string;
    location: string;
    landmark: string;
    zipCode: string;
    latitude: number;
    longitude: number;
    // property: Property;
    propertyId: string;
}

export interface BookingOffset {
    id: string;
    propertyId: string;
    ratePlanCode: string;
    ratePlanId: string;
    ratePlanName: string;
    minimumAdvanceBookingOffset: number | null;
    maximumAdvanceBookingOffset: number | null;
    minimumAmendBookingOffset: number | null;
    maximumAmendBookingOffset: number | null;
    minimumCancelBookingOffset: number | null;
    maximumCancelBookingOffset: number | null;
    isActive: boolean;
    date: Date;
    createdAt: Date;
}
export interface ChargeAdditionalGuest {
    id: string;
    chargeId: string;
    ageQualifyingCode: string;
    amount: number;
}
export interface ChargeBaseByGuest {
    id: string;
    chargeId: string;
    ageQualifyingCode: string;
    amountBeforeTax: number;
    numberOfGuests: number;
}

export interface CustomizableDeal {
    id: string;
    propertyId: string;
    propertyCode: string;
    discountType: DiscountType;
    discountValue: number;
    currencyCode: CurrencyCode | null;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    isAutoApplied: boolean;
    roomType: string;
    roomId: string;
    ratePlanId: string;
    ratePlanCode: string;
    createdAt: Date;
}

export interface Inventory {
    id: string;
    propertyCode: string;
    roomTypeCode: string;
    date: Date;
    availability: number;
    ratePlans: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface RatePlanWithAddon {
    id: string;
    ratePlanId: string;
    addonId: string;
    createdAt: Date;
}

export interface GeoRatePlan {
    id: string;
    propertyId: string;
    roomId: string | null;
    roomType: string | null;
    ratePlanId: string;
    ratePlanCode: string;
    restrictionType: geoRestrictionType;
    restrictionTypeAction: geoRestrictionTypeAction | null;
    restrictionValue: number | null;
    currencyCode: CurrencyCode | null;
    countryCode: string[];
    isActive: boolean;
    createdAt: Date;
}

export interface Promotion {
    id: string;
    promotionName: string;
    propertyId: string;
    validFrom: Date | null;
    validTo: Date | null;
    advanceBookingDays: number | null;
    promotionType: PromotionType;
    roomId: string | null;
    roomType: string | null;
    deviceType: DeviceType[];
    ratePlanId: string;
    ratePlanCode: string;
    discountType: DiscountType;
    discountValue: number | null;
    currencyCode: CurrencyCode | null;
    monApplicable: boolean;
    tueApplicable: boolean;
    wedApplicable: boolean;
    thuApplicable: boolean;
    friApplicable: boolean;
    satApplicable: boolean;
    sunApplicable: boolean;
    isActive: boolean;
    isAutoApplied: boolean;
    createdAt: Date;
}

export interface RatePlanRule {
    id: string;
    ratePlanId: string;
    startDate: Date | null;
    endDate: Date | null;
    minLos: number;
    maxLos: number | null;
    isAutoApplied: boolean;
    discountType: DiscountType | null;
    currencyCode: CurrencyCode;
    discountValue: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PropertyCategory {
    id: string;
    masterCategory: MasterPropertyCategory;
    masterCategoryId: string;
    property?: Property;
    propertyId: string;
}

export interface PropertyType {
    id: string;
    masterPropertyType: MasterPropertyType;
    masterPropertyTypeId: string;
    property?: Property;
    propertyId: string;
}

export interface MasterPropertyType {
    id: string;
    propertyTypeName: string;
    propertyTypeDescription: string| null; 
    isActive: Boolean;
    properties?: PropertyType[];
    createdAt: Date;
    updatedAt: Date;
}

export interface MasterPropertyCategory {
    id: string;
    categoryName: string;
    categoryDescription: string | null;
    isActive: boolean;

    // Relation to properties that selected this category
    properties?: PropertyCategory[];
    createdAt: Date;
    updatedAt: Date;
}

export interface PropertyAmenitySelection {
    id: string;
    property?: Property;
    propertyId: string;
    amenity: MasterAmenity;
    amenityId: string;
}

export interface MasterAmenity {
    id: string;
    amenityName: string;
    amenityType: AmenityType;
    description?: string|null;
    icon?: string|null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    // PropertyAmenitySelection: PropertyAmenitySelection[];
    // RoomAmenitySelection: RoomAmenitySelection[];
}

export interface Room {
    id: string;
    roomName: string;
    roomType: string;
    totalRoom: number;
    floor: string;
    roomView: string;  // RoomView enum
    roomSize: number;
    roomUnit: string;  // RoomUnit enum
    smokingPolicy: string;  // SmokingPolicy enum
    maxOccupancy: number;
    maxNumberOfAdults: number;
    maxNumberOfChildren: number;
    numberOfBedrooms: number;
    numberOfBeds: number;
    numberOfLivingRoom: number;
    extraBed: number;
    description: string | null;
    priority: number;
    view360Link: string | null;
    image: string[];
    available: boolean;
    isDeleted: boolean;
    propertyId: string;
    createdAt: Date;
    updatedAt: Date;
}

// ============ Room With Relations ============

export interface IRoomWithDetails extends Room {
    RoomViews: MRoomView | null;
    property: Property;
    roomAmenities: (RoomAmenitySelection & {
        amenity: MasterAmenity | null;
    })[];
    roomVideos: IRoomVideo | null;
    agenticRooms: AgenticRoom[];
    geoRatePlans: GeoRatePlan[];
    promotions: Promotion[];
    customizableDeals: CustomizableDeal[];
    TouristTaxs: TouristTaxes[];
    OccupancyBasedDynamicPricing: OccupancyBasedDynamicPricing[];
    SeasonalDynamicPricings: SeasonalDynamicPricing[];
    WeekendDynamicPricing: WeekendDynamicPricing[];
    Charges: Charge[];
}

// ============ Related Interfaces ============

export interface MRoomView {
    id: string;
    roomId: string;
    masterRoomViewId: string;
    MasterRoomView: MasterRoomView;
}

export interface MasterRoomView {
    id: string;
    viewName: string;
    isActive: boolean;
    metaData: any;  // JsonValue
    createdAt: Date;
    updatedAt: Date;
}

export interface AgenticRoom {
    id: string;
    roomId: string;
    agenticId: string;
    // ... other fields based on your schema
}

export interface TouristTaxes {
    id: string;
    roomId: string;
    name: string | null;
    discountType: string;
    discountValue: number | null;
    currencyCode: string | null;
    createdAt: Date;
}

export interface OccupancyBasedDynamicPricing {
    id: string;
    roomId: string;
    // ... other fields based on your schema
}

export interface SeasonalDynamicPricing {
    id: string;
    roomId: string;
    // ... other fields based on your schema
}

export interface WeekendDynamicPricing {
    id: string;
    roomId: string;
    // ... other fields based on your schema
}

export interface RoomAmenitySelection {
    id: string;
    roomId: string;
    amenity: MasterAmenity;
    amenityId: string;
}

export interface Policy {
    id: string;
    policyName: string;
    type: PolicyType;
    description: string;
    propertyId: string;
    // property: Property;

    // Reverse relations
    // usedInDepositFor: RatePlan[];
    // usedInCancellationFor: RatePlan[];
    // usedInGuaranteeFor: RatePlan[];

    createdAt: Date;
    updatedAt: Date;
}

export interface BankDetails {
    id: string;
    payAtHotel: boolean;
    paymentGateway: boolean;

    propertyId: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface RatePlan {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
    deviceType: DeviceType[];
    // Back relation to Property
    // property: Property;
    propertyId: string;
    // Policies
    depositPolicy: Policy|null;
    depositPolicyId?: String|null;

    cancellationPolicy: Policy|null;
    cancellationPolicyId?: string|null;

    guaranteePolicy: Policy|null;
    guaranteePolicyId?: string|null;

    // taxGroup?: TaxGroup;
    taxGroupId?: string|null;

    roomOnlyVisible: boolean;
    b2bAvailable: boolean;
    b2cAvailable: boolean;

    // charges: Charge[];
    // ratePlanRules?: RatePlanRule;
    // Addons: RatePlanWithAddon[];
    // geoRatePlans: GeoRatePlan[];
    // promotions: Promotion[];
    createdAt: Date;
    updatedAt: Date;
    // customizableDeals: CustomizableDeal[];
    // bookingOffsets: BookingOffset[];
}

export interface Charge {
    id: string;
    propertyCode: string;
    ratePlanName: string;
    ratePlanCode: string;
    roomId: string;
    roomTypeCode: string;
    roomTypeName: string;
    currencyCode: CurrencyCode;
    date: Date;
    isAvailable: boolean;
    // Days of week applicability
    isSaleStopped: boolean;
    monApplicable: boolean;
    tueApplicable: boolean;
    wedApplicable: boolean;
    thuApplicable: boolean;
    friApplicable: boolean;
    satApplicable: boolean;
    sunApplicable: boolean;
    isClosedToArrival: boolean;
    isClosedToDeparture: boolean;
    restrictionNotes?: string|null;

    // Relations
    // ratePlan?: RatePlan;
    Room?: Room;
    baseGuestAmounts: ChargeBaseByGuest[];
    additionalGuestAmounts: ChargeAdditionalGuest[];

    createdAt: Date;
    updatedAt: Date;
}

// ============ TaxGroup Interface ============

export interface TaxGroup {
    id: string;
    name: string;
    isActive: boolean;
    propertyId: string;
    createdAt: Date;
    updatedAt: Date;
}

// ============ TaxGroup With Relations ============

export interface ITaxGroupWithDetails extends TaxGroup {
    property: Property;
    taxGroupRules: TaxGroupRule[];
    ratePlans: RatePlan[];
}

// ============ TaxGroupRule Interface ============

export interface TaxGroupRule {
    id: string;
    taxGroupId: string;
    taxRuleId: string;
    taxRule: TaxRule;
    createdAt: Date;
    updatedAt: Date;
}

// ============ TaxRule Interface ============

export interface TaxRule {
    id: string;
    name: string;
    type: string;  // TaxType enum
    value: number;
    applicableOn: string;  // TaxApplicableOn enum
    description: string | null;
    validFrom: Date;
    validTo: Date;
    isInclusive: boolean;
    priority: number;
    propertyId: string;
    taxGroupRules: TaxGroupRule[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Property {
    id: string;
    propertyName: string;
    propertyEmail: string;
    propertyContact: string;
    propertyCode: string;
    description: string;
    image: string[];
    starRating: number | null;
    isDraft: boolean;
    isAvailable: boolean;
    isDeleted: boolean;
    createdById: string;
    creationId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPropertyWithDetails extends Property {
    propertyAddress: PropertyAddress | null;
    propertyCategory:
        | (PropertyCategory & {
              masterCategory: MasterPropertyCategory | null;
          })
        | null;
    propertyType:
        | (PropertyType & {
              masterPropertyType: MasterPropertyType | null;
          })
        | null;
    propertyAmenities: (PropertyAmenitySelection & {
        amenity: MasterAmenity | null;
    })[];
    propertyVideos: IPropertyVideo | null;
    propertyRooms: (Room & {
        roomAmenities: (RoomAmenitySelection & {
            amenity: MasterAmenity | null;
        })[];
        roomVideos: IRoomVideo | null;
    })[];
    bankDetails: BankDetails | null;
    ratePlans: (RatePlan & {
        cancellationPolicy: Policy | null;
        depositPolicy: Policy | null;
        guaranteePolicy: Policy | null;
    })[];
}

export interface IInventoryItem extends Inventory {}

export interface IChargeWithGuestAmounts extends Charge {
    baseGuestAmounts: ChargeBaseByGuest[];
    additionalGuestAmounts: ChargeAdditionalGuest[];
}

// ============ Service Input Types ============

// types/search.types.ts
export interface ISearchQueryParams {
    location: string;
    checkIn: Date;
    checkOut: Date;
    rooms: number;
    adults: number;
    children: number;
    minPrice?: number;
    maxPrice?: number;
    star_rating?: number[];
    amenities?: Record<string, boolean>; // Property amenities
    roomAmenities?: Record<string, boolean>; // Room amenities
    roomView?: string[]; // RoomView enum values
    smokingPolicy?: string[]; // SmokingPolicy enum values
    bedrooms?: number[];
    roomType?: string[];
    maxOccupancy?: number[];
    propertyTypes?: string[];
    propertyCategories?: string[];
    paymentAcceptedMethods?: {
        payByCard?: boolean;
        payAtHotel?: boolean;
    };
    sort?: string;
}

export interface IParsedSearchParams {
    location: string;
    checkIn: Date;
    checkOut: Date;
    nights: number;
    rooms: number;
    adults: number;
    children: number;
}

// ============ Response Types ============

export interface ISearchRatePlan {
    ratePlanId: string;
    ratePlanCode: string;
    ratePlanName: string;
    baseAmountPerNight: number;
    totalAmount: number;
    currencyCode: string;
    cancellationPolicy: string | null;
    depositPolicy: string | null;
    guaranteePolicy: string | null;
    includedAddonIds?: string[];
}

export interface IRoomVideo {
    id: string;
    roomId: string;
    url: string;
    thumbnail: string | null;
    createdAt: Date;
}

export interface IPropertyVideo {
    id: string;
    propertyId: string;
    url: string;
    thumbnail: string | null;
    createdAt: Date;
}
export interface ISearchRoom {
    id: string;
    roomName: string;
    roomType: string;
    roomSize: number;
    roomUnit: string;
    roomView: string;
    maxOccupancy: number;
    numberOfBedrooms: number;
    smokingPolicy: string;
    floor: string;
    images: string[];
    amenities: string[];
    availabilityCount: number;
    baseAmount: number;
    currencyCode: string;
    ratePlans: ISearchRatePlan[];
}

export interface ISearchPropertyResult {
    id: string;
    propertyName: string;
    propertyCode: string;
    propertyEmail: string;
    propertyContact: string;
    starRating: number | null;
    description: string;
    images: string[];
    coordinates: {
        latitude: number;
        longitude: number;
    };
    address: {
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string;
        country: string;
        zipCode: string;
        landmark: string;
    };
    amenities: Record<string, boolean>;
    propertyCategory: string | null;
    propertyType: string | null;
    availableRooms: ISearchRoom[];
    baseAmount: number;
    currencyCode: string;
    availabilityCount: number;
    paymentAcceptedMethods: {
        payByCard: boolean;
        payAtHotel: boolean;
    };
    nights: number;
    checkIn: string;
    checkOut: string;
}
