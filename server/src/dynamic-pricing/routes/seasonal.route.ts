import { Router } from 'express';
import { SeasonalController } from '../controllers';
import { attachPropertyDetails } from '../../middlewares/property.middleware';

const seasonalController = new SeasonalController();
const seasonalRouter = Router();

seasonalRouter.route('/create/:propertyId').post(
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
        attachPropertyDetails({
            identifierType: 'id',
            key: 'propertyId',
            source: 'query',
        }),
        seasonalController.getSeasonalByRoomId.bind(seasonalController)
    );

seasonalRouter
    .route('/update/:id')
    .put(
        attachPropertyDetails({
            identifierType: 'id',
            key: 'propertyId',
            source: 'query',
        }),
        seasonalController.updateSeasonal.bind(seasonalController)
    );

seasonalRouter
    .route('/delete/:id')
    .delete(
        attachPropertyDetails({
            identifierType: 'id',
            key: 'propertyId',
            source: 'query',
        }),
        seasonalController.deleteSeasonal.bind(seasonalController)
    );

export { seasonalRouter };