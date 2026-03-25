import { normalizeQuery, searchPropertiesDAO } from '../dao/property.dao';
import { PropertySearchResponse } from '../types/property.types';

export async function searchPropertiesService(
  rawQuery: string
): Promise<PropertySearchResponse> {

  // "MaR-ina Residence" → "marinaresidence"
  const normalized = normalizeQuery(rawQuery);

  const properties = await searchPropertiesDAO(normalized);

  // Build message
  let message: string;
  if (properties.length === 0) {
    message = 'No properties found';
  } else if (properties.length === 1) {
    message = 'Property found';
  } else {
    message = `${properties.length} properties found, please select one`;
  }

  return {
    success: true,
    message,
    count: properties.length,
    requiresDisambiguation: properties.length > 1,
    page: 1,
    limit: 10,
    totalPages: Math.ceil(properties.length / 10),
    data: properties.map((p) => ({
      id: p.id,
      propertyId: p.propertyId,
      propertyName: p.propertyName,
      city: p.address?.city ?? null,
      country: p.address?.countryName ?? null,
      category: p.categoryName ?? null,
      chain: p.chainName ?? null,
      startingPrice: p.startingPrice ? Number(p.startingPrice) : null,
      currency: p.currency ?? null,
      ranking: p.ranking ?? null,
      thumbnail: p.images[0]?.url ?? null,
    })),
  };
}