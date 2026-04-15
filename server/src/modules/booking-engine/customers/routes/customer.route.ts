import { Router } from 'express';
import { CustomerController } from '../controllers';
import { customerProtect } from '../../../../common/middlewares';

const router = Router();
const customerController = new CustomerController();

// Public routes
router.post('/register', customerController.createCustomer.bind(customerController));
router.post('/login', customerController.loginCustomer.bind(customerController));
router.post('/logout', customerController.logoutCustomer.bind(customerController));

// Protected routes
router.route('/me').get(customerProtect, customerController.getProfile.bind(customerController))
  .put(customerProtect, customerController.updateProfile.bind(customerController))
  .delete(customerProtect, customerController.deleteAccount.bind(customerController));

export { router as customerRouter };
