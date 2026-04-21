import {
    IApiResponse,
    successResponse,
    errorResponse,
} from '../../../../common/utils';
import { prisma } from '../../../../config';
import { WishListRepository } from '../repositories';
import { ICWishlistR } from '../types';

export class WishListService {
    private wishListRepository: WishListRepository;

    constructor() {
        this.wishListRepository = new WishListRepository();
    }

    public async addToWishList(data: ICWishlistR): Promise<IApiResponse> {
        try {
            // Check if already in wishlist
            const existing = await prisma.wishList.findFirst({
                where: {
                    customerId: data.customerId,
                    propertyId: data.propertyId,
                },
            });

            // If exists, remove it (toggle off)
            if (existing) {
                const deleted = await this.wishListRepository.deleteWishList(
                    existing.id
                );
                return successResponse(
                    'Property removed from wish list successfully',
                    { removed: true, deleted }
                );
            }

            // If not exists, add it (toggle on)
            const property = await prisma.property.findUnique({
                where: { id: data.propertyId },
                select: {
                    propertyCode: true,
                    propertyName: true,
                },
            });

            if (!property) {
                return errorResponse('Property not found');
            }

            const wishlistData = {
                customerId: data.customerId,
                propertyId: data.propertyId,
                propertyCode: property.propertyCode,
                propertyName: property.propertyName,
                roomId: data.roomId || null,
                roomType: data.roomType || null,
                roomName: data.roomName || null,
            };

            const item =
                await this.wishListRepository.createWishList(wishlistData);
            return successResponse('Property added to wish list successfully', {
                added: true,
                item,
            });
        } catch (error) {
            console.error('Wishlist toggle error:', error);
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to toggle wish list',
                    error.message
                );
            }
            return errorResponse(
                'Failed to toggle wish list',
                'Unknown error occurred'
            );
        }
    }

    public async getWishListById(id: string): Promise<IApiResponse> {
        try {
            const item = await this.wishListRepository.getWishListById(id);
            if (!item) {
                return errorResponse('Wish list item not found');
            }
            return successResponse('Wish list item fetched successfully', item);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch wish list item',
                    error.message
                );
            }
            return errorResponse(
                'Failed to fetch wish list item',
                'Unknown error occurred'
            );
        }
    }

    public async getWishListByCustomerId(
        customerId: string
    ): Promise<IApiResponse> {
        try {
            const items =
                await this.wishListRepository.getWishListByCustomerId(
                    customerId
                );
            return successResponse('Wish list fetched successfully', items);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch wish list',
                    error.message
                );
            }
            return errorResponse(
                'Failed to fetch wish list',
                'Unknown error occurred'
            );
        }
    }

    public async getWishListByPropertyId(
        propertyId: string
    ): Promise<IApiResponse> {
        try {
            const items =
                await this.wishListRepository.getWishListByPropertyId(
                    propertyId
                );
            return successResponse('Wish list fetched successfully', items);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to fetch wish list',
                    error.message
                );
            }
            return errorResponse(
                'Failed to fetch wish list',
                'Unknown error occurred'
            );
        }
    }

    public async removeFromWishList(id: string): Promise<IApiResponse> {
        try {
            const existing = await this.wishListRepository.getWishListById(id);
            if (!existing) {
                return errorResponse('Wish list item not found');
            }
            const deleted = await this.wishListRepository.deleteWishList(id);
            return successResponse(
                'Property removed from wish list successfully',
                deleted
            );
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(
                    'Failed to remove from wish list',
                    error.message
                );
            }
            return errorResponse(
                'Failed to remove from wish list',
                'Unknown error occurred'
            );
        }
    }
}
