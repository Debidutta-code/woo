import { Router } from 'express';
import { SubCategoryController } from '../controllers';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';
import { protect } from '../../middlewares/auth.middleware';

const router = Router();
const subCategoryController = new SubCategoryController();

router.post(
    '/',
    protect,
    checkRoleBased('canAddAddons'),
    subCategoryController.createSubCategory
);

router.get('/', subCategoryController.getAllSubCategories);

router.get('/:subcategoryId', subCategoryController.getSubCategoryById);

router.put(
    '/:subcategoryId',
    // validateRequest(validateUpdateSubCategory),
    subCategoryController.updateSubCategory
);

router.post(
    '/:subcategoryId/variants',
    protect,
    checkRoleBased('canAddAddons'),
    subCategoryController.addVariantToSubCategory
);

router.post(
    '/:subcategoryId/addons',
    protect,
    checkRoleBased('canAddAddons'),
    subCategoryController.addAddonToSubCategory
);

router.delete(
    '/:subcategoryId/variants/:variantId',
    subCategoryController.removeVariantFromSubCategory
);

router.delete(
    '/:subcategoryId/addons/:addonId',
    subCategoryController.removeAddonFromSubCategory
);

export { router as SubCategoryRoutes };
