import { Router } from "express";
const bookingEngineRouter = Router();
import {
    fetchRooms,
    pricingRouter
} from "../reservation-pricing/routes"
import {
    customerRouter,
    reviewRouter,
    wishListRouter
} from "../customers/routes"
bookingEngineRouter.use('/fetch-rooms', fetchRooms);
bookingEngineRouter.use('/get-price', pricingRouter);
bookingEngineRouter.use('/customer', customerRouter);
bookingEngineRouter.use('/review', reviewRouter);
bookingEngineRouter.use('/wish-list', wishListRouter);
export { bookingEngineRouter };