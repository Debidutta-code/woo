import { Router } from "express";
import { AuthRouter, CreationRouter, UserRouter } from "../auth/routes";
import { dashboardRouter } from "../dashboard/routes";
import { AccessControlRoutes } from "../access-control/routes";
import { PolicyRoute } from "../policies/routes";
import { agentPlatformRouter } from "../../agent-paltform/routes";
import { AriRouter } from "../ari/routes";
import { dynamicPricingRouter } from "../dynamic-pricing/routes";
import { promoCodeRoutes } from "../promocode/routes";
import { TaxSystemRouter } from "../tax-system/routes";
import { AddonsRoute } from "../add-on/routes";
import { reservationRoute } from "../reservation/routes";
import { reportsRouter } from "../reports/routes/reports.route";
import promotionRouter from "../promotions/routes";
import { loyaltyRouter } from "../loyalty/routes/loyalty.routes";
import { managementRoute } from "../../utils-management/routes";
import ActivityRouter from '../../logs/routes/activity.routes';
import PropertyManagement from '../../property-management/routes/index.route';
import { uploadRouter } from "../../../infrastructure/uploads/routes";

const extranetRouter = Router();
extranetRouter.use('/auth', AuthRouter);
extranetRouter.use('/user', UserRouter);
extranetRouter.use('/create', CreationRouter);
extranetRouter.use('/dash', dashboardRouter);

extranetRouter.use('/access', AccessControlRoutes);

extranetRouter.use('/policy', PolicyRoute);
extranetRouter.use('/agent-platform', agentPlatformRouter);
extranetRouter.use('/ari', AriRouter);
extranetRouter.use('/dynamic-pricing', dynamicPricingRouter);
extranetRouter.use('/activities', ActivityRouter);
extranetRouter.use('/promo-codes', promoCodeRoutes);
extranetRouter.use('/tax-system', TaxSystemRouter);
extranetRouter.use('/addon', AddonsRoute);
extranetRouter.use('/reservations', reservationRoute);
extranetRouter.use('/reports', reportsRouter);
extranetRouter.use('/promotions', promotionRouter);
extranetRouter.use('/loyalty', loyaltyRouter);
extranetRouter.use('/utils-management', managementRoute);
    extranetRouter.use('/property-management', PropertyManagement);
    extranetRouter.use("/upload", uploadRouter)


export { extranetRouter };
