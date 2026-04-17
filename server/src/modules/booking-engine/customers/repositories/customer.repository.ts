import { prisma } from '../../../../config';
import { ICCustomerR, ICustomer, IUCustomer } from '../types';

export class CustomerRepository {
    public async createCustomer(data: ICCustomerR): Promise<ICustomer> {
        try {
            return await prisma.customers.create({
                data,
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Error occurred while creating the customer: ${message}`);
        }
    }

    public async getCustomerByEmail(email: string, isDeleted: boolean = false): Promise<ICustomer | null> {
        try {
            return await prisma.customers.findFirst({
                where: {
                    email,
                    isDeleted: isDeleted,
                },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Error occurred while fetching the customer: ${message}`);
        }
    }
    public async getCustomerById(id: string, isDeleted: boolean = false): Promise<ICustomer | null> {
        try {
            return await prisma.customers.findFirst({
                where: {
                    id,
                    isDeleted: isDeleted,
                },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Error occurred while fetching the customer: ${message}`);
        }
    }
    public async getCustomerByPhoneNumber(
        phoneNumber: string, isDeleted: boolean = false
    ): Promise<ICustomer | null> {
        try {
            return await prisma.customers.findFirst({
                where: {
                    mobilePhone: phoneNumber,
                    isDeleted: isDeleted,
                },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Error occurred while fetching the customer: ${message}`);
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
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Error occurred while updating the customer: ${message}`);
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
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Error occurred while deleting the customer: ${message}`);
        }
    }
}
