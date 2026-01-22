import { Response } from 'express';
import { CustomRequest } from '../../utils/customRequest';
import { errorResponse } from '../../utils/return';
import { ContactSupportServices } from '../services';
import { TicketStatus, TicketPrioity } from '../types';
export class ContactSupportController {
    contactSupportServices: ContactSupportServices;
    constructor() {
        this.contactSupportServices = new ContactSupportServices();
    }
    public async createTicket(req: CustomRequest, res: Response) {
        try {
            const userId = req.user?.id;
            const propertyId = req.params.propertyId;
            if (!userId || !propertyId) {
                return res
                    .status(401)
                    .json(errorResponse('User not authenticated'));
            }
            const { subject, description } = req.body;
            if (!subject) {
                return res
                    .status(400)
                    .json(errorResponse('Subject is required'));
            }
            const result =
                await this.contactSupportServices.createProblemTickets(
                    { subject, description },

                    userId,
                    propertyId
                );
            if (result.success) {
                return res.status(201).json(result);
            }
            return res.status(400).json(result);
        } catch (error) {
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }
    public async getAllTickets(req: CustomRequest, res: Response) {
        try {
            const userLevel = req.user?.level;
            const creationId = req.user?.creationId;

            if (!userLevel || !creationId) {
                return res
                    .status(401)
                    .json(errorResponse('User not authenticated'));
            }

            const result = await this.contactSupportServices.getAllTickets(
                userLevel,
                creationId
            );
            if (result.success) {
                return res.status(200).json(result);
            }
            return res.status(400).json(result);
        } catch (error) {
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }
    public async getTicketById(req: CustomRequest, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Ticket ID is required'));
            }
            const result = await this.contactSupportServices.getTicketById(id);
            if (result.success) {
                return res.status(200).json(result);
            }
            return res.status(404).json(result);
        } catch (error) {
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }
    public async updateTicketStatus(req: CustomRequest, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Ticket ID is required'));
            }
            if (
                !status ||
                !['open', 'in_progress', 'resolved', 'closed'].includes(status)
            ) {
                return res
                    .status(400)
                    .json(errorResponse('Valid status is required'));
            }
            const result = await this.contactSupportServices.updateTicketStatus(
                id,
                status as TicketStatus
            );
            if (result.success) {
                return res.status(200).json(result);
            }
            return res.status(404).json(result);
        } catch (error) {
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }
    public async updateTicketPriority(req: CustomRequest, res: Response) {
        try {
            const { id } = req.params;
            const { priority } = req.body;
            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Ticket ID is required'));
            }
            if (
                !priority ||
                !['low', 'medium', 'high', 'urgent'].includes(priority)
            ) {
                return res
                    .status(400)
                    .json(errorResponse('Valid priority is required'));
            }
            const result =
                await this.contactSupportServices.updateTicketPriority(
                    id,
                    priority as TicketPrioity
                );
            if (result.success) {
                return res.status(200).json(result);
            }
            return res.status(404).json(result);
        } catch (error) {
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }
    public async deleteTicket(req: CustomRequest, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                return res
                    .status(400)
                    .json(errorResponse('Ticket ID is required'));
            }
            const result = await this.contactSupportServices.deleteTicket(id);
            if (result.success) {
                return res.status(200).json(result);
            }
            return res.status(404).json(result);
        } catch (error) {
            return res.status(500).json(errorResponse('Internal Server Error'));
        }
    }
}
