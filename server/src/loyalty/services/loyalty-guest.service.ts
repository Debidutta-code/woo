import { IApiResponse } from '../../utils';
import { successResponse, errorResponse } from '../../utils';
import { prisma } from '../../config';
import {
    LoyalityLevelRepository,
    LoyaltyGuestRepository,
    PropertyLoyalityGuest,
    propertyLoyalityRepository,
} from '../repository';
import { ILoyalityLevels } from '../types';
import { paginatedSuccessResponse } from '../../utils';
import { CreationGuestRepository } from '../repository/creation-guest.repository';
import { createHash } from '../../auth/utills/bcryptHelper';
import { CurrencyCode } from '../../tax-system/interfaces';
import { CustomerRepository } from '../../customer/repository';
export class LoyaltyGuestService {
    private loyaltyGuestRepository: LoyaltyGuestRepository;
    private creationGuestRepository: CreationGuestRepository;
    private propertyLoyaltyRepository: propertyLoyalityRepository;
    private loyaltyLevelRepository: LoyalityLevelRepository;
    private customerRepository: CustomerRepository;
    private propertyGuestRepository: PropertyLoyalityGuest;

    constructor() {
        this.loyaltyGuestRepository = new LoyaltyGuestRepository();
        this.creationGuestRepository = new CreationGuestRepository();
        this.propertyLoyaltyRepository = new propertyLoyalityRepository();
        this.loyaltyLevelRepository = new LoyalityLevelRepository();
        this.customerRepository = new CustomerRepository();
        this.propertyGuestRepository = new PropertyLoyalityGuest();
    }

