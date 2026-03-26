import { Router } from 'express';
import { PropertyController } from '../controllers';

const propertyRouter = Router();
const controller = new PropertyController();

// 1. Search — user types property name
// GET /api/properties/search?propertyName=marina&page=1&limit=10
propertyRouter.get('/search', controller.searchProperties);

// 2. Property detail — user picks one from search results
// GET /api/properties/:id
propertyRouter.get('/:id', controller.getPropertyById);

// 3. Address — next page after property detail
// GET /api/properties/:id/address
propertyRouter.get('/:id/address', controller.getPropertyAddress);

// 4. Rooms — next page after address
// GET /api/properties/:id/rooms
propertyRouter.get('/:id/rooms', controller.getPropertyRooms);

export { propertyRouter };