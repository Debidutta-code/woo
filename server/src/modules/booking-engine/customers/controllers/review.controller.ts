import { Request, Response } from 'express';
import { CustomerRequest, errorResponse } from '../../../../common/utils';
import { ReviewService } from '../services';
import { ICReviewsR } from '../types';

export class ReviewController {
    private reviewService: ReviewService;

    constructor() {
        this.reviewService = new ReviewService();
    }

    public async createReview(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const customerId = req.Customer?.id;
            const payload: ICReviewsR & { [key: string]: any } = {
                ...req.body,
                ...(customerId ? { customerId } : {}),
            };
            const result = await this.reviewService.createReview(payload);
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to create review', error.message));
            }
            return res.status(500).json(errorResponse('Failed to create review', 'Unknown error'));
        }
    }

    public async getReviewById(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;
            const result = await this.reviewService.getReviewById(id);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to fetch review', error.message));
            }
            return res.status(500).json(errorResponse('Failed to fetch review', 'Unknown error'));
        }
    }

    public async getReviewByReservation(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const reservationId = req.query.reservationId as string;
            if (!reservationId) {
                return res.status(400).json(errorResponse('reservationId is required'));
            }

            const result = await this.reviewService.getReviewByReservationId(reservationId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to fetch review', error.message));
            }
            return res.status(500).json(errorResponse('Failed to fetch review', 'Unknown error'));
        }
    }

    public async getReservationForReview(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const reservationId = req.query.reservationId as string;
            if (!reservationId) {
                return res.status(400).json(errorResponse('reservationId is required'));
            }

            const result = await this.reviewService.getReservationForReview(reservationId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to fetch reservation details', error.message));
            }
            return res.status(500).json(errorResponse('Failed to fetch reservation details', 'Unknown error'));
        }
    }

    public async updateReview(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;
            const payload: ICReviewsR = {
                ...req.body,
                customerId: req.Customer!.id,
            };
            const result = await this.reviewService.updateReview(id, payload);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to update review', error.message));
            }
            return res.status(500).json(errorResponse('Failed to update review', 'Unknown error'));
        }
    }

    public async deleteReview(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { id } = req.params;
            const result = await this.reviewService.deleteReview(id);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to delete review', error.message));
            }
            return res.status(500).json(errorResponse('Failed to delete review', 'Unknown error'));
        }
    }

    public async getMyReviews(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const customerId = req.Customer!.id;
            const result = await this.reviewService.getReviewsForCustomer(customerId);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to fetch reviews', error.message));
            }
            return res.status(500).json(errorResponse('Failed to fetch reviews', 'Unknown error'));
        }
    }

    public async getReviewsByProperty(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const { propertyId } = req.params;
            const result = await this.reviewService.getReviewsForProperty(propertyId);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to fetch reviews', error.message));
            }
            return res.status(500).json(errorResponse('Failed to fetch reviews', 'Unknown error'));
        }
    }
}
