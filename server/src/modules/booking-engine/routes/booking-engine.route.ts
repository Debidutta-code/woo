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
} from "../customers/routes";
import { searchRouter } from "../filters/routes/search.routes";
bookingEngineRouter.use('/search', searchRouter);
bookingEngineRouter.use('/fetch-rooms', fetchRooms);
bookingEngineRouter.use('/get-price', pricingRouter);
bookingEngineRouter.use('/customer', customerRouter);
bookingEngineRouter.use('/review', reviewRouter);
bookingEngineRouter.use('/wish-list', wishListRouter);
export { bookingEngineRouter };