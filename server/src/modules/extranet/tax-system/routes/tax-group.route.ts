import { Router } from 'express';
import { TaxGroupController } from '../controllers/tax-group.controller';
import { protect } from '../../../../common/middlewares';
const taxGroupRouter = Router();
const taxGroupController = new TaxGroupController();
taxGroupRouter
    .route('/')
    .post(
        protect,
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
    .put(taxGroupController.updateTaxGroupController.bind(taxGroupController))
    .delete(
        taxGroupController.deleteTaxGroupController.bind(taxGroupController)
    );
taxGroupRouter
    .route('/:taxGroupId/add-rules')
    .post(
        taxGroupController.addRulesToTaxGroupController.bind(taxGroupController)
    );
taxGroupRouter
    .route('/:taxGroupId/remove-rules')
    .post(
        taxGroupController.removeRulesFromTaxGroupController.bind(
            taxGroupController
        )
    );
export default taxGroupRouter;
