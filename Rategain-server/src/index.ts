import express, { Express } from 'express';
import { initializeExpressRoutes } from './configs/route.config';
import config from './configs/env.configs';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initializeExpressRoutes({ app });

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});