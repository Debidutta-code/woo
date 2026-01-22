import { Router } from 'express';
import { BookingAddonController } from '../controllers';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();
const bookingAddonController = new BookingAddonController();

router.post(
    '/',
    protect,
        checkRoleBased('canAddAddons'),
        bookingAddonController.createBookingAddon
);

router.put(
    '/:bookingAddonId',
    protect,
    checkRoleBased('canAddAddons'),
    bookingAddonController.updateBookingAddon
);

router.delete('/:bookingAddonId', 
    protect,
    checkRoleBased('canAddAddons'),
    bookingAddonController.deleteBookingAddon);

export { router as BookingAddonRoutes };
