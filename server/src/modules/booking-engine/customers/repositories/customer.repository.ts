import { prisma } from '../../../../config';
import { ICCustomerR, ICustomer, IUCustomer } from '../types';

export class CustomerRepository {
    public async getCustomerBookingDetails(
        email: string,
        page: number,
        limit: number,
        filterData?: string
    ): Promise<{ bookings: any[]; totalBookings: number }> {
        try {
            const normalizedFilter = (filterData || '').toLowerCase().trim();
            const now = new Date();
            const whereClause: any = {
                bookingUserEmail: email,
            };

            if (normalizedFilter === 'cancelled') {
                whereClause.bookingStatus = 'cancelled';
            } else if (normalizedFilter === 'upcoming') {
                whereClause.bookingStatus = { not: 'cancelled' };
                whereClause.checkInDate = { gte: now };
            } else if (normalizedFilter === 'completed') {
                whereClause.bookingStatus = { not: 'cancelled' };
                whereClause.checkOutDate = { lt: now };
            }

            const [bookings, totalBookings] = await Promise.all([
                prisma.reservation.findMany({
                    where: whereClause,
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        reservationGuests: true,
                    },
                }),
                prisma.reservation.count({
                    where: whereClause,
                }),
            ]);

            return { bookings, totalBookings };
        } catch (error) {
            throw new Error('Error occure while fetching customer bookings');
        }
    }

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
