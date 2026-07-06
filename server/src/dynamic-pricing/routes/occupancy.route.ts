import { Router } from 'express';
import { OccupancyController } from '../controllers';
import { attachPropertyDetails } from '../../middlewares/property.middleware';

const occupancyController = new OccupancyController();
const occupancyRouter = Router();

occupancyRouter.route('/create/:propertyId').post(
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    occupancyController.createOccupancy.bind(occupancyController)
);

occupancyRouter
    .route('/by-room/:roomId')
    .get(
        attachPropertyDetails({
            identifierType: 'id',
            key: 'propertyId',
            source: 'query',
        }),
        occupancyController.getOccupancyByRoomId.bind(occupancyController)
    );

occupancyRouter
    .route('/update/:id')
    .put(
        attachPropertyDetails({
            identifierType: 'id',
            key: 'propertyId',
            source: 'query',
        }),
        occupancyController.updateOccupancy.bind(occupancyController)
    );

occupancyRouter
    .route('/delete/:id')
    .delete(
        attachPropertyDetails({
            identifierType: 'id',
            key: 'propertyId',
            source: 'query',
        }),
        occupancyController.deleteOccupancy.bind(occupancyController)
    );

export { occupancyRouter };