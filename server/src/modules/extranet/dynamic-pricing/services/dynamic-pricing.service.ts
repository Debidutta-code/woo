import { CustomRequest, errorResponse, IApiResponse, successResponse } from '../../../../common/utils';
import { DynamicPricing } from '../repository';
import { IDynamicPricing } from '../types';
export class DynamicPricingService {
    private dynamicPricingRepo: DynamicPricing;

    constructor() {
        this.dynamicPricingRepo = new DynamicPricing();
    }
    public async getDynamicPricingByPropertyId(
        propertyId: string
    ): Promise<IApiResponse<IDynamicPricing | null>> {
        try {
            const data =
                await this.dynamicPricingRepo.getDynamicPricing(propertyId);
            return successResponse(
                'Dynamic pricing fetched successfully',
                data
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error fetching dynamic pricing',
                    error.message
                );
            }
            return errorResponse(
                'Error fetching dynamic pricing',
                'Unknown error'
            );
        }
    }
    public async getDynamicPricingById(
        id: string
    ): Promise<IApiResponse<IDynamicPricing | null>> {
        try {
            const data = await this.dynamicPricingRepo.getById(id);
            return successResponse(
                'Dynamic pricing fetched successfully',
                data
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error fetching dynamic pricing',
                    error.message
                );
            }
            return errorResponse(
                'Error fetching dynamic pricing',
                'Unknown error'
            );
        }
    }
}
