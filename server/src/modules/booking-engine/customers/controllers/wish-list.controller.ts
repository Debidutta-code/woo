import { Request, Response } from 'express';
import { CustomerRequest, errorResponse } from '../../../../common/utils';
import { WishListService } from '../services';
import { ICWishlistR } from '../types';

export class WishListController {
    private wishListService: WishListService;

    constructor() {
        this.wishListService = new WishListService();
    }

    public async addToWishList(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const customerId = req.Customer!.id;
            const payload: ICWishlistR = {
                ...req.body,
                customerId,
            };
            const result = await this.wishListService.addToWishList(payload);
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to add to wish list', error.message));
            }
            return res.status(500).json(errorResponse('Failed to add to wish list', 'Unknown error'));
        }
    }

    public async getWishListById(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;
            const result = await this.wishListService.getWishListById(id);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to fetch wish list item', error.message));
            }
            return res.status(500).json(errorResponse('Failed to fetch wish list item', 'Unknown error'));
        }
    }

    public async getMyWishList(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const customerId = req.Customer!.id;
            const result = await this.wishListService.getWishListByCustomerId(customerId);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to fetch wish list', error.message));
            }
            return res.status(500).json(errorResponse('Failed to fetch wish list', 'Unknown error'));
        }
    }

    public async getWishListByProperty(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const { propertyId } = req.params;
            const result = await this.wishListService.getWishListByPropertyId(propertyId);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to fetch wish list', error.message));
            }
            return res.status(500).json(errorResponse('Failed to fetch wish list', 'Unknown error'));
        }
    }

    public async removeFromWishList(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;
            const result = await this.wishListService.removeFromWishList(id);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to remove from wish list', error.message));
            }
            return res.status(500).json(errorResponse('Failed to remove from wish list', 'Unknown error'));
        }
    }
}
