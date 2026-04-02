import { Router } from 'express';
import { MLOSController } from '../controllers';
import { checkRoleBased, protect } from '../../../../../common/middlewares';

export const mlosRouter = Router();
const mlosController = new MLOSController();
mlosRouter
    .route('/')
    .post(
        protect,
        checkRoleBased('canCreateRatePlan'),
        mlosController.createRatePlanRule.bind(mlosController)
    );

mlosRouter
    .route('/:ratePlanId')
    .get(
        protect,
        mlosController.getRatePlanRuleByRatePlanId.bind(mlosController)
    )
    .put(
        protect,
        checkRoleBased('canUpdateRatePlan'),
        mlosController.updateRatePlanRule.bind(mlosController)
    )
    .delete(
        protect,
        checkRoleBased('canDeleteRatePlan'),
        mlosController.deleteRatePlanRule.bind(mlosController)
    );
mlosRouter
    .route('/property/:propertyId')
    .get(
        protect,
        mlosController.getRatePlanRulesByPropertyId.bind(mlosController)
    );
