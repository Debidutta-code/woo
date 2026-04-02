import axios from 'axios';
import config from '../../configs/env.configs';
import {
  BestPropertiesDto,
  BestPropertiesApiResponse,
  GetProductsDto,
  GetProductsApiResponse,
} from '../types';

const getHeaders = () => ({
  ApiKey:            config.rategainApiKey!,
  ApiSecret:         config.rategainSecretKey!,
  'Content-Type':    'application/json',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
});

const BASE = config.rategainBaseUrl;

export const getBestProperties = async (
  dto: BestPropertiesDto,
): Promise<BestPropertiesApiResponse> => {
  const response = await axios.post<BestPropertiesApiResponse>(
    `${BASE}/api/SmartDistribution/bestproperties`,
    dto,
    { headers: getHeaders() },
  );

  const data = response.data;

  if (!data.status) {
    throw new Error(
      `GetBestProperties failed: ${data.description ?? 'Unknown error'} (statusCode: ${data.statusCode})`,
    );
  }

  return data;
};

export const getAllProducts = async (
  dto: GetProductsDto,
): Promise<GetProductsApiResponse> => {
  const response = await axios.post<GetProductsApiResponse>(
    `${BASE}/api/SmartDistribution/getproducts`,
    dto,
    { headers: getHeaders() },
  );

  const data = response.data;

  if (!data.status) {
    throw new Error(
      `GetAllProducts failed: ${data.description ?? 'Unknown error'} (statusCode: ${data.statusCode})`,
    );
  }

  return data;
};