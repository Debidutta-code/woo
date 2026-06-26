import { Router } from 'express';
import { PolicyController } from '../controller';
import { attachPropertyDetails, checkRoleBased, protect } from '../../../../common/middlewares';

const router = Router();

router.route('/').post(
    protect,
    checkRoleBased('canCreatePolicy'),
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'body',
    }),
    PolicyController.createPolicies
);
router
    .route('/:id')
    .patch(
        protect,
        checkRoleBased('canUpdatePolicy'),
        PolicyController.updatePolicy
    )
    .delete(
        protect,
        checkRoleBased('canDeletePolicy'),
        PolicyController.deletePolicy
    );
router.route('/getPolicy').post(
    protect,
    checkRoleBased('canViewHotel'),
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'body',
    }),
    PolicyController.findPolicy
);
router.route('/getPolicyByHotelCode').get(
    protect,
    checkRoleBased('canViewHotel'),
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'query',
    }),
    PolicyController.getPoliciesByHotelCode
);

router
    .route('/addToRatePlan')
    .post(
        protect,
        checkRoleBased('canCreatePolicy'),
        PolicyController.AddToRatePlan
    );

router
    .route('/removeToRatePlan')
    .post(
        protect,
        checkRoleBased('canDeletePolicy'),
        PolicyController.removeFromRatePlan
    );
export default router;
