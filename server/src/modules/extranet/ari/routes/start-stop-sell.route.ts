import { Router } from 'express';
import { StartStopSellController } from '../controllers';
import { attachPropertyDetails, protect } from '../../../../common/middlewares';
const router = Router();
const startStopSellController = new StartStopSellController();

router.route('/:propertyId').patch(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    startStopSellController.createStartStopSell.bind(startStopSellController)
);
export default router;
