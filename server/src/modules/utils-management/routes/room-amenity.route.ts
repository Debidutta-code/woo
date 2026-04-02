import { Router } from 'express';
import { RoomAminityController } from '../controllers';
import { checkMultiplePermissions, checkRoleBased, protect } from '../../../common/middlewares';

const roomAminityController = new RoomAminityController();
const roomAminityRouteM = Router();

roomAminityRouteM
    .route('/get')
    .get(
        protect,
        checkMultiplePermissions(['canCreateHotel', 'canUpdateHotel']),
        roomAminityController.getRoomAmenities.bind(roomAminityController)
    );

roomAminityRouteM
    .route('/create')
    .post(
        protect,
        checkRoleBased('canCDAmenity'),
        roomAminityController.createRoomAminity.bind(roomAminityController)
    );

roomAminityRouteM
    .route('/update')
    .patch(
        protect,
        checkRoleBased('canCDAmenity'),
        roomAminityController.deleteRoomAmenities.bind(roomAminityController)
    );
export { roomAminityRouteM };
