// NO PRISMA IMPORTS NEEDED AT TOP

// ===== BASE INTERFACES (replace Prisma models) =====

export interface IProperty {
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
}

export interface IPropertyAddress {
    id: string;
    addressLine1: string;
    addressLine2?: string;
    country: string;
    state: string;
    city: string;
    location: string;
    landmark: string;
    zipCode: string;
    latitude: string;
    longitude: string;
    propertyId: string;
}

export interface IMasterAmenity {
    id: string;
    amenityName: string;
    amenityType: string;
    description?: string;
    icon?: string;
    isActive: boolean;
}

export interface IPropertyAmenitySelection {
    id: string;
    propertyId: string;
    amenityId: string;
    amenity: IMasterAmenity | null;
}

export interface IRoomAmenitySelection {
    id: string;
    roomId: string;
    amenityId: string;
    amenity: IMasterAmenity | null;
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

export interface IPolicy {
    id: string;
    policyName: string;
    type: string;
    description: string;
    propertyId: string;
}

export interface IRatePlanBase {
    id: string;
    ratePlanName: string;
    ratePlanCode: string;
    deviceType: string[];
    propertyId: string;
    depositPolicyId: string | null;
    cancellationPolicyId: string | null;
    guaranteePolicyId: string | null;
    taxGroupId: string | null;
    roomOnlyVisible: boolean;
    b2bAvailable: boolean;
    b2cAvailable: boolean;
}

export interface IInventoryBase {
    id: string;
    propertyCode: string;
    roomTypeCode: string;
    date: Date;
    availability: number;
    ratePlans: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IChargeBase {
    id: string;
    propertyCode: string;
    ratePlanName: string;
    ratePlanCode: string;
    roomId: string;
    roomTypeCode: string;
    roomTypeName: string;
    currencyCode: string;
    date: Date;
    isAvailable: boolean;
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
    restrictionNotes?: string | null;
}

export interface IChargeBaseByGuest {
    id: string;
    chargeId: string;
    ageQualifyingCode: string;
    amountBeforeTax: number;
    numberOfGuests: number;
}

export interface IChargeAdditionalGuest {
    id: string;
    chargeId: string;
    ageQualifyingCode: string;
    amount: number;
}

export interface IAddonCategory {
    id: string;
    name: string;
    code: string;
}

export interface IAddonSubCategory {
    id: string;
    name: string;
    code: string;
}

export interface IAddonVariant {
    id: string;
    name: string;
    code: string;
}

export interface IChildAddon {
    id: string;
    addonId: string;
    minAge: number;
    maxAge: number;
    discountApplicable: boolean;
    discountType: string | null;
    discountAmount: number | null;
}

export interface IAddonAvailabilityBase {
    id: string;
    addonId: string;
    date: Date;
    price: number;
    quantity?: number;
    isAvailable: boolean;
    currencyCode: string;
}

export interface IGeoRatePlanBase {
    id: string;
    propertyId: string;
    roomId: string | null;
    ratePlanId: string;
    countryCode: string[];
    restrictionType: string;
    restrictionTypeAction: string | null;
    restrictionValue: number | null;
    isActive: boolean;
}

export interface IPromotionBase {
    id: string;
    propertyId: string;
    roomId: string | null;
    ratePlanId: string;
    promotionName: string;
    promotionType: string;
    discountType: string;
    discountValue: number | null;
    isActive: boolean;
    isAutoApplied: boolean;
    validFrom: Date | null;
    validTo: Date | null;
    advanceBookingDays: number | null;
    deviceType: string[];
    roomType: string | null;
    monApplicable: boolean;
    tueApplicable: boolean;
    wedApplicable: boolean;
    thuApplicable: boolean;
    friApplicable: boolean;
    satApplicable: boolean;
    sunApplicable: boolean;
}

export interface IRatePlanRuleBase {
    id: string;
    ratePlanId: string;
    minLos: number | null;
    maxLos: number | null;
    startDate: Date | null;
    endDate: Date | null;
    discountType: string | null;
    discountValue: number | null;
    isActive: boolean;
    isAutoApplied: boolean;
}

export interface ITouristTaxBase {
    id: string;
    // ratePlanId: string;
    roomId: string;
    name: string | null;
    discountType: string;
    discountValue: number | null;
    currencyCode: string | null;
}

export interface IBookingOffsetBase {
    id: string;
    ratePlanId: string;
    date: Date;
    minimumAdvanceBookingOffset: number | null;
    maximumAdvanceBookingOffset: number | null;
    isActive: boolean;
}

export interface IPromoCodeBase {
    id: string;
    code: string;
    propertyId: string;
    discountType: string;
    discountValue: number;
    maxDiscountAmount: number | null;
    minBookingAmount: number | null;
    isApplicableForDesktop: boolean;
    isApplicableForMobileApp: boolean;
    isApplicableForTablet: boolean;
    applicableRoomTypes: any[];
    applicableRatePlans: any[];
    validFrom: Date | null;
    validTo: Date | null;
    isActive: boolean;
    isDeleted: boolean;
}

export interface IPropertyConfigs {
    id: string;
    propertyId: string;
    showVideo: boolean;
}

export interface IBookingEngineConfigurations {
    id: string;
    propertyId: string;
}

export interface IPropertyLoyaltyConfig {
    id: string;
    propertyId: string;
    isActive: boolean;
    discountPercentage: number | null;
    creationLoyaltyConfigId: string;
}

// ===== COMPOSED INTERFACES (used in services) =====

export interface IPropertyWithRooms extends IProperty {
    propertyAddress: IPropertyAddress | null;
    propertyAmenities: IPropertyAmenitySelection[];
    propertyVideos: IPropertyVideo | null;
    propertyRooms: (IRoomBase & {
        roomAmenities: IRoomAmenitySelection[];
        roomVideos: IRoomVideo | null;
    })[];
    propertyConfigs: IPropertyConfigs | null;
    ratePlans: (IRatePlanBase & {
        depositPolicy: IPolicy | null;
        cancellationPolicy: IPolicy | null;
        guaranteePolicy: IPolicy | null;
    })[];
    bookingEngineConfig: IBookingEngineConfigurations | null;
    loyaltyProgramConfig: IPropertyLoyaltyConfig | null;
}

export interface IRoomBase {
    id: string;
    roomName: string;
    roomType: string;
    totalRoom: number;
    floor: number;
    roomView: string;
    roomSize: number;
    roomUnit: string;
    smokingPolicy: string;
    maxOccupancy: number;
    maxNumberOfAdults: number;
    maxNumberOfChildren: number;
    numberOfBedrooms: number;
    numberOfBeds: number;
    numberOfLivingRoom: number;
    extraBed: number;
    description?: string;
    priority: number;
    view360Link?: string;
    image: string[];
    available: boolean;
    isDeleted: boolean;
    propertyId: string;
}

export interface IInventoryItem extends IInventoryBase {}

export interface IPromoCodeItem extends IPromoCodeBase {}

export interface IChargeWithGuestAmounts extends IChargeBase {
    baseGuestAmounts: IChargeBaseByGuest[];
    additionalGuestAmounts: IChargeAdditionalGuest[];
}

export interface IAddonWithDetails {
    id: string;
    name: string;
    code: string;
    propertyId: string;
    postingRhythm: string;
    description: string | null;
    images: string[];
    isActive: boolean;
    category: IAddonCategory | null;
    subCategory: IAddonSubCategory | null;
    addonVariant: IAddonVariant | null;
    ChildAddons: IChildAddon[];
    availability: IAddonAvailabilityBase[];
}

export interface IRatePlanWithAddonDetails {
    id: string;
    ratePlanId: string;
    addonId: string;
    addon: IAddonWithDetails;
}

export interface IAddonAvailabilityItem extends IAddonAvailabilityBase {}

export interface IGeoRatePlanItem extends IGeoRatePlanBase {}

export interface IPromotionItem extends IPromotionBase {}

export interface IRatePlanRuleItem extends IRatePlanRuleBase {}

export interface ITouristTaxItem extends ITouristTaxBase {}

export interface IBookingOffsetItem extends IBookingOffsetBase {}
