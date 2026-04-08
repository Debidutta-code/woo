import { prisma } from '../../../../config';
import { IWishlist, ICWishlistR,IWishlistWProperty } from "../types/wish-list.types"

export class WishListRepository{
    public async createWishList(data:ICWishlistR):Promise<IWishlist>{
        try {
            return await prisma.wishList.create({
                data,
            });
        } catch (error) {
            throw new Error('Error occure while creating the wish list');
        }
    }
    public async getWishListById(id:string):Promise<IWishlist | null>{
        try {
            return await prisma.wishList.findUnique({
                where:{
                    id,
                }
            })
        } catch (error) {
            throw new Error('Error occure while fetching the wish list');
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
        } catch (error) {
            throw new Error('Error occure while fetching the wish list');
        }
    }

    public async deleteWishList(id:string):Promise<IWishlist>{
        try {
            return await prisma.wishList.delete({
                where:{
                    id,
                }
            })
        } catch (error) {
            throw new Error('Error occure while deleting the wish list');
        }
    }
    public async getWishListByPropertyId(propertyId:string):Promise<IWishlist[] | null>{
        try {
            return await prisma.wishList.findMany({
                where:{
                    propertyId,
                }
            })
        } catch (error) {
            throw new Error('Error occure while fetching the wish list');
        }
    }

}