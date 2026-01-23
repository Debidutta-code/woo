import { Router } from "express";
import {
    OccupancyDynamicPricingController
} from "../controllers";
import { protect } from "../../middlewares/auth.middleware";
const router = Router();
const occupancyDynamicPricingController = new OccupancyDynamicPricingController();

router
    .route("/")
    .post(protect, occupancyDynamicPricingController.createOccupancyBasedDynamicPricing.bind(occupancyDynamicPricingController))
router.route("/:occupancyId")
    .patch(protect, occupancyDynamicPricingController.updateOccupancyBasedDynamicPricing.bind(occupancyDynamicPricingController))
    .delete(protect, occupancyDynamicPricingController.deleteOccupancyBasedDynamicPricing.bind(occupancyDynamicPricingController));
router.route("/property/:propertyId")
    .get(protect, occupancyDynamicPricingController.getDynamicPricing.bind(occupancyDynamicPricingController));




export default router;
