import { Router } from "express";
const bookingEngineRouter = Router();
import {
    fetchRooms,
    pricingRouter
} from "../reservation-pricing/routes"

bookingEngineRouter.use('/fetch-rooms', fetchRooms);
bookingEngineRouter.use('/get-price', pricingRouter);

export { bookingEngineRouter };