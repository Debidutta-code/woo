import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { DynamicPricingController } from "../controllers";
const dynamicPricingController = new DynamicPricingController();
const dynamicPricingRouter = Router();
const seasonalRouter = Router();
const weekendRouter = Router();
const occupancyRouter = Router();


dynamicPricingRouter.use("/seasonal", seasonalRouter);
dynamicPricingRouter.use("/weekend", weekendRouter);
dynamicPricingRouter.use("/occupancy", occupancyRouter);
dynamicPricingRouter.route("/:id").get(dynamicPricingController.getDynamicPricing.bind(dynamicPricingController));

export {
    dynamicPricingRouter,
    seasonalRouter,
    weekendRouter,
    occupancyRouter
};