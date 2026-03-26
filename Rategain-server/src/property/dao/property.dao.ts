import { prisma } from '../../configs/db.config';

export class PropertyDAO {

  normalizeQuery(input: string): string {
    return input.toLowerCase().replace(/[\s\-_.,]/g, '');
  }

  async searchProperties(normalizedQuery: string, skip: number, take: number) {
    const where = {
      propertyName: {
        contains: normalizedQuery,
        mode: 'insensitive' as const,
      },
    };

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        select: {
          id: true,
          propertyId: true,
          propertyName: true,
          propertyCode: true,
          phone: true,
          ranking: true,
          startingPrice: true,
          currency: true,
          categoryName: true,
          chainName: true,
          address: {
            select: {
              city: true,
              countryName: true,
            },
          },
          images: {
            take: 1,
            select: { id: true, url: true },
          },
        },
        orderBy: { ranking: 'asc' },
        skip,
        take,
      }),
      prisma.property.count({ where }),
    ]);

    return { properties, total };
  }

  async getPropertyById(id: string) {
    return prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        propertyId: true,
        propertyName: true,
        propertyCode: true,
        brandCode: true,
        description: true,
        phone: true,
        ranking: true,
        startingPrice: true,
        currency: true,
        accomodationType: true,
        accTypeDesc: true,
        categoryCode: true,
        categoryName: true,
        categoryGroupCode: true,
        categoryGroupDesc: true,
        chainCode: true,
        chainName: true,
        latitude: true,
        longitude: true,
        hotelAmenities: true,
        images: {
          select: { id: true, url: true },
        },
        facilities: {
          select: {
            id: true,
            facilityGroupName: true,
            facilityName: true,
            facilityDesc: true,
          },
        },
        boards: {
          select: { id: true, code: true, name: true },
        },
        segments: {
          select: { id: true, code: true, name: true },
        },
      },
    });
  }

  async getPropertyAddress(propertyId: string) {
    return prisma.propertyAddress.findUnique({
      where: { propertyId },
      select: {
        id: true,
        address: true,
        street: true,
        city: true,
        postalCode: true,
        countryCode: true,
        countryName: true,
        stateCode: true,
        stateName: true,
        zoneCode: true,
        zoneName: true,
        destinationCode: true,
        destinationName: true,
      },
    });
  }

  async getPropertyRooms(propertyId: string) {
    return prisma.roomType.findMany({
      where: { propertyId },
      select: {
        id: true,
        roomCode: true,
        name: true,
        nativeCurrency: true,
        images: {
          select: { id: true, url: true },
        },
        rates: {
          select: {
            id: true,
            rateKey: true,
            rateName: true,
            totalPrice: true,
            boardCode: true,
            boardName: true,
            paymentType: true,
            adults: true,
            children: true,
            rooms: true,
          },
        },
      },
    });
  }
}