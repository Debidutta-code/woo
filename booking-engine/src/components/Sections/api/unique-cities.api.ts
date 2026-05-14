import axios from "axios";

export interface IUniqueCity {
  city: string;
  propertyCount: number;
}

let uniqueCitiesCache: IUniqueCity[] | null = null;
let uniqueCitiesPromise: Promise<IUniqueCity[]> | null = null;

export const getUniqueCities = async (): Promise<IUniqueCity[]> => {
  if (uniqueCitiesCache) {
    return uniqueCitiesCache;
  }

  if (uniqueCitiesPromise) {
    return uniqueCitiesPromise;
  }

  uniqueCitiesPromise = axios
    .get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/booking-engine/filters/search/unique-cities`,
    )
    .then((response) => {
      const payload = response?.data;
      const cities = Array.isArray(payload?.data) ? payload.data : [];
      uniqueCitiesCache = cities;
      return cities;
    })
    .finally(() => {
      uniqueCitiesPromise = null;
    });

  return uniqueCitiesPromise;
};

