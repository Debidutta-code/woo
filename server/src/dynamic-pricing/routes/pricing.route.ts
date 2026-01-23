import { Router } from "express";
import occupancyRoute from "./occupancy-pricing.route"
import seasonalRoute from "./seasonal-pricing.route"
import weekendRoute from "./weekend-pricing.route"
const dynamicPricing = Router();

dynamicPricing.use("/occupancy", occupancyRoute);
dynamicPricing.use("/seasonal", seasonalRoute);
dynamicPricing.use("/weekend", weekendRoute);

export { dynamicPricing }