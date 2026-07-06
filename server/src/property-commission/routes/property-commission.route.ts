import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { PropertyCommissionController } from '../controllers';

const propertyCommissionRouter = Router();
const propertyCommissionController = new PropertyCommissionController();

// Create property commission
propertyCommissionRouter
    .route('/')
    .post(protect, propertyCommissionController.createPropertyCommission.bind(propertyCommissionController));

// Get property commission by property ID
propertyCommissionRouter
    .route('/:propertyId')
    .get(protect, propertyCommissionController.getPropertyCommission.bind(propertyCommissionController));

// Update property commission
propertyCommissionRouter
    .route('/:propertyId')
    .put(protect, propertyCommissionController.updatePropertyCommission.bind(propertyCommissionController));

// Delete property commission
propertyCommissionRouter
    .route('/:propertyId')
    .delete(protect, propertyCommissionController.deletePropertyCommission.bind(propertyCommissionController));

// Calculate commission for a booking
propertyCommissionRouter
    .route('/:propertyId/calculate')
    .post(protect, propertyCommissionController.calculateCommission.bind(propertyCommissionController));

export { propertyCommissionRouter };