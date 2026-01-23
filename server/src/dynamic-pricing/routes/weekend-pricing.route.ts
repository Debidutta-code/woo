import { Router } from "express";
import {
    WeekendBasedDynamicPricingController,
} from "../controllers";
import { protect } from "../../middlewares/auth.middleware";
const router = Router();
const weekendBasedDynamicPricingController = new WeekendBasedDynamicPricingController();

router
    .route("/")
    .post(protect, weekendBasedDynamicPricingController.createWeekendDayDynamicPricing.bind(weekendBasedDynamicPricingController))
router.route("/weekend/:weekend")
    .patch(protect, weekendBasedDynamicPricingController.updateWeekendPricingController.bind(weekendBasedDynamicPricingController))
    .delete(protect, weekendBasedDynamicPricingController.deleteWeekendPricingController.bind(weekendBasedDynamicPricingController));
router.route("/weekday/:weekDay")
    .patch(protect, weekendBasedDynamicPricingController.updateWeekendDayPricingController.bind(weekendBasedDynamicPricingController))
router.route("/property/:propertyId")
    .get(protect, weekendBasedDynamicPricingController.getWeekendPricingForPropertyController.bind(weekendBasedDynamicPricingController));




export default router;
