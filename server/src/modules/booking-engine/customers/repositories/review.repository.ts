import { prisma } from '../../../../config';
import { 
    IReviews,
    ICReviewsR
} from "../types/reviews.type"
export class ReviewRepository {
    public async createReview(data:ICReviewsR):Promise<IReviews>{
        try {
            return await prisma.reviews.create({
                data,
            });
        } catch (error) {
            throw new Error('Error occure while creating the review');
        }
    }
    public async getReviewById(id:string):Promise<IReviews | null>{
        try {
            return await prisma.reviews.findUnique({
                where:{
                    id,
                    isDeleted:false
                }
            })
        } catch (error) {
            throw new Error('Error occure while fetching the review');
        }
    }
    public async updateReview(id:string,data:ICReviewsR):Promise<IReviews>{
        try {
            return await prisma.reviews.update({
                where:{
                    id,
                    isDeleted:false
                },
                data,
            })
        } catch (error) {
            throw new Error('Error occure while updating the review');
        }
    }
    public async deleteReview(id:string):Promise<IReviews>{
        try {
            return await prisma.reviews.update({
                where:{
                    id
                },
                data:{
                    isDeleted:true
                }
            })
        } catch (error) {
            throw new Error('Error occure while deleting the review');
        }
    }
    public async getReviewsForCustomer(customerId:string):Promise<IReviews[]>{
        try {
            return await prisma.reviews.findMany({
                where:{
                    customerId,
                    isDeleted:false
                }
            })
        } catch (error) {
            throw new Error('Error occure while fetching the reviews');
        }
    }
    public async getReviewsForProperty(propertyRef:string){
        try {
            return await prisma.reviews.findMany({
                where:{
                    isDeleted:false,
                    OR: [
                        { propertyId: propertyRef },
                        { propertyCode: propertyRef },
                    ],
                },
                include: {
                    Customer: {
                        select: {
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            })
        } catch (error) {
            throw new Error('Error occure while fetching the reviews');
        }
    }

    public async getReservationForReview(reservationId: string) {
        try {
            return await prisma.reservation.findUnique({
                where: {
                    id: reservationId,
                },
                include: {
                    property: {
                        select: {
                            propertyName: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new Error('Error occure while fetching reservation details');
        }
    }
}
