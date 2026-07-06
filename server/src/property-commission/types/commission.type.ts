import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';
import { AgentCommissionType } from '../../agency/types/agency-application.types';

export type CommissionType = AgentCommissionType;

export interface IPropertyCommission {
    id: string;
    propertyId: string;
    commissionType: CommissionType;
    commissionValue: number;
    currencyCode: CurrencyCode | null;
}

export interface ICAgencyCommissionDetails {
    commissionType: CommissionType;
    commissionValue: number;
    commissionCurrency: CurrencyCode | null;
}

export interface ICreatePropertyCommission {
    propertyId: string;
    commissionType: CommissionType;
    commissionValue: number;
    currencyCode?: CurrencyCode;
}

export interface IUpdatePropertyCommission {
    commissionType?: CommissionType;
    commissionValue?: number;
    currencyCode?: CurrencyCode | null;
}

export interface ICommissionResult {
    commissionType: CommissionType;
    commissionValue: number;
    commissionAmount: number;
    commissionCurrency: CurrencyCode;
}

export interface ICommissionValidation {
    isValid: boolean;
    errors: string[];
}