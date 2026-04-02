import { Router } from 'express';
import {  checkRoleBased, protect } from '../../../common/middlewares';
import { BankController } from '../controller';

export const paymentDetailsRoute = Router({ mergeParams: true });
paymentDetailsRoute
    .route('/')
    .post(
        protect,
        checkRoleBased('canCreateHotel'),
        BankController.addBankDetails
    )
    .get(BankController.getBankDetailsByPropertyId)
    .put(
        protect,
        checkRoleBased('canUpdatePaymentDetails'),
        BankController.updatePaymentMethodsByPropertyId
    );
