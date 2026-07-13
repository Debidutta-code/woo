import { IBookingEngineConfig, IPropertyAddress } from "../../property-management/types";
import { IRoomAmenityDetail } from "./room.type";

export interface IPropertyDetailsContext {
    id: string;
    propertyName: string;
    propertyCode: string;
    propertyAddress: IPropertyAddress | null;
    bookingEngineConfig: IBookingEngineConfig | null;
    propertyConfigs: IPropertyConfigType | null;
    images: string[];
    amenities: IRoomAmenityDetail[];
}
interface IPropertyConfigType {
    isSpaModuleEnabled: boolean;
    isLoyaltyProgramEnabled: boolean;
    isB2cAvailable: boolean;
    isB2bAvailable:boolean;
}