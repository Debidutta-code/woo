import { Express, NextFunction, Request, Response, Router } from 'express';
import { rateGainRouter } from '../rategain/routes';
import { propertyRouter } from '../property/routes';

export async function initializeExpressRoutes({ app }: { app: Express }) {
    app.head('/status', (_, res: Response) => res.status(200).end());

    const apiV1Router = Router();
    app.use('/api/v1', apiV1Router);

    app.get('/health', (_req: Request, res: Response) => {
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
        });
    });
    apiV1Router.use('/rategain', rateGainRouter);
    apiV1Router.use('/property', propertyRouter);
    app.all('/api/v1/*path', (req: Request, _res: Response, next: NextFunction) => {
        next(`Can't find ${req.originalUrl} on this server`);
    });
}
