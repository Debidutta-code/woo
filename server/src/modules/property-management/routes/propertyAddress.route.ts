import { Router } from 'express';
import {checkRoleBased, protect } from '../../../common/middlewares';
import { PropertyAddressController } from '../controller';

export const propertyAddressRoute = Router({ mergeParams: true });

propertyAddressRoute
    .route('/')
    .get(
        protect,
        checkRoleBased('canViewHotel'),
        PropertyAddressController.findAddressByPropertyIdController
    )
    .post(
        protect,
        checkRoleBased('canCreateHotel'),
        PropertyAddressController.createPropertyAddressController
    )
    .patch(
        protect,
        checkRoleBased('canUpdateHotel'),
        PropertyAddressController.updateAddressByPropertyIdController
    )
    .delete(
        protect,
        checkRoleBased('canDeleteHotel'),
        PropertyAddressController.deleteAddressByPropertyIdController
    );
