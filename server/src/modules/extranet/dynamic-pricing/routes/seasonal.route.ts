import { Router } from 'express';
import { SeasonalController } from '../controllers';
import { attachPropertyDetails, protect } from '../../../../common/middlewares';

const seasonalController = new SeasonalController();
const seasonalRouter = Router();

seasonalRouter.route('/create/:propertyId').post(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    seasonalController.createSeasonal.bind(seasonalController)
);
seasonalRouter
    .route('/by-room/:roomId')
    .get(
        protect,
        seasonalController.getSeasonalByRoomId.bind(seasonalController)
    );
seasonalRouter
    .route('/update/:id')
    .put(protect, seasonalController.updateSeasonal.bind(seasonalController));
seasonalRouter
    .route('/delete/:id')
    .delete(
        protect,
        seasonalController.deleteSeasonal.bind(seasonalController)
    );
export { seasonalRouter };
