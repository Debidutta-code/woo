import { Router } from 'express';
import { RoomBookingController } from '../controllers';
import { pricingRouter } from './pricing.route';
import { attachPropertyDetails } from '../../../../common/middlewares';
export const BookingEngineRoutes = Router();

BookingEngineRoutes.post(
    '/fetch-rooms',
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'body',
    }),
    RoomBookingController.fetchRooms
);
BookingEngineRoutes.use('/pricing', pricingRouter);
