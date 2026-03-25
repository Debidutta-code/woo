import { Router } from 'express';
import { searchPropertiesController } from '../controllers';

const propertyRouter = Router();


propertyRouter.get('/search', searchPropertiesController);

export { propertyRouter };