    public async getLoyalityGuestForcreationLoyality(
        creationLoyalityId: string,
        skip: number = 0,
        take: number = 10
    ): Promise<IApiResponse> {
        try {
            const [loyaltyGuests, count] = await Promise.all([
                this.loyaltyGuestRepository.getLoyalityGuestForCreation(
                    creationLoyalityId,
                    skip,
                    take
                ),
                this.loyaltyGuestRepository.getTotalLoyalityGuests(
                    creationLoyalityId
                ),
            ]);
            return paginatedSuccessResponse(
                'Loyalty guests fetched successfully',
                loyaltyGuests,
                {
                    currentPage: Math.floor(skip / take) + 1,
                    limit: take,
                    totalCount: count,
                    totalPages: Math.ceil(count / take),
                    hasNextPage: skip + take < count,
                    hasPrevPage: skip > 0,
                }
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to get loyalty guests for property',
                    error.message
                );
            }
            return errorResponse('Failed to get loyalty guests for property');
        }
    }
    public async getLoyalityGuestsForProperty(
        propertyId: string,
        skip: number = 0,
        take: number = 10
    ): Promise<IApiResponse> {
        try {
            const [loyaltyGuests, count] = await Promise.all([
                this.loyaltyGuestRepository.getLoyalityGuestsForProperty(
                    propertyId,
                    skip,
                    take
                ),
                this.loyaltyGuestRepository.totalLoyalityGuestsForProperty(
                    propertyId
                ),
            ]);
            return paginatedSuccessResponse(
                'Loyalty guests fetched successfully',
                loyaltyGuests,
                {
                    currentPage: Math.floor(skip / take) + 1,
                    limit: take,
                    totalCount: count,
                    totalPages: Math.ceil(count / take),
                    hasNextPage: skip + take < count,
                    hasPrevPage: skip > 0,
                }
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to get loyalty guests for property',
                    error.message
                );
            }
            return errorResponse('Failed to get loyalty guests for property');
        }
    }

    public async registerGuestFromBookingEngine(data: {
        propertyId: string;
        metaData: any;
        customerId: string;
    }): Promise<IApiResponse> {
        try {
            const { propertyId, metaData, } = data;

            const propertyLoyaltyConfig =
                await this.propertyLoyaltyRepository.getLoyalityForPropertyWhereTrue(
                    propertyId
                );
            if (!propertyLoyaltyConfig) {
                return errorResponse(
                    'No active loyalty program found for this property'
                );
            }

            const creationLoyaltyConfigId =
                propertyLoyaltyConfig.CreationLoyaltyConfig?.id;
            if (!creationLoyaltyConfigId) {
                return errorResponse(
                    'No loyalty configuration found for this property'
                );
            }

            const existingGuest =
                await this.customerRepository.findById(data.customerId);

            if (existingGuest) {
                const [guestExistForProperty, existingCreationGuest] =
                    await Promise.all([
                        this.propertyGuestRepository.guestExistForProperty(
                            propertyLoyaltyConfig.id,
                            existingGuest.id
                        ),
                        this.creationGuestRepository.checkIfGuestExist(
                            creationLoyaltyConfigId,
                            existingGuest.id
                        ),
                    ]);
                if (guestExistForProperty && existingCreationGuest) {
                    return successResponse(
                        "You are already registered for this property's loyalty program"
                    );
                }

                // ✅ Create only what's missing
                const tasks = [];
                if (!guestExistForProperty) {
                    tasks.push(
                        this.propertyGuestRepository.createPropertyLoyaltyGuest(
                            {
                                propertyLoyalityId: propertyLoyaltyConfig.id,
                                customerId: existingGuest.id,
                                noOfBookings:0
                            }
                        )
                    );
                }
                if (!existingCreationGuest) {
                    tasks.push(
                        this.creationGuestRepository.createCreationGuest({
                            customerId: existingGuest.id,
                            creationLoyaltyConfigId,
                            metaData,
                            guestLevel: 1,
                            noOfBookings: 0,
                        })
                    );
                }
                await Promise.all(tasks);
                return successResponse(
                    'Successfully registered for loyalty program'
                );
            }




            return successResponse(
                'Successfully registered for loyalty program'
            );
        } catch (error) {
            return errorResponse(
                'Failed to register for loyalty program',
                error instanceof Error ? error.message : undefined
            );
        }
    }
    public async checkLoyaltyDiscount(
        customerId: string,
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const propertyConfig =
                await this.propertyLoyaltyRepository.getActiveLoyaltyConfigByPropertyId(
                    propertyId
                );
            if (!propertyConfig) {
                return errorResponse(
                    'No active loyalty program found for this property'
                );
            }

            if (!propertyConfig.CreationLoyaltyConfig?.id) {
                return errorResponse(
                    'No loyalty configuration found for this property'
                );
            }



            const [guestExistForProperty, existingCreationGuest] =
                await Promise.all([
                    this.propertyGuestRepository.guestExistForProperty(
                        propertyConfig.id,
                        customerId,

                    ),
                    this.creationGuestRepository.checkIfGuestExist(
                        propertyConfig.CreationLoyaltyConfig.id,
                        customerId,

                    ),
                ]);
            console.log(guestExistForProperty, existingCreationGuest);
            if (!guestExistForProperty || !existingCreationGuest) {
                return successResponse('Guest is not a loyalty member', {
                    isLoyaltyMember: false,
                    discount: null,
                });
            }

            const currentGuestLevel = existingCreationGuest.guestLevel;
            const levels =
                propertyConfig.CreationLoyaltyConfig?.LoyalityLevels ?? [];

            // Find the discount for guest's current level
            const matchedLevel = levels.find(
                (l: ILoyalityLevels) => l.level === currentGuestLevel
            );

            const discountValue =
                matchedLevel?.discountPercentage;

            const discountType =
                propertyConfig.CreationLoyaltyConfig?.loyaltyDiscountType ??
                'percentage';
            const currencyCode =
                propertyConfig.CreationLoyaltyConfig?.currencyCode;

            return successResponse('Loyalty discount available', {
                isLoyaltyMember: true,
                discount: {
                    type: discountType,
                    value: discountValue,
                    currencyCode,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to check loyalty discount',
                    error.message
                );
            }
            return errorResponse('Failed to check loyalty discount');
        }
    }

    public async getCustomerConfigForProperty(propertyId: string): Promise<IApiResponse> {
        try {
            const config = await prisma.propertyLoyaltyConfig.findFirst({
                where: { propertyId, isActive: true },
                include: {
                    CreationLoyaltyConfig: {
                        include: {
                            BasicLoyaltyProgram: true,
                            loyaltyConditions: {
                                where: { isDeleted: false, isActive: true }
                            },
                            loyaltySpecialConditions: {
                                where: { isDeleted: false, isActive: true }
                            },
                            LoyaltyProgramFieldConfig: {
                                where: { visibleInRegistration: true }
                            }
                        }
                    }
                }
            });

            if (!config || !config.CreationLoyaltyConfig) {
                return errorResponse('No active loyalty program found for this property');
            }

            const loyalty = config.CreationLoyaltyConfig;
            const result = {
                discountType: loyalty.loyaltyDiscountType,
                discountValue: loyalty.discountValue,
                currencyCode: loyalty.currencyCode || 'INR',
                discountImage: loyalty.BasicLoyaltyProgram?.logo?.[0] || null,
                terms: (loyalty.loyaltyConditions || []).map(t => ({ id: t.id, text: t.text })),
                specialTerms: (loyalty.loyaltySpecialConditions || []).map(st => ({ id: st.id, title: st.title, subTitle: st.subTitle })),
                fields: (loyalty.LoyaltyProgramFieldConfig || []).map(f => ({ id: f.id, fieldName: f.fieldName, required: f.required }))
            };

            return successResponse('Loyalty config fetched successfully', result);
        } catch (error) {
            return errorResponse('Failed to fetch loyalty config', error instanceof Error ? error.message : undefined);
        }
    }
}
