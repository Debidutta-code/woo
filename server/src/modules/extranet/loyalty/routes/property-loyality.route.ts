import { Router } from 'express';
import { PropertyLoyalityController } from '../controllers';
import { attachPropertyDetails, protect } from '../../../../common/middlewares';

const router = Router();

// Initialize controller
const propertyLoyalityController = new PropertyLoyalityController();

// ===== Property Loyalty Routes =====
router
    .route('/')
    .post(
        protect,
        propertyLoyalityController.createPropertyLoyalityConfig.bind(
            propertyLoyalityController
        )
    );
router
    .route('/by-program/:loyaltyProgramId')
    .get(
        protect,
        propertyLoyalityController.getPropertiesByLoyaltyProgram.bind(
            propertyLoyalityController
        )
    );
router.route('/:propertyId').get(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    propertyLoyalityController.getLoyalityForProperty.bind(
        propertyLoyalityController
    )
);

router
    .route('/config/:propertyId')
    .patch(
        protect,
        propertyLoyalityController.updatePropertyLoyalityConfig.bind(
            propertyLoyalityController
        )
    )

    .delete(
        protect,
        propertyLoyalityController.deletePropertyLoyalityConfig.bind(
            propertyLoyalityController
        )
    );

router.route('/all/:propertyId').get(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    propertyLoyalityController.getAllPropertyLoyalityWithLoyality.bind(
        propertyLoyalityController
    )
);

router.route('/active/:propertyId').get(
    protect,
    attachPropertyDetails({
        identifierType: 'id',
        key: 'propertyId',
        source: 'params',
    }),
    propertyLoyalityController.getActiveLoyaltyConfigByPropertyId.bind(
        propertyLoyalityController
    )
);

export default router;
