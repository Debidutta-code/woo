import { Express, NextFunction, Request, Response, Router } from 'express';
import PropertyManagement from '../modules/property-management/routes/index.route';
import { PolicyRoute } from '../modules/extranet/policies/routes';
import { TaxSystemRouter } from '../modules/extranet/tax-system/routes';
import { BookingEngineRoutes } from '../modules/booking-engine/reservation-pricing/routes';
import { PaymentRoutes } from '../modules/extranet/payment/routes';

import { loyaltyRouter } from '../modules/extranet/loyalty/routes/loyalty.routes';
import promotionRouter from '../modules/extranet/promotions/routes';
import integrationRouter from '../modules/integrations/routes/index.routes';
import platformRouter from '../platforms/routes/platform.routes';
import { fikafiPaymentRoutes } from '../modules/extranet/payment/routes/fikafi.routes';
import { managementRoute } from '../modules/utils-management/routes';
import { uploadRouter } from '../infrastructure/uploads/routes';
import { AuthRouter, CreationRouter, initRouter, UserRouter } from '../modules/extranet/auth/routes';
import { dashboardRouter } from '../modules/extranet/dashboard/routes';
import { AccessControlRoutes } from '../modules/extranet/access-control/routes';
import { agentPlatformRouter } from '../modules/agent-paltform/routes';
import { AriRouter } from '../modules/extranet/ari/routes';
import { dynamicPricingRouter } from '../modules/extranet/dynamic-pricing/routes';
import { AddonsRoute } from '../modules/extranet/add-on/routes';
import { agencyMainRouter } from '../modules/extranet/agency/routes/index.route';
import { AppError } from '../common/utils/error.util';
import ActivityRouter from '../modules/logs/routes/activity.routes';
import { currencyRoutes } from '../infrastructure/currency-maping/routes';
import { promoCodeRoutes } from '../modules/extranet/promocode/routes';
import { reservationRoute } from '../modules/extranet/reservation/routes';
import { reportsRouter } from '../modules/extranet/reports/routes/reports.route';
export async function initializeExpressRoutes({ app }: { app: Express }) {
    // Health check
    app.head('/status', (_, res: Response) => res.status(200).end());

    const apiV1Router = Router();
    app.use('/api/v1', apiV1Router);

    // Health check endpoint
    app.get('/health', (_req: Request, res: Response) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
        });
    });

    // Mount all routers under /api/v1
    apiV1Router.use('/auth', AuthRouter);
    apiV1Router.use('/user', UserRouter);
    apiV1Router.use('/create', CreationRouter);
    apiV1Router.use('/init', initRouter);

    apiV1Router.use('/dash', dashboardRouter);

    apiV1Router.use('/access', AccessControlRoutes);

    apiV1Router.use('/policy', PolicyRoute);
    apiV1Router.use('/agent-platform', agentPlatformRouter);
    apiV1Router.use('/property-management', PropertyManagement);
    apiV1Router.use('/ari', AriRouter);
    apiV1Router.use('/dynamic-pricing', dynamicPricingRouter);
    apiV1Router.use('/activities', ActivityRouter);
    apiV1Router.use('/promo-codes', promoCodeRoutes);
    apiV1Router.use('/tax-system', TaxSystemRouter);
    apiV1Router.use('/addon', AddonsRoute);
    apiV1Router.use('/reservations', reservationRoute);
apiV1Router.use('/reports', reportsRouter);

    apiV1Router.use('/booking-engine', BookingEngineRoutes);
    apiV1Router.use('/agency', agencyMainRouter);
    apiV1Router.use('/promotions', promotionRouter);
    apiV1Router.use('/loyalty', loyaltyRouter);
    apiV1Router.use('/fikafi', fikafiPaymentRoutes);
    apiV1Router.use('/utils-management', managementRoute);
    apiV1Router.use("/upload",uploadRouter)

    apiV1Router.use('/payment', PaymentRoutes);
    apiV1Router.use('/integrations', integrationRouter);
    apiV1Router.use('/platform', platformRouter);

    apiV1Router.use('/currency', currencyRoutes);

    // Handle 404 for any undefined route under /api/v1
    app.all('/api/v1/*', (req: Request, _res: Response, next: NextFunction) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    });

    // Global error handler
    // app.use(errorHandler);
}
