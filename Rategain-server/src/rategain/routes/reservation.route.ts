import { Router } from 'express';
import {
  preCheckReservationController,
  commitReservationController,
  cancelReservationController,
} from '../controllers';

const reservationRouter = Router();

reservationRouter.post('/precheck', preCheckReservationController);
reservationRouter.post('/commit', commitReservationController);
reservationRouter.post('/cancel', cancelReservationController);

export default reservationRouter;