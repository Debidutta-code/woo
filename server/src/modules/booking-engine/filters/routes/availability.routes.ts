import { Router } from 'express';
import { AvailabilityController } from '../controllers/availability.controller';

const availabilityRouter = Router();
const availabilityController = new AvailabilityController();

availabilityRouter.route('/').get(
    availabilityController.getHotelAvailability.bind(availabilityController)
);

export { availabilityRouter };