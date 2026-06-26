import { prisma } from '../../../../config';
import type {
    CreatePolicyData,
    IPolicy,
    PolicyFilters,
    UpdatePolicyData,
    UpdatePolicyDetailsData,
    FilterOptions,
    PaginatedResult,
    allPolicies,
} from '../types/type';

const toStringId = (id: any): string => {
    return typeof id === 'string' ? id : String(id);
};

export class PolicyRepository {
    public static async createOne({
        policyName,
        type,
        description,
        propertyId,
    }: CreatePolicyData): Promise<any> {
        try {
            const existed = await prisma.policy.findFirst({
                where: {
                    propertyId: propertyId,
                    policyName,
                    type: type,
                },
            });

            if (existed) {
                throw new Error(
                    `Policy with this name and type already exists`
                );
            }

            const policy = await prisma.policy.create({
                data: {
                    policyName,
                    type: type as any,
                    description,
                    propertyId: propertyId,
                },
            });

            return policy;
        } catch (error: any) {
            throw new Error(`Failed to create policy: ${error.message}`);
        }
    }

    public static async findOne({
        ratePlanCode,
        propertyId,
    }: PolicyFilters): Promise<IPolicy | null> {
        try {
            const ratePlan = await prisma.ratePlan.findUnique({
                where: { ratePlanCode, propertyId },
            });

            if (!ratePlan) {
                return null;
            }

            const policyId =
                ratePlan.depositPolicyId ||
                ratePlan.cancellationPolicyId ||
                ratePlan.guaranteePolicyId;

            if (!policyId) {
                return null;
            }

            const policy = await prisma.policy.findUnique({
                where: { id: policyId },
            });

            if (policy) {
                return {
                    ...policy,
                    propertyId: policy.propertyId || '',
                };
            }
            return null;
        } catch (error: any) {
            throw new Error(`Failed to find policy: ${error.message}`);
        }
    }

    public static async deleteOne(id: string): Promise<IPolicy | null> {
        try {
            return await prisma.policy.delete({
                where: { id: id },
            });
        } catch (error: any) {
            throw new Error(`Failed to delete policy: ${error.message}`);
        }
    }

    public static async updateOne(
        id: string,
        { policyName, description }: UpdatePolicyDetailsData
    ): Promise<IPolicy | null> {
        try {
            const existingPolicy = await prisma.policy.findUnique({
                where: { id: toStringId(id) },
            });

            if (!existingPolicy) {
                return null;
            }

            const duplicatePolicy = await prisma.policy.findFirst({
                where: {
                    id: { not: toStringId(id) },
                    propertyId: existingPolicy.propertyId,
                    policyName,
                    type: existingPolicy.type,
                },
            });

            if (duplicatePolicy) {
                throw new Error(
                    'Policy with this name and type already exists'
                );
            }

            const policy = await prisma.policy.update({
                where: { id: toStringId(id) },
                data: {
                    policyName,
                    description,
                },
            });

            return {
                ...policy,
                propertyId: policy.propertyId || '',
            };
        } catch (error: any) {
            throw new Error(`Failed to update policy: ${error.message}`);
        }
    }

    public static async MapPolicyDao(id: string, data: UpdatePolicyData) {
        const { ratePlanCode } = data;
        try {
            const policy = await prisma.policy.findUnique({
                where: { id: toStringId(id) },
            });

            if (!policy) {
                throw new Error('No Policy Found');
            }

            const ratePlan = await prisma.ratePlan.findUnique({
                where: { ratePlanCode },
            });

            if (!ratePlan) {
                throw new Error('No Rate Plan Found');
            }
            //The logic seems off here. Please review.
            let currentPolicy: string;

            if (ratePlan.depositPolicyId === id) {
                await prisma.ratePlan.update({
                    where: { ratePlanCode },
                    data: {
                        depositPolicyId: id,
                    },
                });
            }
            if (ratePlan.cancellationPolicyId === id) {
                await prisma.ratePlan.update({
                    where: { ratePlanCode },
                    data: {
                        cancellationPolicyId: id,
                    },
                });
            }
            if (ratePlan.guaranteePolicyId === id) {
                await prisma.ratePlan.update({
                    where: { ratePlanCode },
                    data: {
                        guaranteePolicyId: id,
                    },
                });
            }

            return {};
        } catch (error: any) {
            throw new Error(`Failed to update policy: ${error.message}`);
        }
    }

