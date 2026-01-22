import { Router } from 'express';
import { CategoryController } from '../controllers';
import { protect } from '../../middlewares/auth.middleware';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';

const router = Router();
const categoryController = new CategoryController();


router.post(
    '/',
    protect,
    checkRoleBased('canAddAddons'),
    categoryController.createCategory
);


router.get('/', categoryController.getAllCategories);


router.get('/:categoryId', categoryController.getCategoryById);

router.put(
    '/:categoryId',
    categoryController.updateCategory
);

router.post(
    '/:categoryId/subcategories',
    protect,
    checkRoleBased('canAddAddons'),
    categoryController.addSubCategoryToCategory
);

router.delete(
    '/:categoryId/subcategories/:subcategoryId',
    protect,
    checkRoleBased('canAddAddons'),
    categoryController.removeSubCategoryFromCategory
);

export { router as CategoryRoutes };
