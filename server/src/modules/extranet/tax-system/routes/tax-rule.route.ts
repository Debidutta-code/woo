import { Router } from 'express';
import { TaxRuleController } from '../controllers/tax-rule.controller';
import { protect } from '../../../../common/middlewares';

const taxRuleRouter = Router();
const taxRuleController = new TaxRuleController();

taxRuleRouter
    .route('/')
    .post(
        protect,
        taxRuleController.createTaxRuleController.bind(taxRuleController)
    );
taxRuleRouter
    .route('/property/:propertyId')
    .get(
        taxRuleController.getTaxRulesByPropertyIdController.bind(
            taxRuleController
        )
    );
taxRuleRouter
    .route('/:taxRuleId')
    .put(taxRuleController.updateTaxRuleController.bind(taxRuleController))
    .delete(taxRuleController.deleteTaxRuleController.bind(taxRuleController));

export default taxRuleRouter;
