import { PromoCodeRepository } from '../repository';
import { ICreatePromoCode } from '../types';
import { isPropertyExists } from '../utils';
import { errorResponse, IApiResponse, successResponse } from '../../../../common/utils';
import { getCurrencyConverter } from '../../../../infrastructure/currency-maping/utils';
export class PromoCodeService {
    private promoCodeRepository: PromoCodeRepository;

    constructor() {
        this.promoCodeRepository = new PromoCodeRepository();
    }

    public async createPromoCode(
        data: ICreatePromoCode
    ): Promise<IApiResponse> {
        try {
            const propertyExists = await isPropertyExists(data.propertyId);
            if (!propertyExists) {
                return errorResponse('Property does not exist');
            }

            const { convert, baseCurrency } = await getCurrencyConverter(
                data.propertyId,
                data.currencyCode
            );
            const existingPromoCode =
                await this.promoCodeRepository.checkIfCodeIsAlreadyExistsForThisProperty(
                    data.propertyId,
                    data.code
                );
            if (existingPromoCode) {
                return errorResponse(
                    'An PromoCode with this code has already exists for this property'
                );
            }
            const promoCode = await this.promoCodeRepository.createPromoCode({
                ...data,
                currencyCode:
                    data.discountType === 'flat'
                        ? baseCurrency
                        : data.currencyCode,
                discountValue:
                    data.discountType === 'flat'
                        ? convert(data.discountValue)
                        : data.discountValue,
            });
            return successResponse(
                'PromoCode created successfully',
                201,
                promoCode
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }
    public async validatePromoCode(
        propertyId: string,
        code: string,
        bookingAmount?: number
    ): Promise<IApiResponse> {
        try {
            const daoRes =
                await this.promoCodeRepository.checkIfCodeIsAlreadyExistsForThisProperty(
                    propertyId,
                    code
                );
            if (!daoRes) {
                return errorResponse(
                    'Invalid promocode',
                    'promocod validation failed'
                );
            }
            if (!daoRes.isActive || daoRes.isDeleted) {
                return errorResponse('Invalid promocode', 'promocod validation failed');
            }

            const now = new Date();
            if (
                (daoRes.validFrom && now < new Date(daoRes.validFrom)) ||
                (daoRes.validTo && now > new Date(daoRes.validTo))
            ) {
                return errorResponse('Promocode expired or not yet active');
            }

            const baseAmount = Number(bookingAmount ?? 0);
            let discountAmount = 0;

            if (baseAmount > 0) {
                if (
                    daoRes.minBookingAmount !== null &&
                    baseAmount < Number(daoRes.minBookingAmount)
                ) {
                    return errorResponse(
                        `Minimum booking amount required is ${daoRes.minBookingAmount}`
                    );
                }

                if (daoRes.discountType === 'percentage') {
                    discountAmount =
                        baseAmount * (Number(daoRes.discountValue) / 100);
                } else {
                    discountAmount = Number(daoRes.discountValue);
                }

                if (
                    daoRes.maxDiscountAmount !== null &&
                    discountAmount > Number(daoRes.maxDiscountAmount)
                ) {
                    discountAmount = Number(daoRes.maxDiscountAmount);
                }

                discountAmount = Math.min(discountAmount, baseAmount);
            }

            const finalAmount = Math.max(baseAmount - discountAmount, 0);

            return successResponse('Promocode Verified successfully', {
                isValid: true,
                code: daoRes.code,
                discountType: daoRes.discountType,
                discountValue: Number(daoRes.discountValue),
                baseAmount: Number(baseAmount.toFixed(2)),
                discountAmount: Number(discountAmount.toFixed(2)),
                finalAmount: Number(finalAmount.toFixed(2)),
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Invalid promocode',
                    'promocod validation failed'
                );
            }
            return errorResponse('Invalid promocode');
        }
    }

    public async getAllPromoCodesByPropertyId(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const propertyExists = await isPropertyExists(propertyId);
            if (!propertyExists) {
                return errorResponse('Property does not exist');
            }
            const promoCodes =
                await this.promoCodeRepository.getPromoCodesByPropertyId(
                    propertyId
                );

            return successResponse(
                'PromoCodes fetched successfully',
                promoCodes
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }

    public async getPromoCodeByParams(
        propertyId: string,
        query: string
    ): Promise<IApiResponse> {
        try {
            const propertyExists = await isPropertyExists(propertyId);
            if (!propertyExists) {
                return errorResponse('Property does not exist');
            }
            const promoCode =
                await this.promoCodeRepository.getPromoCodeByIdOrCode(
                    propertyId,
                    query
                );
            if (!promoCode) {
                return errorResponse('PromoCode not found');
            }
            return successResponse('PromoCode fetched successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }

    public async updatePromoCode(
        params: string,
        data: ICreatePromoCode
    ): Promise<IApiResponse> {
        try {
            const [promoCode, { convert, baseCurrency }] = await Promise.all([
                this.promoCodeRepository.getPromoCodeByIdOrCode(
                    data.propertyId!,
                    params
                ),
                getCurrencyConverter(data.propertyId, data.currencyCode),
            ]);

            if (promoCode?.code != data.code) {
                return errorResponse(
                    'PromoCode code cannot be changed,If want to use the code then create it again'
                );
            }
            if (!promoCode) {
                return errorResponse('PromoCode not found');
            }
            const updatedPromoCode =
                await this.promoCodeRepository.updatePromoCodeByCode(
                    promoCode.code,
                    {
                        ...data,
                        currencyCode:
                            data.discountType === 'flat'
                                ? baseCurrency
                                : data.currencyCode,
                        discountValue:
                            data.discountType === 'flat'
                                ? convert(data.discountValue)
                                : data.discountValue,
                    }
                );
            return successResponse(
                'PromoCode updated successfully',
                updatedPromoCode
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }
    public async SoftDeletePromoCodeById(
        propertyId: string,
        promoCodeId: string
    ): Promise<IApiResponse> {
        try {
            const promoCode =
                await this.promoCodeRepository.getPromoCodeByIdOrCode(
                    propertyId,
                    promoCodeId
                );
            if (!promoCode) {
                return errorResponse('PromoCode not found');
            }
            await this.promoCodeRepository.softDeletePromoCodeById(
                promoCode.id
            );
            return successResponse('PromoCode deleted successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }
    public async HardDeletePromoCodeById(
        propertyId: string,
        promoCodeId: string
    ): Promise<IApiResponse> {
        try {
            const promoCode =
                await this.promoCodeRepository.getPromoCodeByIdOrCode(
                    propertyId,
                    promoCodeId
                );
            if (!promoCode) {
                return errorResponse('PromoCode not found');
            }
            await this.promoCodeRepository.hardDeletePromoCodeById(
                promoCode.id
            );
            return successResponse(
                'PromoCode permanently deleted successfully'
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }
    public async RecoverPromoCodeById(
        propertyId: string,
        promoCodeId: string
    ): Promise<IApiResponse> {
        try {
            const promoCode =
                await this.promoCodeRepository.getPromoCodeByIdOrCode(
                    propertyId,
                    promoCodeId
                );
            if (!promoCode) {
                return errorResponse('PromoCode not found');
            }
            await this.promoCodeRepository.recoverPromoCodeById(promoCode.id);
            return successResponse('PromoCode recovered successfully');
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(error.message);
            }
            return errorResponse('An unexpected error occurred');
        }
    }
}
