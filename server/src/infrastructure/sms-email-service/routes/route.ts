import express from 'express';
import {
    resetCustomerPassword,
    sendOtp,
    verifyCustomerEmail,
    verifyOtp,
} from '../controller/booking-otp.controller';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/verify-email', verifyCustomerEmail);
router.patch('/reset-password', resetCustomerPassword);

export default router;
