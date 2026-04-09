import {
    CustomerRequest,
    CustomRequest,
    errorResponse,
} from '../../../../common/utils';
import { Response } from 'express';
import { ProblemTicketService } from '../services';
import { ICProblemTicketsC, ticketPriority, ticketStatus } from '../types';

export class ProblemTicketController {
    private problemTicketService: ProblemTicketService;
    constructor() {
        this.problemTicketService = new ProblemTicketService();
    }
    public async createTicket(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const data: ICProblemTicketsC = req.body;
            const customerId = req.Customer?.id;
            if (!customerId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Login to create ticket for customer',
                            'Customer id is missing while creating the ticket'
                        )
                    );
            }
            if (!data.propertyId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Property details are missing in order to create a ticket',
                            'Property id is missing while creating the ticket'
                        )
                    );
            }
            const ticket = await this.problemTicketService.createTicket({
                ...data,
                customerId: customerId,
            });
            return res.status(201).json(ticket);
        } catch (error) {
            return res.status(500).json(error);
        }
    }
    public async updateTicket(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const id = req.params.id;
            if (!id) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Ticket details are missing in order to update the ticket',
                            'Ticket id is missing while updating the ticket'
                        )
                    );
            }
            const customerId = req.Customer?.id;
            if (!customerId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Login to update ticket for customer',
                            'Customer id is missing while updating the ticket'
                        )
                    );
            }
            const ticket = await this.problemTicketService.updateTicket(
                id,
                req.body
            );
            return res.status(200).json(ticket);
        } catch (error) {
            return res.status(500).json(error);
        }
    }
    public async deleteTicket(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const id = req.params.id;
            if (!id) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Ticket details are missing in order to delete the ticket',
                            'Ticket id is missing while deleting the ticket'
                        )
                    );
            }
            const ticket = await this.problemTicketService.deleteTicket(id);
            return res.status(200).json(ticket);
        } catch (error) {
            return res.status(500).json(error);
        }
    }
    public async getTicketsForCustomer(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const customerId = req.Customer?.id;
            const { limit, page } = req.query;
            if (!customerId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Login to get tickets for customer',
                            'Customer id is missing while getting the tickets'
                        )
                    );
            }
            const tickets =
                await this.problemTicketService.getTicketsForCustomer(
                    customerId,
                    Number(limit) ? Number(limit) : 10, 
                    Number(page) ? Number(page) : 1
                );
            return res.status(200).json(tickets);
        } catch (error) {
            return res.status(500).json(error);
        }
    }
    public async getTicketsForProperty(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const propertyId=req.params.propertyId;
            const {limit,page}=req.query;
            const tickets =
                await this.problemTicketService.getTicketsForProperty(
                    propertyId,
                    Number(limit) ? Number(limit) : 10,
                    Number(page) ? Number(page) : 1
                );
            return res.status(200).json(tickets);
        } catch (error) {
            return res.status(500).json(error);
        }
    }
    public async updateTicketStatus(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const id = req.params.id;
            const status:ticketStatus = req.body.status;
            if (!id) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Ticket details are missing in order to update the ticket',
                            'Ticket id is missing while updating the ticket'
                        )
                    );
            }
            const ticket = await this.problemTicketService.updateTicketStatus(id,status);
            return res.status(200).json(ticket);
        } catch (error) {
            return res.status(500).json(error);
        }
    }
    public async updateTicketPriority(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const id = req.params.id;
            const priority:ticketPriority = req.body.priority;
            if (!id) {
                return res.status(400).json(
                    errorResponse(
                        'Ticket details are missing in order to update the ticket',
                        'Ticket id is missing while updating the ticket'
                    )
                );
            }
            if (!priority) {
                return res.status(400).json(
                    errorResponse(
                        'Ticket details are missing in order to update the ticket',
                        'Ticket priority is missing while updating the ticket'
                    )
                );
            }
            const ticket = await this.problemTicketService.updateTicketPriority(id,priority);
            return res.status(200).json(ticket);
        } catch (error) {
            return res.status(500).json(error);
        }
    }
}
