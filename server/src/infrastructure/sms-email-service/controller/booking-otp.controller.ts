import { Request, Response } from 'express';
import { emailService } from '../service';

export const sendOtp = async (req: Request, res: Response) => {
    const { email, purpose, identifier, type } = req.body;
    const normalizedEmail = email || identifier;
    const normalizedPurpose =
        (purpose || type) === 'mail_verification'
            ? 'email_verification'
            : (purpose || type);

    if (!normalizedEmail) {
        return res.status(400).json({
            success: false,
            message: 'Email is required.',
        });
    }

    // Default purpose to email_verification if not provided
    const otpPurpose = normalizedPurpose || 'email_verification';

    // Validate purpose
    if (
        !['email_verification', 'password_reset', 'login'].includes(otpPurpose)
    ) {
        return res.status(400).json({
            success: false,
            message:
                'Invalid purpose. Must be one of: email_verification, password_reset, login',
        });
    }

    try {
        const result = await emailService.sendOTPEmail(normalizedEmail, otpPurpose);

        if (!result.success) {
            return res.status(429).json({
                success: false,
                message: result.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error: any) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    const { email, otp, purpose, identifier, type } = req.body;
    const normalizedEmail = email || identifier;
    const normalizedPurpose =
        (purpose || type) === 'mail_verification'
            ? 'email_verification'
            : (purpose || type);

    if (!normalizedEmail || !otp) {
        return res.status(400).json({
            success: false,
            message: 'Email and OTP are required.',
        });
    }

    // Default purpose to email_verification if not provided
    const otpPurpose = normalizedPurpose || 'email_verification';

    try {
        const result = await emailService.verifyOTP(normalizedEmail, otp, otpPurpose);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message,
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
