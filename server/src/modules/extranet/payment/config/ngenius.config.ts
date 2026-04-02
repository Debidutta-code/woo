import { config } from '../../../../config';

/** N-Genius payment gateway configuration. Values are validated in config.ts at startup. */
export const NGeniusConfig = {
    baseUrl: config.ngenius.baseUrl,
    apiKey: config.ngenius.apiKey,

    outletId: config.ngenius.outletId,
    endpoints: {
        token: '/identity/auth/access-token',
        orders: '/transactions/outlets',
    },
    tokenExpiry: 300,
} as const;
