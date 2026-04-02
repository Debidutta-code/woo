import { errorResponse, IApiResponse, successResponse } from '../../../../common/utils';
import { RatePlanWithAddonRepository } from '../repository';

export class RatePlanWithAddonService {
    public static async addAddonToRatePlan(
        ratePlanCode: string,
        addonId: string
    ): Promise<IApiResponse> {
        try {
            const relation =
                await RatePlanWithAddonRepository.addAddonToRatePlan(
                    ratePlanCode,
                    addonId
                );

            return successResponse(
                'Addon added to rate plan successfully',
                relation
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to add addon to rate plan',
                    error.message
                );
            }
            return errorResponse(
                'Failed to add addon to rate plan',
                'Unknown error'
            );
        }
    }
    public static async removeAddonFromRatePlan(
        ratePlanCode: string,
        addonId: string
    ): Promise<IApiResponse> {
        try {
            const relation =
                await RatePlanWithAddonRepository.removeAddonFromRatePlan(
                    ratePlanCode,
                    addonId
                );

            return successResponse(
                'Addon removed from rate plan successfully',
                relation
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to remove addon from rate plan',
                    error.message
                );
            }
            return errorResponse(
                'Failed to remove addon from rate plan',
                'Unknown error'
            );
        }
    }
    public static async getAddonsByRatePlanCode(
        ratePlanCode: string
    ): Promise<IApiResponse> {
        try {
            const addons =
                await RatePlanWithAddonRepository.getAddonsByRatePlanCode(
                    ratePlanCode
                );

            return successResponse('Addons fetched successfully', addons);
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch addons for rate plan',
                    error.message
                );
            }
            return errorResponse(
                'Failed to fetch addons for rate plan',
                'Unknown error'
            );
        }
    }
    public static async getRatePlansByAddonId(
        addonId: string
    ): Promise<IApiResponse> {
        try {
            const ratePlans =
                await RatePlanWithAddonRepository.getRatePlansByAddonId(
                    addonId
                );

            return successResponse(
                'Rate plans fetched successfully',
                ratePlans
            );
        } catch (error: any) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch rate plans for addon',
                    error.message
                );
            }
            return errorResponse(
                'Failed to fetch rate plans for addon',
                'Unknown error'
            );
        }
    }
}
