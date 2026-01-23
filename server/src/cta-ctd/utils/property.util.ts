import { prisma } from "../../config";

export const getPropertyDetails = async (propertyId: string) => {
    try {
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });
        return property;
    } catch (error) {
        throw new Error("Failed to get property details");
    }
};
