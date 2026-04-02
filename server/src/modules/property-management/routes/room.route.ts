import { Router } from 'express';
import { checkRoleBased, protect } from '../../../common/middlewares';
import { RoomController } from '../controller';

export const propertyRoomRoute = Router({ mergeParams: true });
const roomController = new RoomController();
propertyRoomRoute
    .route('/')
    .post(
        protect,
        checkRoleBased('canCreateHotel'),
        roomController.createRoom.bind(roomController)
    );
propertyRoomRoute
    .route('/inv-setup')
    .get(protect, roomController.getRoomsForInvSetup.bind(roomController));
propertyRoomRoute
    .route('/property-rooms')
    .get(
        protect,
        checkRoleBased('canViewHotel'),
        roomController.getAllRoomsByPropertyId.bind(roomController)
    );
propertyRoomRoute
    .route('/:roomId')
    .get(roomController.getRoomById.bind(roomController))
    .patch(
        protect,
        checkRoleBased('canUpdateHotel'),
        roomController.updateRoom.bind(roomController)
    )
    .delete(
        protect,
        checkRoleBased('canDeleteHotel'),
        roomController.deleteRoom.bind(roomController)
    )
    .put(
        protect,
        checkRoleBased('canUpdateHotel'),
        roomController.add360ImageToRoom.bind(roomController)
    );
