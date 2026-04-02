import { Router } from 'express';
import { syncPropertiesController } from '../controllers';
import reservationRouter from './reservation.route';
import availibilityRouter from './availibility.route';

const router = Router();

router.get('/', syncPropertiesController);
router.use('/reservation',reservationRouter)
router.use('/availibility',availibilityRouter)

export default router;