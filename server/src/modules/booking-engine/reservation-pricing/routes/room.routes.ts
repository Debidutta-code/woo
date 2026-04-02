import { Router } from 'express';
import { RoomBookingController } from '../controllers';
import { attachPropertyDetails } from '../../../../common/middlewares';
const fetchRooms = Router();

fetchRooms.post(
    '/',
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'body',
    }),
    RoomBookingController.fetchRooms
);

export {fetchRooms}