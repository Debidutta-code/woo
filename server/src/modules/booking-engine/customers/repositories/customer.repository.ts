import { prisma } from '../../../../config';
import { ICCustomerR, ICustomer, IUCustomer } from '../types';

export class CustomerRepository {
    public async createCustomer(data: ICCustomerR): Promise<ICustomer> {
        try {
            return await prisma.customers.create({
                data,
            });
        } catch (error) {
            console.error('[CustomerRepository.createCustomer] Prisma error:', error);
            const err = error as any;
            if (err?.code) {
                if (err.code === 'P2002') {
                    const target = Array.isArray(err?.meta?.target)
                        ? err.meta.target.join(', ')
                        : String(err?.meta?.target || 'unknown field');
                    throw new Error(`Unique constraint failed on: ${target}`);
                }
                throw new Error(`Database error (${err.code}) while creating customer`);
            }
            throw new Error('Error occure while creating the customer');
        }
    }

    public async getCustomerByEmail(email: string,isDeleted:boolean = false): Promise<ICustomer | null> {
        try {
            return await prisma.customers.findUnique({
                where: {
                    email,
                    isDeleted: isDeleted,
                },
            });
        } catch (error) {
            throw new Error('Error occure while fetching the customer');
        }
    }
    public async getCustomerById(id: string,isDeleted:boolean = false): Promise<ICustomer | null> {
        try {
            return await prisma.customers.findUnique({
                where: {
                    id,
                    isDeleted: isDeleted,
                },
            });
        } catch (error) {
            throw new Error('Error occure while fetching the customer');
        }
    }
    public async getCustomerByPhoneNumber(
        phoneNumber: string,isDeleted:boolean = false
    ): Promise<ICustomer | null> {
        try {
            return await prisma.customers.findUnique({
                where: {
                    mobilePhone: phoneNumber,
                    isDeleted: isDeleted,
                },
            });
        } catch (error) {
            throw new Error('Error occure while fetching the customer');
        }
    }
    public async updateCustomer(
        id: string,
        data: IUCustomer
    ): Promise<ICustomer> {
        try {
            return await prisma.customers.update({
                where: {
                    id,
                },
                data,
            });
        } catch (error) {
            throw new Error('Error occure while updating the customer');
        }
    }
    public async deleteCustomer(id:string):Promise<ICustomer>{
        try {
            return await prisma.customers.update({
                where:{
                    id
                },
                data:{
                    isDeleted:true
                }
            })
        } catch (error) {
            throw new Error('Error occure while deleting the customer');
        }
    }
}
