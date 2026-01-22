import { Router } from 'express';
import { VariantController } from '../controllers';
import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';

const router = Router();
const variantController = new VariantController();

router.post(
    '/',
    protect,
    checkRoleBased('canAddAddons'),
    variantController.createVariant
);

router.get('/', variantController.getAllVariants);

router.get('/:variantId', variantController.getVariantById);

router.get(
    '/subcategory/:subcategoryId',
    variantController.getVariantsBySubCategoryId
);

router.put(
    '/:variantId',
    variantController.updateVariant
);

router.delete('/:variantId', variantController.deleteVariant);

router.post('/:variantId/addons',
    protect,
    checkRoleBased('canAddAddons'),
    variantController.addAddonToVariant);

router.delete(
    '/:variantId/addons/:addonId',
    variantController.removeAddonFromVariant
);

export { router as VariantRoutes };
