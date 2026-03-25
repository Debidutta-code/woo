import { prisma } from "../../configs/db.config";


export function normalizeQuery(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\s\-_.,]/g, '');
}


export async function searchPropertiesDAO(normalizedQuery: string) {
  const properties = await prisma.property.findMany({
    where: {
      propertyName: {
        contains: normalizedQuery, // Prisma ILIKE under the hood
        mode: 'insensitive',       // case insensitive ✅
      },
    },
    select: {
      id: true,
      propertyId: true,
      propertyName: true,
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
        select: { url: true },
      },
    },
    orderBy: { ranking: 'asc' },
    take: 20,
  });

  return properties;
}