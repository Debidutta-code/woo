import { prisma } from "../../config";
import { IPropertyDetailsContext } from "../types/property-details.type";

export class PropertyDetailsDao {
    public async getPropertyDetailsByCode(propertyCode: string):Promise<IPropertyDetailsContext | null> {
        try {
            const raw = await prisma.property.findUnique({
                where:{
                    propertyCode
                },
                select:{
                    id:true,
                    propertyName:true,
                    propertyCode:true,
                    bookingEngineConfig:true,
                    propertyAddress:true,
                    propertyConfigs:{
                        select:{
                            isSpaModuleEnabled:true,
                            isLoyaltyProgramEnabled:true,
                            isB2cAvailable:true,
                            isB2bAvailable:true
                        }
                    },
                    image:true,
                    propertyAmenities:{
                        select:{
                            amenity:{
                                select:{
                                    id:true,
                                    amenityName:true,
                                    amenityType:true,
                                    description:true,
                                    icon:true,
                                    isActive:true
                                }
                            }
                        }
                    }
                }
            });
            if (!raw) return null;
            const result: IPropertyDetailsContext = {
                id: raw.id,
                propertyName: raw.propertyName,
                propertyCode: raw.propertyCode,
                propertyAddress: raw.propertyAddress,
                bookingEngineConfig: raw.bookingEngineConfig,
                propertyConfigs: raw.propertyConfigs,
                images: raw.image as unknown as string[],
                amenities: raw.propertyAmenities?.map((pa:any) => pa.amenity) || []
            };
            return result;
        } catch (error) {
            throw new Error("Failed to fetch property details");
        }
    }
}