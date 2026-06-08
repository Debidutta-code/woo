import { prisma } from '../../../../config';
import {
    IPropertyWithDetails,
    IInventoryItem,
    IChargeWithGuestAmounts,
    BookingOffset,
} from '../types/search.types';

export class SearchRepository {
    public async findPropertyIdsByCity(location: string): Promise<string[]> {
        try {
            const addresses = await prisma.propertyAddress.findMany({
                where: {
                    city: {
                        equals: location,
                        mode: 'insensitive',
                    },
                },
                select: { propertyId: true },
            });
            return addresses.map(address => address.propertyId);
        } catch (error) {
            console.error('Error finding properties by city:', error);
            throw new Error('Failed to find properties by city');
        }
    }

    public async getPropertiesByIds(
        propertyIds: string[],
        limit: number = 20
    ): Promise<IPropertyWithDetails[]> {
        try {
            const properties = await prisma.property.findMany({
                where: {
                    id: { in: propertyIds },
                    isDeleted: false,
                    isAvailable: true,
                },
                take: limit,
                include: {
                    propertyVideos: true,
                    propertyAddress: true,
                    propertyCategory: {
                        include: {
                            masterCategory: true,
                        },
                    },
                    propertyType: {
                        include: {
                            masterPropertyType: true,
                        },
                    },
                    propertyAmenities: {
                        include: {
                            amenity: true,
                        },
                    },
                    propertyRooms: {
                        where: {
                            available: true,
                            isDeleted: false,
                        },
                        orderBy: { priority: 'asc' },
                        include: {
                            roomAmenities: {
                                include: {
                                    amenity: true,
                                },
                            },
                            roomVideos: true,
                        },
                    },
                    bankDetails: true,
                    ratePlans: {
                        where: { b2cAvailable: true },
                        include: {
                            cancellationPolicy: true,
                            depositPolicy: true,
                            guaranteePolicy: true,
                        },
                    },
                },
            });

            return properties as unknown as IPropertyWithDetails[];
        } catch (error) {
            console.error('Error fetching properties by ids:', error);
            throw new Error('Failed to fetch properties');
        }
    }

    public async getInventoryByRoom(
        propertyCode: string,
        roomTypeCode: string,
        dates: Date[],
        requiredRooms: number
    ): Promise<IInventoryItem[]> {
        try {
            const inventory = await prisma.inventory.findMany({
                where: {
                    propertyCode,
                    roomTypeCode,
                    date: { in: dates },
                    availability: { gte: requiredRooms },
                },
            });
            return inventory;
        } catch (error) {
            console.error('Error fetching inventory by room:', error);
            throw new Error('Failed to fetch inventory');
        }
    }

    public async getCharges(
        propertyCode: string,
        roomTypeCode: string,
        ratePlanCode: string,
        dates: Date[]
    ): Promise<IChargeWithGuestAmounts[]> {
        try {
            const charges = await prisma.charge.findMany({
                where: {
                    propertyCode,
                    roomTypeCode,
                    ratePlanCode,
                    date: { in: dates },
                    isAvailable: true,
                },
                include: {
                    baseGuestAmounts: true,
                    additionalGuestAmounts: true,
                    ratePlan: true,
                },
                orderBy: { date: 'asc' },
            });
            return charges;
        } catch (error) {
            console.error('Error fetching charges:', error);
            throw new Error('Failed to fetch charges');
        }
    }

    public async getBookingOffset(
        ratePlanId: string,
        checkInDate: Date
    ): Promise<BookingOffset | null> {
        try {
            return await prisma.bookingOffset.findFirst({
                where: {
                    ratePlanId,
                    date: checkInDate,
                    isActive: true,
                },
            });
        } catch (error) {
            console.error('Error fetching booking offset:', error);
            throw new Error('Failed to fetch booking offset');
        }
    }

