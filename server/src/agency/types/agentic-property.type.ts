import { IAgenticRoom } from ".";

export interface ICAgenticProperty {
    agencyId: string;
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    isActive: boolean;

}
export interface IAgenticProperty extends ICAgenticProperty {
    id: string;
    isDeleted: boolean;
}
export interface IAgenticPropertyWR extends IAgenticProperty {
    AgenticRooms: IAgenticRoom[];

}