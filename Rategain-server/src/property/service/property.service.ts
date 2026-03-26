import { PropertyDAO } from '../dao/property.dao';
import {
  PropertySearchQuery,
  PropertySearchResponse,
  PropertyDetailResponse,
  PropertyAddressResponse,
  PropertyRoomsResponse,
} from '../types/property.types';

export class PropertyService {
  private dao: PropertyDAO;

  constructor() {
    this.dao = new PropertyDAO();
  }

  // ─── 1. Search ───────────────────────────────────────────────────
  async searchProperties(query: PropertySearchQuery): Promise<PropertySearchResponse> {
    const { propertyName, page = 1, limit = 10 } = query;

    const normalized = this.dao.normalizeQuery(propertyName);
    const skip = (page - 1) * limit;

    const { properties, total } = await this.dao.searchProperties(normalized, skip, limit);
    const totalPages = Math.ceil(total / limit);

    let message: string;
    if (total === 0) message = 'No properties found';
    else if (total === 1) message = 'Property found';
    else message = `${total} properties found, please select one`;

    return {
      success: true,
      message,
      count: total,
      requiresDisambiguation: total > 1,
      page,
      limit,
      totalPages,
      data: properties.map((p) => ({
        id: p.id,
        propertyId: p.propertyId,
        propertyName: p.propertyName,
        propertyCode: p.propertyCode,
        phone: p.phone ?? null,
        ranking: p.ranking ?? null,
        startingPrice: p.startingPrice ? Number(p.startingPrice) : null,
        currency: p.currency ?? null,
        categoryName: p.categoryName ?? null,
        chainName: p.chainName ?? null,
        city: p.address?.city ?? null,
        countryName: p.address?.countryName ?? null,
        thumbnail: p.images[0]?.url ?? null,
      })),
    };
  }

  // ─── 2. Property Detail ──────────────────────────────────────────
  async getPropertyById(id: string): Promise<PropertyDetailResponse> {
    const property = await this.dao.getPropertyById(id);

    if (!property) {
      return { success: false, message: 'Property not found', data: null };
    }

    return {
      success: true,
      message: 'Property details fetched successfully',
      data: {
        id: property.id,
        propertyId: property.propertyId,
        propertyName: property.propertyName,
        propertyCode: property.propertyCode,
        brandCode: property.brandCode ?? null,
        description: property.description ?? null,
        phone: property.phone ?? null,
        ranking: property.ranking ?? null,
        startingPrice: property.startingPrice ? Number(property.startingPrice) : null,
        currency: property.currency ?? null,
        accomodationType: property.accomodationType ?? null,
        accTypeDesc: property.accTypeDesc ?? null,
        categoryCode: property.categoryCode ?? null,
        categoryName: property.categoryName ?? null,
        categoryGroupCode: property.categoryGroupCode ?? null,
        categoryGroupDesc: property.categoryGroupDesc ?? null,
        chainCode: property.chainCode ?? null,
        chainName: property.chainName ?? null,
        latitude: property.latitude ? Number(property.latitude) : null,
        longitude: property.longitude ? Number(property.longitude) : null,
        hotelAmenities: property.hotelAmenities,
        images: property.images,
        facilities: property.facilities,
        boards: property.boards,
        segments: property.segments,
      },
    };
  }

  // ─── 3. Address ──────────────────────────────────────────────────
  async getPropertyAddress(propertyId: string): Promise<PropertyAddressResponse> {
    const address = await this.dao.getPropertyAddress(propertyId);

    if (!address) {
      return {
        success: false,
        message: 'No address found for this property',
        data: null,
      };
    }

    return {
      success: true,
      message: 'Address fetched successfully',
      data: {
        id: address.id,
        address: address.address ?? null,       // → prefill addressLine1
        street: address.street ?? null,          // → prefill addressLine2
        city: address.city ?? null,              // → prefill city
        postalCode: address.postalCode ?? null,  // → prefill zipCode
        countryCode: address.countryCode ?? null,
        countryName: address.countryName ?? null, // → prefill country
        stateCode: address.stateCode ?? null,
        stateName: address.stateName ?? null,    // → prefill state
        zoneCode: address.zoneCode ?? null,
        zoneName: address.zoneName ?? null,
        destinationCode: address.destinationCode ?? null,
        destinationName: address.destinationName ?? null,
        // location → null (not in schema, user fills)
        // landmark → null (not in schema, user fills)
        // latitude/longitude → on Property model, not here
      },
    };
  }

  // ─── 4. Rooms ────────────────────────────────────────────────────
  async getPropertyRooms(propertyId: string): Promise<PropertyRoomsResponse> {
    const rooms = await this.dao.getPropertyRooms(propertyId);

    return {
      success: true,
      message: rooms.length === 0 ? 'No rooms found for this property' : 'Rooms fetched successfully',
      count: rooms.length,
      data: rooms.map((r) => ({
        id: r.id,
        roomCode: r.roomCode,         // → prefill roomType
        name: r.name,                 // → prefill roomName
        nativeCurrency: r.nativeCurrency ?? null,
        images: r.images,             // → prefill image[]
        rates: r.rates.map((rate) => ({
          id: rate.id,
          rateKey: rate.rateKey,
          rateName: rate.rateName ?? null,
          totalPrice: Number(rate.totalPrice),
          boardCode: rate.boardCode ?? null,
          boardName: rate.boardName ?? null,
          paymentType: rate.paymentType ?? null,
          adults: rate.adults ?? null,      // → prefill maxNumberOfAdults
          children: rate.children ?? null,  // → prefill maxNumberOfChildren
          rooms: rate.rooms ?? null,        // → prefill totalRoom
        })),
      })),
    };
  }
}