    public async getPropertiesWithFilters(
        location: string,
        filters: {
            minPrice?: number;
            maxPrice?: number;
            star_rating?: number[];
            amenities?: Record<string, boolean>;
            roomAmenities?: Record<string, boolean>;
            roomView?: string[];
            smokingPolicy?: string[];
            bedrooms?: number[];
            roomType?: string[];
            maxOccupancy?: number[];
            propertyTypes?: string[];
            propertyCategories?: string[];
            paymentAcceptedMethods?: {
                payByCard?: boolean;
                payAtHotel?: boolean;
            };
        }
    ): Promise<IPropertyWithDetails[]> {
        try {
            // Get property IDs by city
            const addresses = await prisma.propertyAddress.findMany({
                where: {
                    city: {
                        equals: location,
                        mode: 'insensitive',
                    },
                },
                select: { propertyId: true },
            });

            let propertyIds = addresses.map(a => a.propertyId);
            if (propertyIds.length === 0) return [];

            // Build where conditions
            const whereConditions: any = {
                id: { in: propertyIds },
                isDeleted: false,
                isAvailable: true,
            };

            // Star rating filter
            if (filters.star_rating && filters.star_rating.length > 0) {
                whereConditions.starRating = { in: filters.star_rating };
            }

            // Property amenities filter
            if (
                filters.amenities &&
                Object.keys(filters.amenities).length > 0
            ) {
                const activeAmenities = Object.keys(filters.amenities).filter(
                    key => filters.amenities![key]
                );
                if (activeAmenities.length > 0) {
                    whereConditions.propertyAmenities = {
                        some: {
                            amenity: {
                                amenityName: { in: activeAmenities },
                            },
                        },
                    };
                }
            }

            // Payment methods filter
            if (filters.paymentAcceptedMethods) {
                if (filters.paymentAcceptedMethods.payByCard === true) {
                    whereConditions.bankDetails = { paymentGateway: true };
                }
                if (filters.paymentAcceptedMethods.payAtHotel === true) {
                    whereConditions.bankDetails = { payAtHotel: true };
                }
            }

            // Property type filter
            if (filters.propertyTypes && filters.propertyTypes.length > 0) {
                const normalizedPropertyTypes = filters.propertyTypes
                    .map(type => type?.trim())
                    .filter(Boolean) as string[];

                if (normalizedPropertyTypes.length > 0) {
                    whereConditions.propertyType = {
                        masterPropertyType: {
                            OR: normalizedPropertyTypes.map(type => ({
                                propertyTypeName: {
                                    equals: type,
                                    mode: 'insensitive',
                                },
                            })),
                        },
                    };
                }
            }

            // Property category filter
            if (
                filters.propertyCategories &&
                filters.propertyCategories.length > 0
            ) {
                whereConditions.propertyCategory = {
                    masterCategory: {
                        categoryName: { in: filters.propertyCategories },
                    },
                };
            }

            // Fetch properties
            const properties = await prisma.property.findMany({
                where: whereConditions,
                include: {
                    propertyAddress: true,
                    propertyVideos: true,
                    propertyCategory: { include: { masterCategory: true } },
                    propertyType: { include: { masterPropertyType: true } },
                    propertyAmenities: { include: { amenity: true } },
                    propertyRooms: {
                        where: { available: true, isDeleted: false },
                        include: {
                            roomAmenities: { include: { amenity: true } },
                            roomVideos: true,
                        },
                    },
                    bankDetails: true,
                    ratePlans: {
                        where: { b2cAvailable: true },
                        include: {
                            cancellationPolicy: true,
                            depositPolicy: true,
                            guaranteePolicy: true,
                        },
                    },
                },
            }) as unknown as IPropertyWithDetails[];

            // Apply room-level filters
            let filteredProperties = properties;

            // Room amenities filter
            if (
                filters.roomAmenities &&
                Object.keys(filters.roomAmenities).length > 0
            ) {
                const activeRoomAmenities = Object.keys(
                    filters.roomAmenities
                ).filter(key => filters.roomAmenities![key]);
                filteredProperties = filteredProperties.filter(property => {
                    return property.propertyRooms.some(room => {
                        return activeRoomAmenities.every(amenity =>
                            room.roomAmenities.some(
                                ra => ra.amenity?.amenityName === amenity
                            )
                        );
                    });
                });
            }

            // Room view filter
            if (filters.roomView && filters.roomView.length > 0) {
                filteredProperties = filteredProperties.filter(property => {
                    return property.propertyRooms.some(room =>
                        filters.roomView!.includes(room.roomView)
                    );
                });
            }

            // Smoking policy filter
            if (filters.smokingPolicy && filters.smokingPolicy.length > 0) {
                filteredProperties = filteredProperties.filter(property => {
                    return property.propertyRooms.some(room =>
                        filters.smokingPolicy!.includes(room.smokingPolicy)
                    );
                });
            }

            // Bedrooms filter
            if (filters.bedrooms && filters.bedrooms.length > 0) {
                filteredProperties = filteredProperties.filter(property => {
                    return property.propertyRooms.some(room =>
                        filters.bedrooms!.includes(room.numberOfBedrooms)
                    );
                });
            }

            // ROOM TYPE FILTER
            if (filters.roomType && filters.roomType.length > 0) {
                filteredProperties = filteredProperties.filter(property => {
                    return property.propertyRooms.some(room =>
                        filters.roomType!.includes(room.roomType)
                    );
                });
            }

            // Max occupancy filter
            if (filters.maxOccupancy && filters.maxOccupancy.length > 0) {
                filteredProperties = filteredProperties.filter(property => {
                    return property.propertyRooms.some(room =>
                        filters.maxOccupancy!.includes(room.maxOccupancy)
                    );
                });
            }

            return filteredProperties;
        } catch (error) {
            console.error('Error fetching properties with filters:', error);
            throw new Error('Failed to fetch properties');
        }
    }