    public static async getPoliciesByHotelCode(propertyId: string) {
        try {
            const ratePlans = await prisma.ratePlan.findMany({
                where: { propertyId: propertyId },
            });

            const policiesById = new Map<string, allPolicies>();
            const mappedPolicyIds: string[] = [];

            const addPolicyWithRatePlan = (
                policy: any,
                type: 'deposit' | 'guarantee' | 'cancellation',
                ratePlan: any
            ) => {
                mappedPolicyIds.push(policy.id);

                const ratePlanInfo = {
                    id: ratePlan.id,
                    ratePlanCode: ratePlan.ratePlanCode,
                    ratePlanName: ratePlan.ratePlanName,
                };

                const existingPolicy = policiesById.get(policy.id);
                if (existingPolicy) {
                    const hasRatePlan = existingPolicy.ratePlans?.some(
                        item => item.id === ratePlan.id
                    );
                    if (!hasRatePlan) {
                        existingPolicy.ratePlans = [
                            ...(existingPolicy.ratePlans || []),
                            ratePlanInfo,
                        ];
                    }
                    existingPolicy.ratePlanCode = existingPolicy.ratePlans
                        ?.map(item => item.ratePlanCode)
                        .join(', ');
                    existingPolicy.ratePlanName = existingPolicy.ratePlans
                        ?.map(item => item.ratePlanName)
                        .join(', ');
                    return;
                }

                policiesById.set(policy.id, {
                    id: policy.id,
                    policyName: policy.policyName,
                    type,
                    description: policy.description,
                    ratePlanCode: ratePlan.ratePlanCode,
                    propertyId: policy.propertyId || '',
                    ratePlanName: ratePlan.ratePlanName,
                    ratePlans: [ratePlanInfo],
                });
            };

            if (ratePlans && ratePlans.length > 0) {
                for (const ratePlan of ratePlans) {
                    if (ratePlan.depositPolicyId) {
                        const depositPolicy = await prisma.policy.findUnique({
                            where: { id: toStringId(ratePlan.depositPolicyId) },
                        });
                        if (depositPolicy) {
                            addPolicyWithRatePlan(
                                depositPolicy,
                                'deposit',
                                ratePlan
                            );
                        }
                    }

                    // Process guarantee policy
                    if (ratePlan.guaranteePolicyId) {
                        const guaranteePolicy = await prisma.policy.findUnique({
                            where: {
                                id: toStringId(ratePlan.guaranteePolicyId),
                            },
                        });
                        if (guaranteePolicy) {
                            addPolicyWithRatePlan(
                                guaranteePolicy,
                                'guarantee',
                                ratePlan
                            );
                        }
                    }
                    if (ratePlan.cancellationPolicyId) {
                        const cancellationPolicy =
                            await prisma.policy.findUnique({
                                where: {
                                    id: toStringId(
                                        ratePlan.cancellationPolicyId
                                    ),
                                },
                            });
                        if (cancellationPolicy) {
                            addPolicyWithRatePlan(
                                cancellationPolicy,
                                'cancellation',
                                ratePlan
                            );
                        }
                    }
                }
            }

            // Get non-mapped policies
            const nonMappedPolicies = await prisma.policy.findMany({
                where: {
                    propertyId: propertyId,
                    id: {
                        notIn:
                            mappedPolicyIds.length > 0
                                ? mappedPolicyIds
                                : undefined,
                    },
                },
            });

            // Add non-mapped policies to the result
            nonMappedPolicies.forEach((policy: any) => {
                policiesById.set(policy.id, {
                    id: policy.id,
                    policyName: policy.policyName,
                    type: policy.type,
                    description: policy.description,
                    ratePlanCode: '', // Empty for non-mapped policies
                    propertyId: policy.propertyId || '',
                    ratePlanName: '', // Empty for non-mapped policies
                    ratePlans: [],
                });
            });

            const allPolicies = Array.from(policiesById.values());

            return {
                success: true,
                message: 'Policies retrieved successfully',
                allPolicies,
            };
        } catch (error: any) {
            throw new Error(
                `Failed to get policies with rate plans: ${error.message}`
            );
        }
    }
    public static async getPolicyById(id: string): Promise<IPolicy | null> {
        try {
            return await prisma.policy.findUnique({
                where: { id: toStringId(id) },
            });
        } catch (error: any) {
            throw new Error(`Failed to get policy by ID: ${error.message}`);
        }
    }

    public static async AddPolicyToRatePlan(
        policyId: string,
        ratePlanId: string,
        policyType: 'deposit' | 'guarantee' | 'cancellation'
    ) {
        try {
            const ratePlan = await prisma.ratePlan.findUnique({
                where: { id: toStringId(ratePlanId) },
            });

            if (!ratePlan) {
                throw new Error('Rate Plan not found');
            }

            const updateData: any = {};
            if (policyType === 'deposit') {
                updateData.depositPolicyId = policyId;
            } else if (policyType === 'guarantee') {
                updateData.guaranteePolicyId = policyId;
            } else if (policyType === 'cancellation') {
                updateData.cancellationPolicyId = policyId;
            } else {
                throw new Error('Invalid policy type');
            }

            await prisma.ratePlan.update({
                where: { id: toStringId(ratePlanId) },
                data: updateData,
            });

            return true;
        } catch (error: any) {
            throw new Error(
                `Failed to add policy to rate plan: ${error.message}`
            );
        }
    }

    public static async RemovePolicyFromRatePlan(
        ratePlanId: string,
        policyType: 'deposit' | 'guarantee' | 'cancellation'
    ) {
        try {
            const ratePlan = await prisma.ratePlan.findUnique({
                where: { id: toStringId(ratePlanId) },
            });

            if (!ratePlan) {
                throw new Error('Rate Plan not found');
            }

            const updateData: any = {};
            if (policyType === 'deposit') {
                updateData.depositPolicyId = null; 
            } else if (policyType === 'guarantee') {
                updateData.guaranteePolicyId = null; 
            } else if (policyType === 'cancellation') {
                updateData.cancellationPolicyId = null; 
            } else {
                throw new Error('Invalid policy type');
            }

            await prisma.ratePlan.update({
                where: { id: toStringId(ratePlanId) },
                data: updateData,
            });

            return true;
        } catch (error: any) {
            throw new Error(
                `Failed to remove policy from rate plan: ${error.message}` 
            );
        }
    }
}
