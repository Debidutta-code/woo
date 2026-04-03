// src/modules/restrictions/routes/restriction.routes.ts

import { Router } from 'express';
import { RestrictionController } from '../controllers';
import { attachPropertyDetails, checkRoleBased, protect } from '../../../../common/middlewares';

export const restrictionRouter = Router();

// Apply restrictions (CTA/CTD)
restrictionRouter.route('/apply').post(
    protect,
    checkRoleBased('canUpdateRatePlan'), // or create 'canManageRestrictions'
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'body',
    }),
    RestrictionController.applyRestrictions
);

// Get restrictions for a property
restrictionRouter.route('/:propertyCode').get(
    protect,
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'params',
    }),
    RestrictionController.getRestrictions
);
