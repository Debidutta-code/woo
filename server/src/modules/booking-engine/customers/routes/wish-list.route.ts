import { Router } from 'express';
import { WishListController } from '../controllers';
import { customerProtect } from '../../../../common/middlewares';

const router = Router();
const wishListController = new WishListController();

// All wish-list routes require authentication
router.post(
    '/',
    customerProtect,
    wishListController.addToWishList.bind(wishListController)
);
router.get(
    '/my',
    customerProtect,
    wishListController.getMyWishList.bind(wishListController)
);
router.get(
    '/property/:propertyId',
    customerProtect,
    wishListController.getWishListByProperty.bind(wishListController)
);
router.get(
    '/:id',
    customerProtect,
    wishListController.getWishListById.bind(wishListController)
);
router.delete(
    '/:id',
    customerProtect,
    wishListController.removeFromWishList.bind(wishListController)
);

export { router as wishListRouter };
