import { errorResponse, IApiResponse, successResponse } from '../../../../common/utils';
import { AgenticPropertyRepository } from '../repository';

export class AgencyPropertyService {
    private agenticPropertyRepository: AgenticPropertyRepository;

    constructor() {
        this.agenticPropertyRepository = new AgenticPropertyRepository();
    }

    public async getAgenticProperties(agencyId: string): Promise<IApiResponse> {
        try {
            const agency =
                await this.agenticPropertyRepository.getAgencyById(agencyId);
            if (!agency) {
                return errorResponse(
                    'Agency not found',
                    'Agency does not exist or deleted'
                );
            }
            const properties =
                await this.agenticPropertyRepository.getAgenticProperties(
                    agencyId
                );
            return successResponse(
                'Properties fetched successfully for Agencies',
                properties
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to retrieve agentic properties',
                    error.message
                );
            }
            return errorResponse('Failed to retrieve agentic properties');
        }
    }

}
