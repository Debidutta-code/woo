import {
    errorResponse,
    IApiResponse,
    successResponse,
} from '../../../../common/utils';
import { SearchRepository } from '../repository';
import {
    IParsedSearchParams,
    ISearchPropertyResult,
    ISearchQueryParams,
    ISearchRatePlan,
    ISearchRoom,
    IPropertyWithDetails,
    IChargeWithGuestAmounts,
    IInventoryItem,
    BookingOffset,
} from '../types/search.types';

export class SearchService {
    private searchRepository: SearchRepository;

    constructor() {
        this.searchRepository = new SearchRepository();
    }

    private toUTCDate(date: Date): Date {
        return new Date(
            Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                0,
                0,
                0,
                0
            )
        );
    }

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    private toCamelCase(str: string): string {
        return str
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
    }

    private parseAndValidateParams(
        reqQuery: any
    ): ISearchQueryParams & { nights: number } {
        let {
            location,
            checkIn,
            checkin,
            checkOut,
            checkout,
            rooms,
            adults,
            children,
            minPrice,
            maxPrice,
            star_rating,
            amenities,
            roomAmenities,
            roomView,
            roomType,
            smokingPolicy,
            bedrooms,
            maxOccupancy,
            propertyTypes,
            propertyCategories,
            paymentAcceptedMethods,
            sort,
        } = reqQuery;

        checkIn = checkIn ?? checkin;
        checkOut = checkOut ?? checkout;

        // Validate location
        if (
            !location ||
            typeof location !== 'string' ||
            location.trim() === ''
        ) {
            throw new Error('location is required');
        }

        // Set default dates
        if (!checkIn) {
            const today = new Date();
            checkIn = today.toISOString().split('T')[0];
        }

        if (!checkOut) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            checkOut = tomorrow.toISOString().split('T')[0];
        }

        // Validate numbers
        if (adults && isNaN(Number(adults))) {
            throw new Error('adults must be a valid number');
        }

        if (children && isNaN(Number(children))) {
            throw new Error('children must be a valid number');
        }

        if (rooms && isNaN(Number(rooms))) {
            throw new Error('rooms must be a valid number');
        }

        // Validate date strings
        const checkinDateObj = new Date(String(checkIn));
        const checkoutDateObj = new Date(String(checkOut));

        if (isNaN(checkinDateObj.getTime())) {
            throw new Error('Invalid checkin date');
        }

        if (isNaN(checkoutDateObj.getTime())) {
            throw new Error('Invalid checkout date');
        }

        // Convert to UTC
        const checkinDate = this.toUTCDate(checkinDateObj);
        const checkoutDate = this.toUTCDate(checkoutDateObj);

        // Validate date order
        if (checkoutDate <= checkinDate) {
            throw new Error('checkout must be after checkin');
        }

        // Calculate nights
        const nights = Math.round(
            (checkoutDate.getTime() - checkinDate.getTime()) /
                (1000 * 60 * 60 * 24)
        );

        if (nights < 1) {
            throw new Error('Minimum stay is 1 night');
        }

        // Parse filters
        const parsedStarRating = star_rating
            ? JSON.parse(star_rating as string)
            : undefined;
        const parsedAmenities = amenities
            ? JSON.parse(amenities as string)
            : undefined;
        const parsedRoomAmenities = roomAmenities
            ? JSON.parse(roomAmenities as string)
            : undefined;
        const parsedRoomView = roomView
            ? JSON.parse(roomView as string)
            : undefined;
        const parsedSmokingPolicy = smokingPolicy
            ? JSON.parse(smokingPolicy as string)
            : undefined;
        const parsedBedrooms = bedrooms
            ? JSON.parse(bedrooms as string)
            : undefined;
        const parsedMaxOccupancy = maxOccupancy
            ? JSON.parse(maxOccupancy as string)
            : undefined;
        const parsedPropertyTypes = propertyTypes
            ? JSON.parse(propertyTypes as string)
            : undefined;
        const parsedPropertyCategories = propertyCategories
            ? JSON.parse(propertyCategories as string)
            : undefined;
        const parsedPaymentMethods = paymentAcceptedMethods
            ? JSON.parse(paymentAcceptedMethods as string)
            : undefined;
        const parsedRoomType = roomType
            ? JSON.parse(roomType as string)
            : undefined;

        return {
            location: location.trim(),
            checkIn: checkinDate,
            checkOut: checkoutDate,
            nights,
            rooms: rooms ? Number(rooms) : 1,
            adults: adults ? Number(adults) : 1,
            children: children ? Number(children) : 0,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            star_rating: parsedStarRating,
            amenities: parsedAmenities,
            roomAmenities: parsedRoomAmenities,
            roomView: parsedRoomView,
            smokingPolicy: parsedSmokingPolicy,
            bedrooms: parsedBedrooms,
            maxOccupancy: parsedMaxOccupancy,
            propertyTypes: parsedPropertyTypes,
            propertyCategories: parsedPropertyCategories,
            paymentAcceptedMethods: parsedPaymentMethods,
            roomType: parsedRoomType,
            sort: sort as string,
        };
    }

    private buildMeta(params: any, total: number) {
        return {
            location: params.location,
            checkIn: this.formatDate(params.checkIn),
            checkOut: this.formatDate(params.checkOut),
            nights: params.nights,
            rooms: params.rooms,
            adults: params.adults,
            children: params.children,
            total,
        };
    }

    private applySorting(
        properties: ISearchPropertyResult[],
        sort: string
    ): ISearchPropertyResult[] {
        switch (sort) {
            case 'price_asc':
                return [...properties].sort(
                    (a, b) => a.baseAmount - b.baseAmount
                );
            case 'price_desc':
                return [...properties].sort(
                    (a, b) => b.baseAmount - a.baseAmount
                );
            case 'rating_desc':
                return [...properties].sort(
                    (a, b) => (b.starRating || 0) - (a.starRating || 0)
                );
            case 'rating_asc':
                return [...properties].sort(
                    (a, b) => (a.starRating || 0) - (b.starRating || 0)
                );
            default:
                return properties;
        }
    }

    private isPositiveOffset(
        value: number | null | undefined
    ): value is number {
        return typeof value === 'number' && Number.isFinite(value) && value > 0;
    }

    private isBookingOffsetValid(
        bookingOffset: BookingOffset | null,
        checkInDate: Date
    ): boolean {
        if (!bookingOffset) return true;

        const hoursUntilCheckIn =
            (this.toUTCDate(checkInDate).getTime() -
                this.toUTCDate(new Date()).getTime()) /
            (1000 * 60 * 60);

        if (
            this.isPositiveOffset(bookingOffset.minimumAdvanceBookingOffset) &&
            hoursUntilCheckIn < bookingOffset.minimumAdvanceBookingOffset
        ) {
            return false;
        }

        if (
            this.isPositiveOffset(bookingOffset.maximumAdvanceBookingOffset) &&
            hoursUntilCheckIn > bookingOffset.maximumAdvanceBookingOffset
        ) {
            return false;
        }

        return true;
    }

    private async transformProperty(
        property: IPropertyWithDetails,
        params: any,
        dates: Date[]
    ): Promise<ISearchPropertyResult | null> {
        const { adults, children, rooms, nights } = params;
        const totalGuests = adults + children;

        const availableRooms: ISearchRoom[] = [];
        let propertyBaseAmount = Infinity;
        let propertyCurrency = 'USD';
        let totalAvailability = 0;

        for (const room of property.propertyRooms) {
            // Guest capacity validation
            const maxOccupancy = room.maxOccupancy ?? 0;
            const maxAdults = room.maxNumberOfAdults ?? 0;
            const maxChildren = room.maxNumberOfChildren ?? 0;

            if (maxOccupancy < totalGuests) continue;
            if (maxAdults < adults) continue;
            if (children > 0 && maxChildren < children) continue;

            // Check inventory availability
            const inventory = await this.searchRepository.getInventoryByRoom(
                property.propertyCode,
                room.roomType,
                dates,
                rooms
            );

            const inventoryDateStrings = new Set(
                inventory.map(
                    (item: IInventoryItem) =>
                        new Date(item.date).toISOString().split('T')[0]
                )
            );
            const allDatesHaveInventory = dates.every(date =>
                inventoryDateStrings.has(date.toISOString().split('T')[0])
            );
            if (!allDatesHaveInventory) continue;

            const inventoryCount = Math.min(
                ...inventory.map((item: IInventoryItem) => item.availability)
            );
            if (inventoryCount < rooms) continue;

            // Get rate plans
            const ratePlans: ISearchRatePlan[] = [];

            for (const ratePlan of property.ratePlans) {
                const bookingOffset =
                    await this.searchRepository.getBookingOffset(
                        ratePlan.id,
                        params.checkIn
                    );

                if (!this.isBookingOffsetValid(bookingOffset, params.checkIn)) {
                    continue;
                }

                const charges = await this.searchRepository.getCharges(
                    property.propertyCode,
                    room.roomType,
                    ratePlan.ratePlanCode,
                    dates
                );

                const chargeDateStrings = new Set(
                    charges.map(
                        (charge: IChargeWithGuestAmounts) =>
                            new Date(charge.date).toISOString().split('T')[0]
                    )
                );
                const allDatesHaveCharge = dates.every(date =>
                    chargeDateStrings.has(date.toISOString().split('T')[0])
                );
                if (!allDatesHaveCharge) continue;

                // Check restrictions
                const restricted = charges.some(
                    (charge: IChargeWithGuestAmounts) => {
                        if (charge.isSaleStopped) return true;
                        const dow = new Date(charge.date).getDay();
                        const dowFields: Record<
                            number,
                            keyof IChargeWithGuestAmounts
                        > = {
                            0: 'sunApplicable',
                            1: 'monApplicable',
                            2: 'tueApplicable',
                            3: 'wedApplicable',
                            4: 'thuApplicable',
                            5: 'friApplicable',
                            6: 'satApplicable',
                        };
                        const field = dowFields[dow];
                        if (!field || typeof charge[field] === 'undefined')
                            return false;
                        return !charge[field];
                    }
                );
                if (restricted) continue;

                if (charges[0]?.isClosedToArrival) continue;
                if (charges[charges.length - 1]?.isClosedToDeparture) continue;

                const firstCharge = charges[0];
                const sortedBase = [...firstCharge.baseGuestAmounts].sort(
                    (a, b) => a.numberOfGuests - b.numberOfGuests
                );

                const selectedTier =
                    sortedBase.find(
                        base => base.numberOfGuests >= totalGuests
                    ) || sortedBase[sortedBase.length - 1];

                if (!selectedTier) continue;

                const baseAmountPerNight = Number(selectedTier.amountBeforeTax);
                const totalAmount = baseAmountPerNight * nights;
                const currencyCode = firstCharge.currencyCode;

                ratePlans.push({
                    ratePlanId: ratePlan.id,
                    ratePlanCode: ratePlan.ratePlanCode,
                    ratePlanName: ratePlan.ratePlanName,
                    baseAmountPerNight,
                    totalAmount,
                    currencyCode,
                    cancellationPolicy:
                        ratePlan.cancellationPolicy?.description ?? null,
                    depositPolicy: ratePlan.depositPolicy?.description ?? null,
                    guaranteePolicy:
                        ratePlan.guaranteePolicy?.description ?? null,
                });
            }

            if (ratePlans.length === 0) continue;

            ratePlans.sort(
                (a, b) => a.baseAmountPerNight - b.baseAmountPerNight
            );

            const cheapestRate = ratePlans[0].baseAmountPerNight;
            const roomCurrency = ratePlans[0].currencyCode;

            if (cheapestRate > 0 && cheapestRate < propertyBaseAmount) {
                propertyBaseAmount = cheapestRate;
                propertyCurrency = roomCurrency;
            }

            totalAvailability += inventoryCount;

            availableRooms.push({
                id: room.id,
                roomName: room.roomName,
                roomType: room.roomType,
                roomSize: Number(room.roomSize),
                roomUnit: room.roomUnit,
                roomView: room.roomView,
                maxOccupancy: room.maxOccupancy,
                numberOfBedrooms: room.numberOfBedrooms,
                smokingPolicy: room.smokingPolicy,
                floor: room.floor,
                images: room.image ?? [],
                amenities: room.roomAmenities.map(
                    roomAmenity => roomAmenity.amenity?.amenityName ?? ''
                ),
                availabilityCount: inventoryCount,
                baseAmount: cheapestRate,
                currencyCode: roomCurrency,
                ratePlans,
            });
        }

        if (availableRooms.length === 0) return null;

        const amenitiesMap: Record<string, boolean> = {};
        for (const propertyAmenity of property.propertyAmenities) {
            if (propertyAmenity.amenity?.amenityName) {
                amenitiesMap[
                    this.toCamelCase(propertyAmenity.amenity.amenityName)
                ] = true;
            }
        }

        return {
            id: property.id,
            propertyName: property.propertyName,
            propertyCode: property.propertyCode,
            propertyEmail: property.propertyEmail,
            propertyContact: property.propertyContact,
            starRating: property.starRating,
            description: property.description,
            images: property.image ?? [],
            coordinates: {
                latitude: property.propertyAddress?.latitude ?? 0,
                longitude: property.propertyAddress?.longitude ?? 0,
            },
            address: {
                addressLine1: property.propertyAddress?.addressLine1 ?? '',
                addressLine2: property.propertyAddress?.addressLine2 ?? null,
                city: property.propertyAddress?.city ?? '',
                state: property.propertyAddress?.state ?? '',
                country: property.propertyAddress?.country ?? '',
                zipCode: property.propertyAddress?.zipCode ?? '',
                landmark: property.propertyAddress?.landmark ?? '',
            },
            amenities: amenitiesMap,
            propertyCategory:
                property.propertyCategory?.masterCategory?.categoryName ?? null,
            propertyType:
                property.propertyType?.masterPropertyType?.propertyTypeName ??
                null,
            availableRooms,
            baseAmount:
                propertyBaseAmount === Infinity ? 0 : propertyBaseAmount,
            currencyCode: propertyCurrency,
            availabilityCount: totalAvailability,
            paymentAcceptedMethods: {
                payByCard: property.bankDetails?.paymentGateway ?? false,
                payAtHotel: property.bankDetails?.payAtHotel ?? true,
            },
            nights,
            checkIn: this.formatDate(params.checkIn),
            checkOut: this.formatDate(params.checkOut),
        };
    }

    public async searchProperties(reqQuery: any): Promise<IApiResponse> {
        try {
            // Parse and validate parameters
            const params = this.parseAndValidateParams(reqQuery);

            // Generate dates array for the stay period
            const dates: Date[] = [];
            const msPerDay = 1000 * 60 * 60 * 24;
            const checkinTime = params.checkIn.getTime();
            const checkoutTime = params.checkOut.getTime();

            for (
                let time = checkinTime;
                time < checkoutTime;
                time += msPerDay
            ) {
                dates.push(new Date(time));
            }

            // Get properties with filters
            const properties =
                await this.searchRepository.getPropertiesWithFilters(
                    params.location,
                    {
                        minPrice: params.minPrice,
                        maxPrice: params.maxPrice,
                        star_rating: params.star_rating,
                        // amenities: params.amenities,
                        // roomAmenities: params.roomAmenities,
                        roomView: params.roomView,
                        smokingPolicy: params.smokingPolicy,
                        bedrooms: params.bedrooms,
                        roomType: params.roomType,
                        maxOccupancy: params.maxOccupancy,
                        propertyTypes: params.propertyTypes,
                        propertyCategories: params.propertyCategories,
                        paymentAcceptedMethods: params.paymentAcceptedMethods,
                    }
                );

            // ✅ Apply amenities filter (AND logic - must have ALL selected amenities)
            if (params.amenities && Object.keys(params.amenities).length > 0) {
                const filteredProperties = [];
                for (const property of properties) {
                    const propertyAmenities: Record<string, boolean> = {};
                    for (const propertyAmenity of property.propertyAmenities) {
                        if (propertyAmenity.amenity?.amenityName) {
                            const amenityKey = this.toCamelCase(
                                propertyAmenity.amenity.amenityName
                            );
                            propertyAmenities[amenityKey] = true;
                        }
                    }

                    const hasAllAmenities = Object.keys(params.amenities).every(
                        selectedAmenity => {
                            const selectedLower = selectedAmenity.toLowerCase();
                            return Object.keys(propertyAmenities).some(
                                propertyAmenity =>
                                    propertyAmenity.toLowerCase() ===
                                    selectedLower
                            );
                        }
                    );

                    if (hasAllAmenities) {
                        filteredProperties.push(property);
                    }
                }
                properties.length = 0;
                properties.push(...filteredProperties);
            }

            // ✅ Apply room amenities filter (AND logic)
            if (
                params.roomAmenities &&
                Object.keys(params.roomAmenities).length > 0
            ) {
                const filteredProperties = [];
                for (const property of properties) {
                    let hasAllRoomAmenities = false;
                    for (const room of property.propertyRooms) {
                        const roomAmenities = room.roomAmenities.map(
                            ra =>
                                ra.amenity?.amenityName
                                    ?.toLowerCase()
                                    .replace(/\s/g, '') ?? ''
                        );
                        const allSelectedPresent = Object.keys(
                            params.roomAmenities
                        ).every(selected =>
                            roomAmenities.includes(
                                selected.toLowerCase().replace(/\s/g, '')
                            )
                        );
                        if (allSelectedPresent) {
                            hasAllRoomAmenities = true;
                            break;
                        }
                    }
                    if (hasAllRoomAmenities) {
                        filteredProperties.push(property);
                    }
                }
                properties.length = 0;
                properties.push(...filteredProperties);
            }

            // Return if no properties after filtering
            if (!properties || properties.length === 0) {
                return {
                    success: false,
                    message: `No hotels found matching the provided location`,
                };
            }

            // Transform each property
            const results: ISearchPropertyResult[] = [];
            for (const property of properties) {
                const transformed = await this.transformProperty(
                    property,
                    {
                        location: params.location,
                        checkIn: params.checkIn,
                        checkOut: params.checkOut,
                        nights: params.nights,
                        rooms: params.rooms,
                        adults: params.adults,
                        children: params.children,
                    },
                    dates
                );
                if (transformed) results.push(transformed);
            }

            if (results.length === 0) {
                return {
                    success: false,
                    message: `No hotels found matching the provided location`,
                };
            }

            let sortedResults = results;
            if (params.sort) {
                sortedResults = this.applySorting(results, params.sort);
            }

            return successResponse(
                `Found ${sortedResults.length} hotel${sortedResults.length !== 1 ? 's' : ''} in ${params.location}`,
                sortedResults,
                this.buildMeta(params, sortedResults.length)
            );
        } catch (error) {
            console.error('Search service error:', error);
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('Failed to search properties');
        }
    }

    public async getUniqueCities() {
        try {
            const cities = await this.searchRepository.getUniqueCities();
            return {
                status: 'success',
                data: cities,
            };
        } catch (error) {
            console.error('Error in getUniqueCities service:', error);
            throw new Error('Failed to fetch cities');
        }
    }

    public async getAmenities() {
        try {
            const amenities = await this.searchRepository.getAmenities();
            return {
                success: true,
                data: amenities,
            };
        } catch (error) {
            console.error('Error in getAmenities service:', error);
            throw new Error('Failed to fetch amenities');
        }
    }
    public async getPropertyCategories() {
        try {
            const categories =
                await this.searchRepository.getPropertyCategories();
            return {
                success: true,
                data: categories,
            };
        } catch (error) {
            console.error('Error in getPropertyCategories service:', error);
            throw new Error('Failed to fetch property categories');
        }
    }
    public async getPropertyTypes() {
        try {
            const propertyTypes =
                await this.searchRepository.getPropertyTypes();
            return {
                success: true,
                data: propertyTypes,
            };
        } catch (error) {
            console.error('Error in getPropertyTypes service:', error);
            throw new Error('Failed to fetch property types');
        }
    }
}
