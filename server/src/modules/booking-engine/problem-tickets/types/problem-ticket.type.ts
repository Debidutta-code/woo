import { ICustomer } from '../../customers/types';
import { IProperty } from '../../filters/types/repository.types';

export type ticketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ticketPriority = 'low' | 'medium' | 'high' | 'urgent';
export interface ICProblemTicketsC {
    propertyId: string;
    subject: string;
    description: string|null;
}
export interface ICProblemTicketsS {
    propertyId: string;
    subject: string;
    description: string|null;
    customerId: string;
}
export interface ICProblemTicketsR extends ICProblemTicketsS {
    ticketNo: string;
    status: ticketStatus;
    priority: ticketPriority;
}
export interface IProblemTickets extends ICProblemTicketsR {
    id: string;
    isDeleted: boolean;
}

export interface IProblemTicketsWithData extends IProblemTickets {
    Property: IProperty;
    Customers: ICustomer;
}
