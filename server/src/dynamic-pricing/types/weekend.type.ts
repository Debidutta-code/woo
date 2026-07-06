import { DynamicPricingType } from '.';
import { CurrencyCode, DiscountType } from '../../tax-system/interfaces/tourist-tax.type';

export type WeekEndDays = 'friday' | 'saturday' | 'sunday';

export interface ICWeekendDynamicPricing {
    dynamicId: string;
    roomId: string;
    ruleName: string;
    weekendDays: WeekEndDays[];
    startDate: Date;
    endDate: Date;
    adjustmentType: DiscountType;
    adjustmentValue: number;
    currencyCode: CurrencyCode | null;
    minCap: number | null;
    maxCap: number | null;
    pricingType: DynamicPricingType;
}

export interface ICWeekendDynamicPricingS extends Omit<
    ICWeekendDynamicPricing,
    'dynamicId'
> {}

export interface IWeekendDynamicPricing extends ICWeekendDynamicPricing {
    id: string;
}