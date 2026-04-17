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
import { filterRouter } from "../filters/routes";
import { problemTicketRouter } from "../problem-tickets/routes";
bookingEngineRouter.use('/filters', filterRouter);
bookingEngineRouter.use('/fetch-rooms', fetchRooms);
bookingEngineRouter.use('/get-price', pricingRouter);
bookingEngineRouter.use('/customer', customerRouter);
bookingEngineRouter.use('/customers', customerRouter);
bookingEngineRouter.use('/review', reviewRouter);
bookingEngineRouter.use('/wish-list', wishListRouter);
bookingEngineRouter.use('/problem-ticket', problemTicketRouter);
export { bookingEngineRouter };