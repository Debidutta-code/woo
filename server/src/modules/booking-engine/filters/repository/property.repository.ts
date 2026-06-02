// booking-engine/repository/property.repository.ts

import { prisma } from '../../../../config';
import { IChargeWithGuestAmounts, IInventoryItem, IPropertyWithDetails } from '../types/search.types';

export class PropertyRepository {
    
    // ✅ EXISTING METHOD - Keep this (if you have it)
    public async getPropertyByCode(propertyCode: string): Promise<IPropertyWithDetails | null> {
        try {
            const property = await prisma.property.findUnique({
                where: {
                    propertyCode: propertyCode,
                    isDeleted: false,
                    isAvailable: true,
                },
                include: {
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
                    propertyVideos: true,
                },
            });
            return property as IPropertyWithDetails | null;
        } catch (error) {
            console.error('Error fetching property by code:', error);
            throw new Error('Failed to fetch property');
        }
    }

    // ✅ NEW METHOD - ADD THIS RIGHT AFTER getPropertyByCode()
    public async getPropertyById(propertyId: string): Promise<IPropertyWithDetails | null> {
        try {
            const property = await prisma.property.findUnique({
                where: {
                    id: propertyId,
                    isDeleted: false,
                    isAvailable: true,
                },
                include: {
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
                            amenity:{
                                include: {
                                PropertyAmenitySelection: true,  // ← Add this
                                RoomAmenitySelection: true,      // ← Add this
                            }
                            }
                        },
                    },
                    propertyRooms: {
                        where: {
                            available: true,
                            isDeleted: false,
                        },
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
                    propertyVideos: true,
                },
            });
            return property as IPropertyWithDetails | null;
        } catch (error) {
            console.error('Error fetching property by ID:', error);
            throw new Error('Failed to fetch property');
        }
    }

    // ✅ Keep your existing methods (if any)
    public async getInventoryByRoom(
        propertyCode: string,
        roomTypeCode: string,
        dates: Date[],
        requiredRooms: number
    ): Promise<IInventoryItem[]>  {
        try {
            return await prisma.inventory.findMany({
                where: {
                    propertyCode,
                    roomTypeCode,
                    date: { in: dates },
                    availability: { gte: requiredRooms },
                },
            });
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
    ) : Promise<IChargeWithGuestAmounts[]>{
        try {
            return await prisma.charge.findMany({
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
                },
                orderBy: { date: 'asc' },
            });
        } catch (error) {
            console.error('Error fetching charges:', error);
            throw new Error('Failed to fetch charges');
        }
    }
}