import { IApiResponse, successResponse, errorResponse } from "../../../../common/utils";
import { WishListRepository } from "../repositories";
import { ICWishlistR } from "../types";

export class WishListService {
    private wishListRepository: WishListRepository;

    constructor() {
        this.wishListRepository = new WishListRepository();
    }

    public async addToWishList(data: ICWishlistR): Promise<IApiResponse> {
        try {
            const item = await this.wishListRepository.createWishList(data);
            return successResponse("Property added to wish list successfully", item);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to add to wish list", error.message);
            }
            return errorResponse("Failed to add to wish list", "Unknown error occurred");
        }
    }

    public async getWishListById(id: string): Promise<IApiResponse> {
        try {
            const item = await this.wishListRepository.getWishListById(id);
            if (!item) {
                return errorResponse("Wish list item not found");
            }
            return successResponse("Wish list item fetched successfully", item);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch wish list item", error.message);
            }
            return errorResponse("Failed to fetch wish list item", "Unknown error occurred");
        }
    }

    public async getWishListByCustomerId(customerId: string): Promise<IApiResponse> {
        try {
            const items = await this.wishListRepository.getWishListByCustomerId(customerId);
            return successResponse("Wish list fetched successfully", items);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch wish list", error.message);
            }
            return errorResponse("Failed to fetch wish list", "Unknown error occurred");
        }
    }

    public async getWishListByPropertyId(propertyId: string): Promise<IApiResponse> {
        try {
            const items = await this.wishListRepository.getWishListByPropertyId(propertyId);
            return successResponse("Wish list fetched successfully", items);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch wish list", error.message);
            }
            return errorResponse("Failed to fetch wish list", "Unknown error occurred");
        }
    }

    public async removeFromWishList(id: string): Promise<IApiResponse> {
        try {
            const existing = await this.wishListRepository.getWishListById(id);
            if (!existing) {
                return errorResponse("Wish list item not found");
            }
            const deleted = await this.wishListRepository.deleteWishList(id);
            return successResponse("Property removed from wish list successfully", deleted);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to remove from wish list", error.message);
            }
            return errorResponse("Failed to remove from wish list", "Unknown error occurred");
        }
    }
}
