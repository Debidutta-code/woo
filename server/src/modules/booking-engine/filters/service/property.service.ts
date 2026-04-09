// booking-engine/service/property.service.ts

import { errorResponse, IApiResponse, successResponse } from '../../../../common/utils';
import { PropertyRepository } from '../repository/property.repository';
import {
    IPropertyDetailQueryParams,
    IParsedPropertyDetailParams,
    IPropertyDetailResult,
    ISearchRoom,
    IVideoDetail,
} from '../types/property.types';
import {
    ISearchRatePlan,
    IInventoryItem,
    IChargeWithGuestAmounts,
    IPropertyWithDetails,
} from '../types/search.types';

export class PropertyService {
    private propertyRepository: PropertyRepository;

    constructor() {
        this.propertyRepository = new PropertyRepository();
    }

    public async getPropertyDetails(query: IPropertyDetailQueryParams):Promise<IApiResponse> {
        try {
            const params = this.parseParams(query);

            // Build dates array
            const dates: Date[] = [];
            const msPerDay = 1000 * 60 * 60 * 24;
            for (
                let time = params.checkIn.getTime();
                time < params.checkOut.getTime();
                time += msPerDay
            ) {
                dates.push(new Date(time));
            }

            // ✅ Fetch property by ID (not propertyCode)
            const property = await this.propertyRepository.getPropertyById(
                params.propertyId
            );

            if (!property) {
                return errorResponse('Property not found');
            }

            // Transform
            const result = await this.transformProperty(property, params, dates);

            if (!result) {
                return successResponse(
                    'No available rooms found for the selected dates',
                    null,
                    this.buildMeta(params)
                );
            }

            return successResponse(
                `Property details for ${result.propertyName}`,
                result,
                this.buildMeta(params)
            );

        } catch (error) {
            console.error('Property detail service error:', error);
            if (error instanceof Error) {
                return errorResponse('Failed to fetch property details', error.message);
            }
            return errorResponse('Failed to fetch property details');
        }
    }

    private parseParams(query: IPropertyDetailQueryParams): IParsedPropertyDetailParams {
        // ✅ Use propertyId instead of propertyCode
        const propertyId = query.propertyId.trim();
        const rooms = Math.max(1, query.rooms);
        const adults = Math.max(1, query.adults);
        const children = Math.max(0, query.children);
        const checkIn = query.checkIn;
        const checkOut = query.checkOut;

        const nights = Math.round(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        );

        return { propertyId, checkIn, checkOut, nights, rooms, adults, children };
    }

    private buildMeta(params: IParsedPropertyDetailParams) {
        return {
            // ✅ Use propertyId in meta
            propertyId: params.propertyId,
            checkIn: this.formatDate(params.checkIn),
            checkOut: this.formatDate(params.checkOut),
            nights: params.nights,
            rooms: params.rooms,
            adults: params.adults,
            children: params.children,
        };
    }

