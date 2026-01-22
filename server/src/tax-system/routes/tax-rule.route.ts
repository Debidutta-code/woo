import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware';
import { TaxRuleController } from '../controllers/tax-rule.controller';
import { checkRoleBased } from '../../middlewares/checkRole.middleware';

const taxRuleRouter = Router();
const taxRuleController = new TaxRuleController();

taxRuleRouter
    .route('/')
    .post(
        protect,
        checkRoleBased("canAddTax"),
        taxRuleController.createTaxRuleController.bind(taxRuleController)
    );
taxRuleRouter
    .route('/property/:propertyId')
    .get(
        protect,
        checkRoleBased("canViewTax"),
        taxRuleController.getTaxRulesByPropertyIdController.bind(
            taxRuleController
        )
    );
taxRuleRouter
    .route('/:taxRuleId')
    .put(
        protect,
        checkRoleBased("canUpdateTax"),
        taxRuleController.updateTaxRuleController.bind(taxRuleController)
    )
    .delete(
        protect,
        checkRoleBased("canDeleteTax"),
        taxRuleController.deleteTaxRuleController.bind(taxRuleController)
    );

export default taxRuleRouter;
