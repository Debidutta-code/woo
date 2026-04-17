import { prisma } from '../../../../config';
import { IWishlist, ICWishlistR,IWishlistWProperty } from "../types/wish-list.types"

export class WishListRepository{
    public async createWishList(data:ICWishlistR):Promise<IWishlist>{
        try {
            return await prisma.wishList.create({
                data,
            });
        } catch (error: any) {
            throw new Error(`Error occurred while creating the wish list: ${error.message}`);
        }
    }
    public async getWishListById(id:string):Promise<IWishlist | null>{
        try {
            return await prisma.wishList.findUnique({
                where:{
                    id,
                }
            })
        } catch (error: any) {
            throw new Error(`Error occurred while fetching the wish list: ${error.message}`);
        }
    }
    public async getWishListByCustomerId(customerId:string):Promise<IWishlistWProperty[] >{
        try {
            return await prisma.wishList.findMany({
                where:{
                    customerId,
                },
                include:{
                    Property:true
                }
            })
        } catch (error: any) {
            throw new Error(`Error occurred while fetching the wish list: ${error.message}`);
        }
    }

    public async deleteWishList(id:string):Promise<IWishlist>{
        try {
            return await prisma.wishList.delete({
                where:{
                    id,
                }
            })
        } catch (error: any) {
            throw new Error(`Error occurred while deleting the wish list: ${error.message}`);
        }
    }
    public async getWishListByPropertyId(propertyId:string):Promise<IWishlist[] | null>{
        try {
            return await prisma.wishList.findMany({
                where:{
                    propertyId,
                }
            })
        } catch (error: any) {
            throw new Error(`Error occurred while fetching the wish list: ${error.message}`);
        }
    }

}