    private async transformProperty(
        property: IPropertyWithDetails,
        params: IParsedPropertyDetailParams,
        dates: Date[]
    ): Promise<IPropertyDetailResult | null> {
        const { adults, children, rooms, nights } = params;
        const totalGuests = adults + children;

        const availableRooms: ISearchRoom[] = [];
        let propertyBaseAmount = Infinity;
        let propertyCurrency = 'USD';
        let totalAvailability = 0;

        for (const room of property.propertyRooms) {
            // Guest capacity check
            const maxOccupancy = room.maxOccupancy ?? 0;
            const maxAdults = room.maxNumberOfAdults ?? 0;
            const maxChildren = room.maxNumberOfChildren ?? 0;

            if (maxOccupancy < totalGuests) continue;
            if (maxAdults < adults) continue;
            if (children > 0 && maxChildren < children) continue;

            // Inventory check
            const inventory = await this.propertyRepository.getInventoryByRoom(
                property.propertyCode,
                room.roomType,
                dates,
                rooms
            );

            const inventoryDateStrings = new Set(
                inventory.map((item: IInventoryItem) =>
                    new Date(item.date).toISOString().split('T')[0]
                )
            );
            const allDatesHaveInventory = dates.every(
                (date) => inventoryDateStrings.has(date.toISOString().split('T')[0])
            );
            if (!allDatesHaveInventory) continue;

            const inventoryCount = Math.min(
                ...inventory.map((item: IInventoryItem) => item.availability)
            );
            if (inventoryCount < rooms) continue;

            // Rate plans
            const ratePlans: ISearchRatePlan[] = [];

            for (const ratePlan of property.ratePlans) {
                const charges = await this.propertyRepository.getCharges(
                    property.propertyCode,
                    room.roomType,
                    ratePlan.ratePlanCode,
                    dates
                );

                const chargeDateStrings = new Set(
                    charges.map((charge: IChargeWithGuestAmounts) =>
                        new Date(String(charge.date)).toISOString().split('T')[0]
                    )
                );
                const allDatesHaveCharge = dates.every(
                    (date) => chargeDateStrings.has(date.toISOString().split('T')[0])
                );
                if (!allDatesHaveCharge) continue;

                // Restrictions check
                const restricted = charges.some((charge: IChargeWithGuestAmounts) => {
                    if (charge.isSaleStopped) return true;
                  const dow = new Date(String(charge.date)).getDay();
                    const dowFields: Record<number, keyof IChargeWithGuestAmounts> = {
                        0: 'sunApplicable',
                        1: 'monApplicable',
                        2: 'tueApplicable',
                        3: 'wedApplicable',
                        4: 'thuApplicable',
                        5: 'friApplicable',
                        6: 'satApplicable',
                    };
                    const field = dowFields[dow];
                    if (!field || typeof charge[field] === 'undefined') return false;
                    return !charge[field];
                });
                if (restricted) continue;

                if (charges[0]?.isClosedToArrival) continue;
                if (charges[charges.length - 1]?.isClosedToDeparture) continue;

                // Guest tier
                const firstCharge = charges[0];
                const sortedBase = [...firstCharge.baseGuestAmounts].sort(
                    (a, b) => a.numberOfGuests - b.numberOfGuests
                );
                const selectedTier =
                    sortedBase.find((base) => base.numberOfGuests >= totalGuests) ||
                    sortedBase[sortedBase.length - 1];

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
                    cancellationPolicy: ratePlan.cancellationPolicy?.description ?? null,
                    depositPolicy: ratePlan.depositPolicy?.description ?? null,
                    guaranteePolicy: ratePlan.guaranteePolicy?.description ?? null,
                });
            }

            if (ratePlans.length === 0) continue;

            ratePlans.sort((a, b) => a.baseAmountPerNight - b.baseAmountPerNight);

            const cheapestRate = ratePlans[0].baseAmountPerNight;
            const roomCurrency = ratePlans[0].currencyCode;

            if (cheapestRate > 0 && cheapestRate < propertyBaseAmount) {
                propertyBaseAmount = cheapestRate;
                propertyCurrency = roomCurrency;
            }

            totalAvailability += inventoryCount;

            // Room video
            const roomVideo: IVideoDetail | null = room.roomVideos
                ? { url: room.roomVideos.url, thumbnail: room.roomVideos.thumbnail ?? null }
                : null;

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
                video: roomVideo,
                view360Link: room.view360Link ?? null,
                amenities: room.roomAmenities.map(
                    (ra: any) => ra.amenity?.amenityName ?? ''
                ),
                availabilityCount: inventoryCount,
                baseAmount: cheapestRate,
                currencyCode: roomCurrency,
                ratePlans,
            });
        }

        if (availableRooms.length === 0) return null;

        // Property amenities
        const amenitiesMap: Record<string, boolean> = {};
        for (const pa of property.propertyAmenities) {
            if (pa.amenity?.amenityName) {
                amenitiesMap[this.toCamelCase(pa.amenity.amenityName)] = true;
            }
        }

        // Property video
        const propertyVideo: IVideoDetail | null = property.propertyVideos
            ? {
                url: property.propertyVideos.url,
                thumbnail: property.propertyVideos.thumbnail ?? null,
            }
            : null;

        return {
            id: property.id,
            propertyName: property.propertyName,
            propertyCode: property.propertyCode,
            propertyEmail: property.propertyEmail,
            propertyContact: property.propertyContact,
            starRating: property.starRating,
            description: property.description,
            images: property.image ?? [],
            video: propertyVideo,
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
            propertyCategory: property.propertyCategory?.masterCategory?.categoryName ?? null,
            propertyType: property.propertyType?.masterPropertyType?.propertyTypeName ?? null,
            availableRooms,
            baseAmount: propertyBaseAmount === Infinity ? 0 : propertyBaseAmount,
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

    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    private toCamelCase(str: string): string {
        return str
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
    }
}