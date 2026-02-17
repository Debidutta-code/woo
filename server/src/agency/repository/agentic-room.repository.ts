import {prisma} from "../../config";
import { IReservation } from "../../reservations/types";
import {ICAgenticRoom,IAgenticRoom} from "../types";
export class AgenticRoomRepository {
    public async createRoom(data: ICAgenticRoom): Promise<IAgenticRoom> {
        try {
            
            return await prisma.agenticRoom.create({
                data
            });
        } catch (error) {
            throw new Error(`Failed to create room`);
        }
    }

    public async getRoomById(id: string): Promise<IAgenticRoom | null> {
        try {
            return await prisma.agenticRoom.findUnique({
                where: { id }
            });
        } catch (error) {
            throw new Error(`Failed to get room by ID: ${id}`);
        }
    }

    public async updateRoomAvailability(id: string, isAvailable: boolean): Promise<IAgenticRoom | null> {
        try {
            return await prisma.agenticRoom.update({
                where: { id },
                data: { isActive:isAvailable }
            });
        } catch (error) {
            throw new Error(`Failed to update room: ${id}`);
        }
    }

    public async deleteRoom(id: string): Promise<IAgenticRoom | null> {
        try {
            return await prisma.agenticRoom.update({
                where: { id },
                data: { isDeleted: true }
            });
        } catch (error) {
            throw new Error(`Failed to delete room: ${id}`);
        }
    }
    public async getReservationByAgenticRooms(agentId:string,propertyId:string,roomType:string,skip:number=0,take:number=10):Promise<IReservation[]>{
        try {
            return await prisma.reservation.findMany({
                where: {
                    agencyId:agentId,
                    propertyId,
                    roomTypeCode:roomType
                },
                skip,
                take
            });
        } catch (error) {
            throw new Error(`Failed to get reservations by agentic rooms`);
        }
    }
}