import {prisma} from "../../config";
import { IReservation } from "../../reservations/types";
import { IAgency, IAgencyWD, ICAgency } from "../types";
export class AgencyRepository {
    public async createAgency(data: ICAgency): Promise<IAgency> {
        try {
            
            return await prisma.agency.create({
                data
            });
        } catch (error) {
            throw new Error(`Failed to create agency`);
        }
    }

    public async getAgencyById(id: string): Promise<IAgencyWD | null> {
        try {
            
            return await prisma.agency.findUnique({
                where: { id },
                include: {
                    AgenticProperties:true,
                    Agents: true,
                }
            });
        } catch (error) {
            throw new Error(`Failed to get agency by ID: ${id}`);
        }
    }

    public async updateAgency(id: string, data: ICAgency): Promise<IAgency | null> {
        try {
            return await prisma.agency.update({
                where: { id },
                data
            });
        } catch (error) {
            throw new Error(`Failed to update agency: ${id}`);
        }
    }

    public async deleteAgency(id: string): Promise<IAgency | null> {
        try {
            return await prisma.agency.update({
                where: { id },
                data: { isDeleted: true }
            });
        } catch (error) {
            throw new Error(`Failed to delete agency: ${id}`);
        }
    }
    public async getReservationsByAgencyId(agencyId: string, skip: number=0,take: number=10): Promise<IReservation[]> {
        try {
            return await prisma.reservation.findMany({
                where: { agencyId },
                skip,
                take
            });
        } catch (error) {
            throw new Error(`Failed to get reservations by agency ID: ${agencyId}`);
        }
    }
}