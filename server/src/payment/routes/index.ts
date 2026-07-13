// Payment Routes Index
import { Router } from 'express';
import { NGeniusRoutes } from './ngenius.routes';
import { WebhookRoutes } from './webhook.routes';
import { fikafiPaymentRoutes } from './fikafi.routes';

const router = Router();

import axios from 'axios';
import { errorResponse } from '../../utils';

// Mount N-Genius routes
router.use('/ngenius', NGeniusRoutes);

// Mount Webhook routes
router.use('/webhook', WebhookRoutes);

// Create Stripe SetupIntent
router.post('/create-setup-intent', async (req, res) => {
    try {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecretKey) {
            return res.status(500).json(errorResponse('Stripe secret key not configured on server'));
        }
        
        const stripeResponse = await axios.post(
            'https://api.stripe.com/v1/setup_intents',
            new URLSearchParams({
                'payment_method_types[]': 'card',
            }).toString(),
            {
                headers: {
                    Authorization: `Bearer ${stripeSecretKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        return res.status(200).json({
            success: true,
            clientSecret: stripeResponse.data.client_secret,
            id: stripeResponse.data.id
        });
    } catch (error: any) {
        console.error('Stripe SetupIntent creation failed:', error.response?.data || error.message);
        return res.status(400).json(errorResponse('Failed to create setup intent', error.response?.data?.error?.message || error.message));
    }
});

export const PaymentRoutes = router;
