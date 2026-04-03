import { DynamicPricingType } from '.';
import { CurrencyCode, DiscountType } from '../../tax-system/interfaces';

export type SeasonalDynamicPricingEnumType = 'season' | 'holiday' | 'weekend';
export interface ICSeasonalDynamicPricing {
    dynamicId: string;
    roomId: string;
    ruleName: string;
    periodType: SeasonalDynamicPricingEnumType;
    startDate: Date;
    endDate: Date;
    adjustmentType: DiscountType;
    adjustmentValue: number;
    currencyCode: CurrencyCode | null;
    pricingType: DynamicPricingType;
    minCap: number | null;
    maxCap: number | null;

}
export interface ISeasonalDynamicPricingS extends Omit<
    ICSeasonalDynamicPricing,
    'dynamicId'
> { }
export interface ISeasonalDynamicPricing extends ICSeasonalDynamicPricing {
    id: string;
}
