import { Router } from 'express';
import { StartStopSellController } from '../controllers';
import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';
const router = Router();
const startStopSellController = new StartStopSellController();

router
    .route('/:propertyId')
    .patch(
        protect,
        checkRoleBased('canModifyStartStopSell'),
        startStopSellController.createStartStopSell.bind(
            startStopSellController
        )
    );
export default router;
