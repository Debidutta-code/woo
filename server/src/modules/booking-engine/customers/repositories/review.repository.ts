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
        } catch (error: any) {
            throw new Error(`Error occurred while creating the review: ${error.message}`);
        }
    }
    public async getReviewById(id:string):Promise<IReviews | null>{
        try {
            return await prisma.reviews.findFirst({
                where:{
                    id,
                    isDeleted:false
                }
            })
        } catch (error: any) {
            throw new Error(`Error occurred while fetching the review: ${error.message}`);
        }
    }
    public async updateReview(id:string,data:ICReviewsR):Promise<IReviews>{
        try {
            return await prisma.reviews.update({
                where:{
                    id,
                },
                data,
            })
        } catch (error: any) {
            throw new Error(`Error occurred while updating the review: ${error.message}`);
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
        } catch (error: any) {
            throw new Error(`Error occurred while deleting the review: ${error.message}`);
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
        } catch (error: any) {
            throw new Error(`Error occurred while fetching the reviews: ${error.message}`);
        }
    }
    public async getReviewsForProperty(propertyId:string):Promise<IReviews[]>{
        try {
            return await prisma.reviews.findMany({
                where:{
                    propertyId,
                    isDeleted:false
                }
            })
        } catch (error: any) {
            throw new Error(`Error occurred while fetching the reviews: ${error.message}`);
        }
    }
}