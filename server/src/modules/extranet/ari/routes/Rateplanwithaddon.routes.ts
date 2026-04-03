import { Router } from 'express';
import { RatePlanWithAddonController } from '../controllers';
import { checkRoleBased, protect } from '../../../../common/middlewares';

export const ratePlanWithAddonRouter = Router();

ratePlanWithAddonRouter.post(
    '/',
    protect,
    checkRoleBased('canUpdateRatePlan'),
    RatePlanWithAddonController.addAddonToRatePlan
);

ratePlanWithAddonRouter.delete(
    '/',
    protect,
    checkRoleBased('canUpdateRatePlan'),
    RatePlanWithAddonController.removeAddonFromRatePlan
);

ratePlanWithAddonRouter.get(
    '/:ratePlanCode',
    protect,
    RatePlanWithAddonController.getAddonsByRatePlanCode
);
ratePlanWithAddonRouter.get(
    '/:addonId',
    protect,
    RatePlanWithAddonController.getRatePlansByAddonId
);

export default ratePlanWithAddonRouter;
