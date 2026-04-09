
import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';

const propertyRouter = Router();
const propertyController = new PropertyController();

propertyRouter.route('/').get(
    propertyController.getPropertyDetails.bind(propertyController)
);

export { propertyRouter };