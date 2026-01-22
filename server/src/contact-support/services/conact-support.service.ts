import { IPropertyCodeAndIds } from '../../dashboard/types';
import { errorResponse, successResponse } from '../../utils/return';
import { IApiResponse } from '../../utils/return.types';
import { ContactSupportRepository } from '../repository';
import { DashUtilsRepo } from '../services';
import { ICProblemTicketsS, TicketStatus, TicketPrioity } from '../types';
export class ContactSupportServices {
    constantSupportRepository: ContactSupportRepository;
    dashboardUtils: DashUtilsRepo;
    constructor() {
        this.constantSupportRepository = new ContactSupportRepository();
        this.dashboardUtils = new DashUtilsRepo();
    }
    private async generateTokenNo(): Promise<string> {
        try {
            const lastCreatedToken =
                await this.constantSupportRepository.getLastCreatedToken();
            let tokenNumber: number;
            if (!lastCreatedToken) {
                tokenNumber = 100000;
            } else {
                tokenNumber =
                    Number(lastCreatedToken.ticketNo.split('-')[1]) + 1;
            }
            const newToken = `PMSt-${tokenNumber}`;
            return newToken;
        } catch (error) {
            throw new Error('Failed to generate Token Number');
        }
    }
    public async createProblemTickets(
        data: ICProblemTicketsS,
        userId: string,
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const ticketNo = await this.generateTokenNo();
            const ticketData = {
                ...data,
                ticketNo,
                createdById: userId,
                propertyId,
                status: 'open' as TicketStatus,
                priority: 'medium' as TicketPrioity,
            };
            const ticket =
                await this.constantSupportRepository.createProblemTicket(
                    ticketData
                );
            return successResponse('Ticket created successfully', ticket);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to raise an ticket for the Problem',
                    error.message
                );
            }
            return errorResponse('Failed to raise an ticket for the Problem');
        }
    }
    public async getAllTickets(
        userLevel: number,
        creationId: string
    ): Promise<IApiResponse> {
        try {
            let propertyIdAndCodes: IPropertyCodeAndIds[] = [];
            let daoRes: any;

            switch (userLevel) {
                case 4:
                    daoRes =
                        await this.dashboardUtils.getPropertyIdsAndCodesForLevel4(
                            creationId
                        );
                    break;
                case 3:
                    daoRes =
                        await this.dashboardUtils.getPropertyIdsAndCodesForLevel3(
                            creationId
                        );
                    break;
                case 2:
                    daoRes =
                        await this.dashboardUtils.getPropertyIdsAndCodesForLevel2(
                            creationId
                        );
                    break;
                case 1:
                case 0:
                    daoRes =
                        await this.dashboardUtils.getPropertyIdAndCodeForLevel0And1(
                            creationId
                        );
                    break;
                default:
                    return errorResponse(
                        'Invalid user Level',
                        'user level can only be 4, 3, 2, 1, or 0'
                    );
            }
            if (!daoRes.success) {
                return errorResponse(
                    daoRes.message || 'Failed to fetch properties'
                );
            }
            propertyIdAndCodes = daoRes.data;
            const propertyIds = propertyIdAndCodes.map(item => {
                return item.id;
            });
            // console.log("propertyIds",propertyIds);
            const tickets =
                await this.constantSupportRepository.getTickets(propertyIds);

            return successResponse('Tickets fetched successfully', tickets);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to fetch tickets', error.message);
            }
            return errorResponse('Failed to fetch tickets');
        }
    }
    public async getTicketById(id: string): Promise<IApiResponse> {
        try {
            const ticket =
                await this.constantSupportRepository.getTicketById(id);
            if (!ticket) {
                return errorResponse('Ticket not found');
            }
            return successResponse('Ticket fetched successfully', ticket);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to fetch ticket', error.message);
            }
            return errorResponse('Failed to fetch ticket');
        }
    }
    public async updateTicketStatus(
        ticketId: string,
        status: TicketStatus
    ): Promise<IApiResponse> {
        try {
            const ticket =
                await this.constantSupportRepository.updateProblemTicketStatus(
                    ticketId,
                    status
                );
            if (!ticket) {
                return errorResponse('Ticket not found');
            }
            return successResponse(
                'Ticket status updated successfully',
                ticket
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update ticket status',
                    error.message
                );
            }
            return errorResponse('Failed to update ticket status');
        }
    }
    public async updateTicketPriority(
        ticketId: string,
        priority: TicketPrioity
    ): Promise<IApiResponse> {
        try {
            const ticket =
                await this.constantSupportRepository.updateProblemTicketPriority(
                    ticketId,
                    priority
                );
            if (!ticket) {
                return errorResponse('Ticket not found');
            }
            return successResponse(
                'Ticket priority updated successfully',
                ticket
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to update ticket priority',
                    error.message
                );
            }
            return errorResponse('Failed to update ticket priority');
        }
    }
    public async deleteTicket(ticketId: string): Promise<IApiResponse> {
        try {
            const ticket =
                await this.constantSupportRepository.deleteProblemTicket(
                    ticketId
                );
            if (!ticket) {
                return errorResponse('Ticket not found');
            }
            return successResponse('Ticket deleted successfully', ticket);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse('Failed to delete ticket', error.message);
            }
            return errorResponse('Failed to delete ticket');
        }
    }
}
