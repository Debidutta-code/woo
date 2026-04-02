import { Router } from 'express';
import {
  getBestPropertiesController,
  getAllProductsController,
} from '../controllers';

const availibilityRouter = Router();

availibilityRouter.post('/best-properties', getBestPropertiesController);
availibilityRouter.post('/products',        getAllProductsController);

export default availibilityRouter;