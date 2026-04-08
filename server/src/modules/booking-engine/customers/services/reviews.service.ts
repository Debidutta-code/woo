import { IApiResponse, successResponse, errorResponse } from "../../../../common/utils";
import { ReviewRepository } from "../repositories";
import { ICReviewsR } from "../types";

export class ReviewService {
    private reviewRepository: ReviewRepository;

    constructor() {
        this.reviewRepository = new ReviewRepository();
    }

    public async createReview(data: ICReviewsR): Promise<IApiResponse> {
        try {
            const review = await this.reviewRepository.createReview(data);
            return successResponse("Review created successfully", review);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to create review", error.message);
            }
            return errorResponse("Failed to create review", "Unknown error occurred");
        }
    }

    public async getReviewById(id: string): Promise<IApiResponse> {
        try {
            const review = await this.reviewRepository.getReviewById(id);
            if (!review) {
                return errorResponse("Review not found");
            }
            return successResponse("Review fetched successfully", review);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch review", error.message);
            }
            return errorResponse("Failed to fetch review", "Unknown error occurred");
        }
    }

    public async updateReview(id: string, data: ICReviewsR): Promise<IApiResponse> {
        try {
            const existing = await this.reviewRepository.getReviewById(id);
            if (!existing) {
                return errorResponse("Review not found");
            }
            const updated = await this.reviewRepository.updateReview(id, data);
            return successResponse("Review updated successfully", updated);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to update review", error.message);
            }
            return errorResponse("Failed to update review", "Unknown error occurred");
        }
    }

    public async deleteReview(id: string): Promise<IApiResponse> {
        try {
            const existing = await this.reviewRepository.getReviewById(id);
            if (!existing) {
                return errorResponse("Review not found");
            }
            const deleted = await this.reviewRepository.deleteReview(id);
            return successResponse("Review deleted successfully", deleted);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to delete review", error.message);
            }
            return errorResponse("Failed to delete review", "Unknown error occurred");
        }
    }

    public async getReviewsForCustomer(customerId: string): Promise<IApiResponse> {
        try {
            const reviews = await this.reviewRepository.getReviewsForCustomer(customerId);
            return successResponse("Reviews fetched successfully", reviews);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch reviews", error.message);
            }
            return errorResponse("Failed to fetch reviews", "Unknown error occurred");
        }
    }

    public async getReviewsForProperty(propertyId: string): Promise<IApiResponse> {
        try {
            const reviews = await this.reviewRepository.getReviewsForProperty(propertyId);
            return successResponse("Reviews fetched successfully", reviews);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch reviews", error.message);
            }
            return errorResponse("Failed to fetch reviews", "Unknown error occurred");
        }
    }
}
