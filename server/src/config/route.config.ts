import { Express, NextFunction, Request, Response, Router } from 'express';
import { PaymentRoutes } from '../modules/extranet/payment/routes';
import integrationRouter from '../modules/integrations/routes/index.routes';
import platformRouter from '../platforms/routes/platform.routes';
import { fikafiPaymentRoutes } from '../modules/extranet/payment/routes/fikafi.routes';
import { initRouter } from '../modules/extranet/auth/routes';
import { agencyMainRouter } from '../modules/extranet/agency/routes/index.route';
import { AppError } from '../common/utils/error.util';
import { currencyRoutes } from '../infrastructure/currency-maping/routes';
import { bookingEngineRouter } from '../modules/booking-engine/routes';
import { extranetRouter } from '../modules/extranet/routes';
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

    apiV1Router.use('/init', initRouter);

    apiV1Router.use('/extranet', extranetRouter);
    apiV1Router.use('/booking-engine', bookingEngineRouter);
    apiV1Router.use('/agency', agencyMainRouter);
    apiV1Router.use('/fikafi', fikafiPaymentRoutes);

    apiV1Router.use('/payment', PaymentRoutes);
    apiV1Router.use('/integrations', integrationRouter);
    apiV1Router.use('/platform', platformRouter);

    apiV1Router.use('/currency', currencyRoutes);

    app.all('/api/v1/*', (req: Request, _res: Response, next: NextFunction) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
    });
}
