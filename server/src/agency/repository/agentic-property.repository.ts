import {prisma} from "../../config";
import { IReservation } from "../../reservations/types";
import {IAgenticProperty, IAgenticPropertyWR, ICAgenticProperty} from "../types";
export class AgenticPropertyRepository {
   public async createAgenticProperty(data: ICAgenticProperty): Promise<IAgenticProperty> {
    try {
            return await prisma.agenticProperty.create({
                data
            });
        } catch (error) {
            throw new Error(`Failed to create property`);
        }
    }

    public async getAgenticPropertyById(id: string): Promise<IAgenticPropertyWR | null> {
        try {
            return await prisma.agenticProperty.findUnique({
                where: { id },
                include:{
                    AgenticRooms:{
                        where:{
                            isDeleted:false
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error(`Failed to get property by ID: ${id}`);
        }
    }

    public async updateAgenticProperty(id: string, isActive:boolean): Promise<IAgenticProperty | null> {
        try {
            
            return   await prisma.agenticProperty.update({
                where: { id },
                data: { isActive }
            });
        } catch (error) {
            throw new Error(`Failed to update property: ${id}`);
        }
    }

    public async deleteAgenticProperty(id: string): Promise<IAgenticProperty | null> {
        try {
            return await prisma.agenticProperty.update({
                where: { id },
                data: { isDeleted: true }
            });
        } catch (error) {
            throw new Error(`Failed to delete property: ${id}`);
        }
    }
    public async getReservationsByAgents(agencyId:string,propertyId:string,skip:number=0,take:number=10): Promise<IReservation[] | null> {
        try {

            return await prisma.reservation.findMany({
                where: {
                    agencyId,
                    propertyId
                },
                skip,
                take
            });
        } catch (error) {
            throw new Error(`Failed to get reservations by agents`);
        }
    }
    public async countAllReservations(agencyId:string,propertyCode:string): Promise<number> {
        try {
            
            const count = await prisma.agenticProperty.count({
                where: {
                    agencyId,
                    propertyCode
                }
            });
            return count > 0 ? count : 0;
        } catch (error) {
            throw new Error(`Failed to count all reservations`);
        }
    }
}