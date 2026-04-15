import { Router } from 'express';
import { categoryRouter } from './property-category.route';
import { propertyTypeRouter } from './property-type.route';
import { aminityRouter } from './property-amenity.route';
import { roomAminityRouteM } from './room-amenity.route';
import { loyaltyGuestFieldRouter } from './loyalty.route';
import { paymentIntegrationRouter } from './payment.route';
import { partnerIntegrationRoute } from './partner.route';
import { roomViewRouter } from './room-view.route';
import { explorDestinationRouter } from './explor-destination.route';

const managementRoute = Router();

managementRoute.use('/category', categoryRouter);
managementRoute.use('/amenity', aminityRouter);
managementRoute.use('/type', propertyTypeRouter);
managementRoute.use('/loyalty-guest-field', loyaltyGuestFieldRouter);
managementRoute.use('/payment-integrations', paymentIntegrationRouter);
managementRoute.use('/integration-partner', partnerIntegrationRoute);
managementRoute.use('/room-view', roomViewRouter);
managementRoute.use('/explor-destination', explorDestinationRouter);
aminityRouter.use('/room', roomAminityRouteM);

export { managementRoute };
