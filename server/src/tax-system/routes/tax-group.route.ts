import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { TaxGroupController } from '../controllers/tax-group.controller';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';
const taxGroupRouter = Router();
const taxGroupController = new TaxGroupController();
taxGroupRouter
    .route('/')
    .post(
        protect,
        checkRoleBased("canCreateTaxGroup"),
        taxGroupController.createTaxGroupController.bind(taxGroupController)
    );
taxGroupRouter
    .route('/property/:propertyId')
    .get(
        taxGroupController.getTaxGroupsByPropertyIdController.bind(
            taxGroupController
        )
    );
taxGroupRouter
    .route('/:taxGroupId')
    .put(
        protect,
        taxGroupController.updateTaxGroupController.bind(taxGroupController)
    )
    .delete(
        protect,
        checkRoleBased("canDeleteTaxGroup"),
        taxGroupController.deleteTaxGroupController.bind(taxGroupController)
    );
taxGroupRouter
    .route('/:taxGroupId/add-rules')
    .post(
        protect,
        taxGroupController.addRulesToTaxGroupController.bind(taxGroupController)
    );
taxGroupRouter
    .route('/:taxGroupId/remove-rules')
    .post(
        protect,
        taxGroupController.removeRulesFromTaxGroupController.bind(
            taxGroupController
        )
    );
export default taxGroupRouter;
