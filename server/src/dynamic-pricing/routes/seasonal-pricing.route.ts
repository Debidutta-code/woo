import { Router } from "express";
import {
    SeasonalDynamicPricingController
} from "../controllers";
import { protect } from "../../middlewares/auth.middleware";
const router = Router();
const seasonalDynamicPricingController = new SeasonalDynamicPricingController();

router
    .route("/")
    .post(protect, seasonalDynamicPricingController.createSeasonalDynamicPricing.bind(seasonalDynamicPricingController))
router.route("/:seasonalId")
    .patch(protect, seasonalDynamicPricingController.updateSeasonalPricing.bind(seasonalDynamicPricingController))
    .delete(protect, seasonalDynamicPricingController.deleteSeasonalPricing.bind(seasonalDynamicPricingController));
router.route("/property/:propertyId")
    .get(protect, seasonalDynamicPricingController.getSeasonalPricing.bind(seasonalDynamicPricingController));




export default router;
