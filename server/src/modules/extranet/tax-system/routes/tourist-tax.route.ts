import { Router } from 'express';
import { TouristTaxController } from '../controllers/tourist-tax.controller';
import { protect } from '../../../../common/middlewares';

const touristTaxRouter = Router();
const touristTaxController = new TouristTaxController();

touristTaxRouter
    .route('/')
    .post(
        protect,
        touristTaxController.createTouristTaxController.bind(
            touristTaxController
        )
    );

touristTaxRouter
    .route('/property/:propertyId')
    .get(
        protect,
        touristTaxController.getTouristTaxesByPropertyIdController.bind(
            touristTaxController
        )
    );

touristTaxRouter
    .route('/:touristTaxId')
    .put(
        protect,
        touristTaxController.updateTouristTaxController.bind(
            touristTaxController
        )
    )
    .delete(
        protect,
        touristTaxController.deleteTouristTaxController.bind(
            touristTaxController
        )
    );

export default touristTaxRouter;
