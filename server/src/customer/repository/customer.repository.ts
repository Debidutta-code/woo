import { prisma } from '../../config';
import { ICustomer, ICustomerwp } from '../types';

export class CustomerRepository {
    public async findByEmail(email: string): Promise<ICustomer | null> {
        try {
            return await prisma.customers.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            });
        } catch (error: any) {
            console.error('CustomerRepository findByEmail error:', error);
            throw new Error('Error occurred while finding customer: ' + error.message);
        }
    }
    public async loginUser(email: string): Promise<ICustomerwp | null> {
        try {
            return await prisma.customers.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    password: true,
                },
            });
        } catch (error: any) {
            console.error('CustomerRepository loginUser error:', error);
            throw new Error('Error occurred while finding customer: ' + error.message);
        }
    }

    public async findById(id: string) {
        try {
            return await prisma.customers.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    PropertyLoyalityGuests: true,
                    CreationGuest: {
                        include: {
                            CreationLoyaltyConfig: {
                                include: {
                                    LoyalityLevels: true,
                                    BasicLoyaltyProgram: true,
                                    PropertyLoyaltyConfig: {
                                        include: {
                                            Property: {
                                                select: {
                                                    id: true,
                                                    propertyCode: true,
                                                    propertyName: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    WishList: true,
                },
            });
        } catch (error: any) {
            console.error('CustomerRepository findById error:', error);
            throw new Error('Error occurred while finding customer: ' + error.message);
        }
    }

    public async create(data: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }):Promise<ICustomer> {
        try {
            return await prisma.customers.create({
                data,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            });
        } catch (error: any) {
            console.error('CustomerRepository create error:', error);
            throw new Error('Error occurred while creating customer: ' + error.message);
        }
    }

    public async updatePassword(email: string, hashedPassword: string) {
        try {
            return await prisma.customers.update({
                where: { email },
                data: { password: hashedPassword },
            });
        } catch (error: any) {
            console.error('CustomerRepository updatePassword error:', error);
            throw new Error('Error occurred while updating password: ' + error.message);
        }
    }
    
    public async updateProfile(id: string, data: { firstName: string; lastName: string; email?: string; password?: string }) {
        try {
            return await prisma.customers.update({
                where: { id },
                data,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                }
            });
        } catch (error: any) {
            console.error('CustomerRepository updateProfile error:', error);
            throw new Error('Error occurred while updating profile: ' + error.message);
        }
    }
}