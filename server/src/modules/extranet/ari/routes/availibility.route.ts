import { Router } from 'express';
import { AvailabilityController } from '../controllers';
import { attachPropertyDetails, protect } from '../../../../common/middlewares';
export const availabilityRouter = Router();

availabilityRouter.route('/calendar').post(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'body',
    }),
    AvailabilityController.getCalendarAvailability
);
