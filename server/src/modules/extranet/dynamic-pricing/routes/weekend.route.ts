import { Router } from 'express';
import { WeekendController } from '../controllers';
import { attachPropertyDetails, protect } from '../../../../common/middlewares';

const weekendController = new WeekendController();
const weekendRouter = Router();

weekendRouter.route('/create/:propertyId').post(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    weekendController.createWeekend.bind(weekendController)
);
weekendRouter
    .route('/by-room/:roomId')
    .get(protect, weekendController.getWeekendByRoomId.bind(weekendController));
weekendRouter
    .route('/update/:id')
    .put(protect, weekendController.updateWeekend.bind(weekendController));
weekendRouter
    .route('/delete/:id')
    .delete(protect, weekendController.deleteWeekend.bind(weekendController));
export { weekendRouter };