    /**
     * Get unique cities
     */
    public async getUniqueCities() {
        try {
            const cities = await prisma.propertyAddress.findMany({
                select: { city: true },
                distinct: ['city'],
            });
            console.log(cities[0]);
            return cities.map(c => ({
                city: c.city,
                propertyCount: 0,
            }));
        } catch (error) {
            console.error('Error fetching unique cities:', error);
            throw new Error('Failed to fetch cities');
        }
    }

    /**
     * Get amenities
     */
    public async getAmenities() {
        try {
            const amenities = await prisma.masterAmenity.findMany({
                where: {
                    isActive: true,
                    amenityType: 'property',
                },
                select: { amenityName: true },
            });

            return amenities.map(a => a.amenityName);
        } catch (error) {
            console.error('Error fetching amenities:', error);
            throw new Error('Failed to fetch amenities');
        }
    }

    /**
     * Get property categories
     */
    public async getPropertyCategories() {
        try {
            // Fetch distinct property categories from master table
            const categories = await prisma.masterPropertyCategory.findMany({
                where: {
                    isActive: true,
                },
                select: {
                    categoryName: true,
                },
                orderBy: {
                    categoryName: 'asc',
                },
            });

            return categories.map(c => c.categoryName);
        } catch (error) {
            console.error('Error fetching property categories:', error);
            throw new Error('Failed to fetch property categories');
        }
    }

    /**
     * Get property types
     */
    public async getPropertyTypes() {
        try {
            // Fetch distinct property types from master table
            const propertyTypes = await prisma.masterPropertyType.findMany({
                where: {
                    isActive: true,
                },
                select: {
                    propertyTypeName: true,
                },
                orderBy: {
                    propertyTypeName: 'asc',
                },
            });

            return propertyTypes.map(t => t.propertyTypeName);
        } catch (error) {
            console.error('Error fetching property types:', error);
            throw new Error('Failed to fetch property types');
        }
    }
}
