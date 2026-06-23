import { Request, Response } from 'express';
import { emailService } from '../service';
import { prisma } from '../../../config';
import { createHash } from '../../../modules/extranet/auth/utills/bcryptHelper';

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

export const verifyCustomerEmail = async (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required.',
        });
    }

    try {
        const customer = await prisma.customers.findFirst({
            where: { email, isDeleted: false },
            select: { id: true },
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Email not found.',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Email verified.',
        });
    } catch (error) {
        console.error('Error verifying customer email:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const resetCustomerPassword = async (req: Request, res: Response) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const newPassword = String(req.body?.newPassword || '').trim();

    if (!email || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Email and newPassword are required.',
        });
    }

    try {
        const customer = await prisma.customers.findFirst({
            where: { email, isDeleted: false },
            select: { id: true },
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Email not found.',
            });
        }

        const hashedPassword = await createHash(newPassword);
        await prisma.customers.update({
            where: { id: customer.id },
            data: { password: hashedPassword },
        });

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully.',
        });
    } catch (error) {
        console.error('Error resetting customer password:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
