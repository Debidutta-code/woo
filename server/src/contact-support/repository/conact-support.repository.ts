import { prisma } from '../../config';
import {
    ICProblemTicketsR,
    IProblemTickets,
    TicketPrioity,
    TicketStatus,
} from '../types/';
export class ContactSupportRepository {
    public async createProblemTicket(
        data: ICProblemTicketsR
    ): Promise<IProblemTickets> {
        try {
            return await prisma.problemTickets.create({
                data,
                include: {
                    CreatedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Error creating problem ticket: ');
        }
    }
    public async updateProblemTicketStatus(
        ticketId: string,
        status: TicketStatus
    ): Promise<IProblemTickets | null> {
        try {
            return await prisma.problemTickets.update({
                where: { id: ticketId },
                data: { status },
                include: {
                    CreatedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Error updating problem ticket status: ');
        }
    }
    public async updateProblemTicketPriority(
        ticketId: string,
        priority: TicketPrioity
    ): Promise<IProblemTickets | null> {
        try {
            return await prisma.problemTickets.update({
                where: { id: ticketId },
                data: { priority },
                include: {
                    CreatedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Error updating problem ticket priority: ');
        }
    }
    public async deleteProblemTicket(
        ticketId: string
    ): Promise<IProblemTickets | null> {
        try {
            return await prisma.problemTickets.delete({
                where: { id: ticketId },
                include: {
                    CreatedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Error deleting problem ticket: ');
        }
    }
    public async getTickets(propertyIds: string[]): Promise<IProblemTickets[]> {
        try {
            return await prisma.problemTickets.findMany({
                where: {
                    propertyId: {
                        in: propertyIds,
                    },
                },
                include: {
                    CreatedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            console.log('error', error);
            throw new Error('Failed to fetch Tickets');
        }
    }
    public async getTicketById(id: string): Promise<IProblemTickets | null> {
        try {
            return await prisma.problemTickets.findUnique({
                where: {
                    id,
                },
                include: {
                    CreatedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Failed to fetch tickets');
        }
    }
    public async getLastCreatedToken() {
        try {
            return await prisma.problemTickets.findFirst({
                where: {},
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            throw new Error('Failed to get the lastCreated Token');
        }
    }
}
