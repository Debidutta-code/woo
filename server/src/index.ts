import { config, RedisClient } from './config';
import { app } from './app';
import { initializeExpressRoutes } from './config/route.config';
import { connectPostgres, connectMongo } from './config/index';
import { createServer } from 'http';
import { socketManager } from './socket';
import { CurrencyQueue, EmailQueue } from './queue';

const httpServer = createServer(app);

const connection = {
    host: config.redisHost,
    port: parseInt(config.redisPort || '6379'),
    password: config.redisPassword,
    maxRetriesPerRequest: null,
    connectTimeout: 30000,
    retryStrategy: (times: number) => Math.min(times * 1000, 5000),
};

export const currencyQueue = new CurrencyQueue(connection);
export const emailQueue = new EmailQueue(connection);

initializeExpressRoutes({ app }).then(async () => {
    try {
        await connectMongo();
        await connectPostgres();
        await RedisClient.connect();

        // Init BullMQ after Redis is ready
        await currencyQueue.setupDailyCurrencyFetch();

        socketManager.initialize(httpServer, config.allowedOrigins);

        // Add error handling for address in use and fallback to alternative port
        const listenPort = parseInt(process.env.PORT || config.port || '8080', 10);
        const fallbackPort = listenPort + 1; // simple fallback
        const startServer = (port: number) => {
            httpServer.listen(port, () => {
                console.log(`🏡 Server is running on port ${port}`);
            });
        };
        httpServer.on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                console.warn(`⚠️ Port ${listenPort} in use, trying fallback port ${fallbackPort}`);
                startServer(fallbackPort);
            } else {
                console.error('Server error:', err);
                process.exit(1);
            }
        });
        startServer(listenPort);
    } catch (err) {
        console.log(`Error while initializing server: ${err}`);
    }
});

// Graceful shutdown
const shutdown = async () => {
    console.log('⚠️  Shutting down...');
    await currencyQueue.close();
    await emailQueue.close();
    await RedisClient.close();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
