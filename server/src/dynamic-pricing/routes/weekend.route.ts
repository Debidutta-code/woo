import { Router } from 'express';
import { WeekendController } from '../controllers';
import { attachPropertyDetails } from '../../middlewares/property.middleware';

const weekendController = new WeekendController();
const weekendRouter = Router();

weekendRouter.route('/create/:propertyId').post(
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    weekendController.createWeekend.bind(weekendController)
);

weekendRouter
    .route('/by-room/:roomId')
    .get(
        attachPropertyDetails({
            identifierType: 'id',
            key: 'propertyId',
            source: 'query',
        }),
        weekendController.getWeekendByRoomId.bind(weekendController)
    );

weekendRouter
    .route('/update/:id')
    .put(
        attachPropertyDetails({
            identifierType: 'id',
            key: 'propertyId',
            source: 'query',
        }),
        weekendController.updateWeekend.bind(weekendController)
    );

weekendRouter
    .route('/delete/:id')
    .delete(
        attachPropertyDetails({
            identifierType: 'id',
            key: 'propertyId',
            source: 'query',
        }),
        weekendController.deleteWeekend.bind(weekendController)
    );

export { weekendRouter };