import axios from 'axios';
import { upsertProperty, upsertRoomTypes } from '../dao';
import {
  RateGainHeaders,
  Destination,
  GetDestinationsResponse,
  GetBestPropertyRequest,
  GetBestPropertyResponse,
  GetAllProductsRequest,
  GetAllProductsResponse,
  Hotel,
  SyncQueryParams,
} from '../types';
import config from '../../configs/env.configs';

const getHeaders = (): RateGainHeaders => ({
  ApiKey:            config.rategainApiKey!,
  ApiSecret:         config.rategainSecretKey!,
  'Content-Type':    'application/json',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
});

const getDefaultDates = () => {
  const today    = new Date();
  const tomorrow = new Date(today);
  const dayAfter = new Date(today);

  tomorrow.setDate(today.getDate() + 1);
  dayAfter.setDate(today.getDate() + 2);

  const format = (d: Date) => d.toISOString().split('T')[0];

  return {
    checkin:  format(tomorrow),
    checkout: format(dayAfter),
  };
};

const defaultRooms = [
  {
    NumberOfRoom: 1,
    Adults:       1,
    Children:     0,
    paxes:        [],
  },
];



const fetchDestinations = async (): Promise<Destination[]> => {
  const response = await axios.get<GetDestinationsResponse>(
    `${config.rategainBaseUrl}/api/SmartDistribution/getDestinations`,
    { headers: getHeaders() }
  );
  return response.data.body;
};

const fetchBestProperties = async (
  destinationCode: string,
  countryCode: string,
  pageNo: number
): Promise<GetBestPropertyResponse> => {
  const { checkin, checkout } = getDefaultDates();

  const payload: GetBestPropertyRequest = {
    destinationCode,
    checkin,
    checkout,
    CountryCode: countryCode,
    Rooms:       defaultRooms,
    pageNo,
    Echotoken:`SYNC-${destinationCode}-${pageNo}-${Date.now()}`,
  };

  const response = await axios.post<GetBestPropertyResponse>(
    `${config.rategainBaseUrl}/api/SmartDistribution/bestproperties`,
    payload,
    { headers: getHeaders() }
  );

  return response.data;
};

const fetchAllProducts = async (hotel: Hotel): Promise<GetAllProductsResponse> => {
  const { checkin, checkout } = getDefaultDates();

  const payload: GetAllProductsRequest = {
    propertyID:   hotel.propertyId,
    PropertyCode: hotel.propertyCode,
    BrandCode:    hotel.brandCode,
    checkin,
    checkout,
    Rooms:        defaultRooms,
    echoToken:    `SYNC-PRODUCTS-${hotel.propertyId}-${Date.now()}`,
  };

  const response = await axios.post<GetAllProductsResponse>(
    `${config.rategainBaseUrl}/api/SmartDistribution/getproducts`,
    payload,
    { headers: getHeaders() }
  );

  return response.data;
};


export const syncProperties = async (params: SyncQueryParams) => {
  const { countryCode } = params;

  const stats = {
    destinationsProcessed: 0,
    propertiesUpserted:    0,
    propertiesSkipped:     0,
    roomTypesUpserted:     0,
  };

  console.log('Fetching destinations...');
  const destinations = await fetchDestinations();

  const filtered = countryCode
    ? destinations.filter(
        (d) => d.countryCode.toUpperCase() === countryCode.toUpperCase()
      )
    : destinations;

  console.log(`Syncing ${filtered.length} destinations...`);
  console.log(`filtered`, JSON.stringify(filtered,null,2));

  for (const destination of filtered) {
    stats.destinationsProcessed++;
    console.log(`Processing destination: ${destination.destName} (${destination.destCode})`);

    let pageNo      = 1;
    let totalRecord = Infinity;
    let fetched     = 0;

    while (fetched < totalRecord) {
      const propertyResponse = await fetchBestProperties(
        destination.destCode,
        destination.countryCode,
        pageNo
      );

      if (!propertyResponse.status || !propertyResponse.body?.length) break;

      totalRecord = propertyResponse.totalRecord;
      fetched    += propertyResponse.body.length;

      for (const hotel of propertyResponse.body) {
        try {
          const propertyId = await upsertProperty(hotel);
          stats.propertiesUpserted++;

          console.log(`Upserted property: ${hotel.propertyName} (${hotel.propertyId})`);

          try {
            const productResponse = await fetchAllProducts(hotel);

            if (productResponse.status && productResponse.body?.products?.length) {
              await upsertRoomTypes(propertyId, productResponse.body.products);
              stats.roomTypesUpserted += productResponse.body.products.length;
              console.log(`Upserted ${productResponse.body.products.length} room types for: ${hotel.propertyName}`);
            }
          } catch (productError) {
            console.error(
              `Failed to fetch products for property ${hotel.propertyId} (${hotel.propertyName}), skipping...`,
              productError
            );
            stats.propertiesSkipped++;
          }
        } catch (propertyError) {
          console.error(
            `Failed to upsert property ${hotel.propertyId}, skipping...`,
            propertyError
          );
          stats.propertiesSkipped++;
        }
      }

      pageNo++;

      if (fetched >= totalRecord) break;
    }
  }

  return stats;
};