import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { initializeExpressRoutes } from './configs/route.config';
import config from './configs/env.configs';

const app: Express = express();

app.use(cors({
    origin: config.allowedOrigins?.length > 0 ? config.allowedOrigins : ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],
    credentials: true,
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.static('public'));
app.set('trust proxy', true);

initializeExpressRoutes({ app });

app.listen(config.port, () => {
    console.log(`🚀 Server is running on port ${config.port}`);
});