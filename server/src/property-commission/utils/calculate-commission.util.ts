import { CommissionType, ICommissionResult, ICommissionValidation } from '../types';

export class CommissionCalculator {
    public static calculate(
        subtotal: number,
        commissionType: CommissionType,
        commissionValue: number,
        currencyCode: string = 'INR'
    ): ICommissionResult {
        let commissionAmount = 0;

        if (commissionType === 'percentage') {
            commissionAmount = (subtotal * commissionValue) / 100;
        } else if (commissionType === 'fixed') {
            commissionAmount = commissionValue;
        }

        return {
            commissionType,
            commissionValue,
            commissionAmount: Number(commissionAmount.toFixed(2)),
            commissionCurrency: currencyCode as any,
        };
    }

    public static computeCommissionAmount(
        subtotal: number,
        commissionType: CommissionType,
        commissionValue: number
    ): number {
        if (commissionType === 'percentage') {
            return (subtotal * commissionValue) / 100;
        } else if (commissionType === 'fixed') {
            return commissionValue;
        }
        return 0;
    }

    public static roundToPrecision(value: number, precision: number = 2): number {
        return Number(value.toFixed(precision));
    }

    public static calculateTotalWithCommission(
        subtotal: number,
        commissionAmount: number
    ): number {
        return subtotal + commissionAmount;
    }

    public static calculateCommissionFromRevenue(
        totalRevenue: number,
        commissionRate: number
    ): number {
        return (totalRevenue * commissionRate) / 100;
    }

    public static validateCommissionConfig(
        config: Partial<{
            commissionType: CommissionType;
            commissionValue: number;
        }>
    ): ICommissionValidation {
        const errors: string[] = [];

        if (config.commissionType && !['percentage', 'fixed'].includes(config.commissionType)) {
            errors.push('Invalid commission type. Must be "percentage" or "fixed"');
        }

        if (config.commissionValue !== undefined && config.commissionValue < 0) {
            errors.push('Commission value must be non-negative');
        }

        if (config.commissionType === 'percentage' && config.commissionValue !== undefined && config.commissionValue > 100) {
            errors.push('Percentage commission cannot exceed 100%');
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}