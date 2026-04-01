import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { DynamicPricingController } from "../controllers";
import { occupancyRouter } from "./occupancy.route";
import { seasonalRouter } from "./seasonal.route";
import { weekendRouter } from "./weekend.route";
const dynamicPricingController = new DynamicPricingController();
const dynamicPricingRouter = Router();


dynamicPricingRouter.use("/seasonal", seasonalRouter);
dynamicPricingRouter.use("/weekend", weekendRouter);
dynamicPricingRouter.use("/occupancy", occupancyRouter);
dynamicPricingRouter.route("/:id").get(protect,dynamicPricingController.getDynamicPricing.bind(dynamicPricingController));

export {
    dynamicPricingRouter,
    
};