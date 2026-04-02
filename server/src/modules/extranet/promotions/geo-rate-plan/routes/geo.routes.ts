// routes/geoRatePlan.route.ts

import { Router } from 'express';
import { GeoRatePlanController } from '../controllers/geo.controller';
import { protect,checkRoleBased,attachPropertyDetails } from '../../../../../common/middlewares';

export const geoRatePlanRouter = Router();
const geoController = new GeoRatePlanController();
// Create geo rate plan
geoRatePlanRouter.route('/').post(
    protect,
    checkRoleBased('canCreateRatePlan'),
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'query',
    }),
    geoController.createGeoRatePlan.bind(geoController)
);

geoRatePlanRouter.route('/property/:propertyId').get(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    geoController.getGeoRatePlansByPropertyId.bind(geoController)
);

geoRatePlanRouter
    .route('/:id')
    .get(protect, geoController.getGeoRatePlanById.bind(geoController))
    .patch(
        protect,
        checkRoleBased('canUpdateRatePlan'),
        geoController.updateGeoRatePlan.bind(geoController)
    )
    .delete(
        protect,
        checkRoleBased('canDeleteRatePlan'),
        geoController.deleteGeoRatePlan.bind(geoController)
    );
