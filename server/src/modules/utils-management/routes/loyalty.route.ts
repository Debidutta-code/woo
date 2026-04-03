import { Router } from 'express';
import {  protect } from '../../../common/middlewares';
import { LoyaltyGuestFieldControllers } from '../controllers';
const loyaltyGuestFieldRouter = Router();
const loyaltyGuestFieldControllers = new LoyaltyGuestFieldControllers();

loyaltyGuestFieldRouter
    .route('/')
    .post(
        protect,
        loyaltyGuestFieldControllers.createLoyaltyGuestFields.bind(
            loyaltyGuestFieldControllers
        )
    )
    .get(
        protect,
        loyaltyGuestFieldControllers.getLoyaltyGuestFields.bind(
            loyaltyGuestFieldControllers
        )
    );
loyaltyGuestFieldRouter
    .route('/:id')
    .post(
        protect,
        loyaltyGuestFieldControllers.deleteLoyaltyGuestFields.bind(
            loyaltyGuestFieldControllers
        )
    );
export { loyaltyGuestFieldRouter };
