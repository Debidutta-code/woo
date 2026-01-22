export interface IUser{
    firstName: string;
    lastName: string;
    role:string;
}
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPrioity = 'low' | 'medium' | 'high' | 'urgent';
export interface ICProblemTicketsR {
    propertyId: string;
    subject: string;
    description: string | null;
    status: TicketStatus;
    priority: TicketPrioity;
    createdById: string;
    ticketNo: string;
}
export interface ICProblemTicketsS {
    subject: string;
    description: string | null;
}
export interface IProblemTickets extends ICProblemTicketsR {
    id: string;
    createdAt: Date;
    CreatedBy: IUser;
}
