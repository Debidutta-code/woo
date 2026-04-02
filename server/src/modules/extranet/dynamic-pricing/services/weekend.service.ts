import { errorResponse, IApiResponse, successResponse } from '../../../../common/utils';
import { getCurrencyConverter } from '../../../../infrastructure/currency-maping/utils';
import { DynamicPricing, WeekendDynamicPricingRepository } from '../repository';
import { ICWeekendDynamicPricing, ICWeekendDynamicPricingS } from '../types';

export class WeekendDynamicPricingService {
    private weekendRepo: WeekendDynamicPricingRepository;
    private dynamicPricingRepo: DynamicPricing;
    constructor() {
        this.weekendRepo = new WeekendDynamicPricingRepository();
        this.dynamicPricingRepo = new DynamicPricing();
    }
    public async createWeekendDynamicPricing(
        propertyId: string,
        data: ICWeekendDynamicPricingS
    ): Promise<IApiResponse> {
        try {
            const [
                dynamicPricing,
                { convert, baseCurrency },
                isExistsInDateRange,
            ] = await Promise.all([
                this.dynamicPricingRepo.getDynamicPricingByPropertyIdCo(
                    propertyId
                ),
                getCurrencyConverter(
                    propertyId,
                    data.currencyCode ? data.currencyCode : 'AED'
                ),
                this.weekendRepo.weekendDynamicPricingByDateRange(
                    [],
                    data.roomId,
                    data.startDate,
                    data.endDate
                ),
            ]);
            if (isExistsInDateRange && isExistsInDateRange.length > 0) {
                return errorResponse(
                    'Weekend dynamic pricing already exists for this date range',
                    'Weekend dynamic pricing already exists'
                );
            }
            if (!dynamicPricing) {
                return errorResponse(
                    'Dynamic pricing not found',
                    'Dynamic pricing not found'
                );
            }
            await this.weekendRepo.createWeekendDynamicPricing({
                ...data,
                dynamicId: dynamicPricing.id,
                currencyCode:
                    data.adjustmentType === 'percentage' ? null : baseCurrency,
                adjustmentValue:
                    data.adjustmentType === 'percentage'
                        ? data.adjustmentValue
                        : convert(data.adjustmentValue),
            });
            return successResponse(
                'Weekend dynamic pricing created successfully'
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error creating weekend dynamic pricing',
                    error.message
                );
            }
            return errorResponse(
                'Error creating weekend dynamic pricing',
                'Unknown error'
            );
        }
    }
    public async getByRoomId(roomId: string): Promise<IApiResponse> {
        try {
            const weekendDynamicPricing =
                await this.weekendRepo.getByRoomId(roomId);
            return successResponse(
                'Weekend dynamic pricing fetched successfully',
                weekendDynamicPricing
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error fetching weekend dynamic pricing',
                    error.message
                );
            }
            return errorResponse(
                'Error fetching weekend dynamic pricing',
                'Unknown error'
            );
        }
    }
    public async updateWeekendDynamicPricing(
        id: string,
        data: ICWeekendDynamicPricing
    ): Promise<IApiResponse> {
        try {
            const [
                updatedWeekendDynamicPricing,
                dynamicPricing,
                isExistsInDateRange,
            ] = await Promise.all([
                this.weekendRepo.updateWeekendDynamicPricing(id, data),
                this.dynamicPricingRepo.getById(data.dynamicId),
                this.weekendRepo.weekendDynamicPricingByDateRange(
                    [id],
                    data.roomId,
                    data.startDate,
                    data.endDate
                ),
            ]);
            if (!dynamicPricing) {
                return errorResponse(
                    'Dynamic pricing not found',
                    'Dynamic pricing not found'
                );
            }
            if (!updatedWeekendDynamicPricing) {
                return errorResponse(
                    'Weekend dynamic pricing not found',
                    'Weekend dynamic pricing not found'
                );
            }
            if (isExistsInDateRange && isExistsInDateRange.length > 0) {
                return errorResponse(
                    'Weekend dynamic pricing already exists for this date range',
                    'Weekend dynamic pricing already exists'
                );
            }
            const { convert, baseCurrency } = await getCurrencyConverter(
                dynamicPricing.propertyId,
                data.currencyCode ? data.currencyCode : 'AED'
            );
            await this.weekendRepo.updateWeekendDynamicPricing(id, {
                ...data,
                adjustmentValue:
                    data.adjustmentType === 'percentage'
                        ? data.adjustmentValue
                        : convert(data.adjustmentValue),
                currencyCode:
                    data.adjustmentType === 'percentage' ? null : baseCurrency,
            });
            return successResponse(
                'Weekend dynamic pricing updated successfully'
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error updating weekend dynamic pricing',
                    error.message
                );
            }
            return errorResponse(
                'Error updating weekend dynamic pricing',
                'Unknown error'
            );
        }
    }
    public async deleteWeekendDynamicPricing(
        id: string
    ): Promise<IApiResponse> {
        try {
            const existingWeekendPricing =
                await this.weekendRepo.getWeekendDynamicPricing(id);
            if (!existingWeekendPricing) {
                return errorResponse(
                    'Weekend dynamic pricing not found',
                    'Weekend dynamic pricing not found'
                );
            }
            await this.weekendRepo.deleteWeekendDynamicPricing(id);
            return successResponse(
                'Weekend dynamic pricing deleted successfully'
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Error deleting weekend dynamic pricing',
                    error.message
                );
            }
            return errorResponse(
                'Error deleting weekend dynamic pricing',
                'Unknown error'
            );
        }
    }
}
