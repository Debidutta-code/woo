import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT,
    postgresUrl: process.env.DATABASE_URL,
    rategainBaseUrl: process.env.RATEGAIN_BASE_URL,
    rategainApiKey: process.env.RATEGAIN_API_KEY,
    rategainSecretKey: process.env.RATEGAIN_SECRET_KEY,
    allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['*'],
}
export default config;
