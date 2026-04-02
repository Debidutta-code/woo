import { CustomRequest, errorResponse } from '../../../../common/utils';
import { RatePlanWithAddonService } from '../services';
import { Response } from 'express';

export class RatePlanWithAddonController {

    public static async addAddonToRatePlan(req: CustomRequest, res: Response) {
        try {
            const { ratePlanCode, addonId } = req.body;

            if (!ratePlanCode || !addonId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Rate plan code and addon ID are required'
                        )
                    );
            }

            const response = await RatePlanWithAddonService.addAddonToRatePlan(
                ratePlanCode,
                addonId
            );

            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }

    public static async removeAddonFromRatePlan(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const { ratePlanCode, addonId } = req.body;

            if (!ratePlanCode || !addonId) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Rate plan code and addon ID are required'
                        )
                    );
            }

            const response =
                await RatePlanWithAddonService.removeAddonFromRatePlan(
                    ratePlanCode,
                    addonId
                );

            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
    public static async getAddonsByRatePlanCode(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const ratePlanCode = req.params.ratePlanCode;

            if (!ratePlanCode) {
                return res
                    .status(400)
                    .json(errorResponse('Rate plan code is required'));
            }

            const response =
                await RatePlanWithAddonService.getAddonsByRatePlanCode(
                    ratePlanCode
                );

            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
    public static async getRatePlansByAddonId(
        req: CustomRequest,
        res: Response
    ) {
        try {
            const addonId = req.params.addonId;

            if (!addonId) {
                return res
                    .status(400)
                    .json(errorResponse('Addon ID is required'));
            }

            const response =
                await RatePlanWithAddonService.getRatePlansByAddonId(addonId);

            const statusCode = response.success ? 200 : 400;
            return res.status(statusCode).json(response);
        } catch (error: any) {
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
}
