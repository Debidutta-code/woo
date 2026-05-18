import { IApiResponse, successResponse, errorResponse } from "../../../../common/utils";
import { ReviewRepository } from "../repositories";
import { ICReviewsR } from "../types";

export class ReviewService {
    private reviewRepository: ReviewRepository;

    constructor() {
        this.reviewRepository = new ReviewRepository();
    }

    public async createReview(data: ICReviewsR & { [key: string]: any }): Promise<IApiResponse> {
        try {
            const reservationId = data?.reservationId as string | undefined;
            let normalizedData: ICReviewsR = {
                propertyId: data.propertyId,
                propertyCode: data.propertyCode,
                propertyName: data.propertyName,
                customerId: data.customerId,
                rating: data.rating,
                review: data.review,
            };

            // Support legacy frontend payload:
            // { reservationId, hotelCode, hotelName, userId, comment, rating }
            if (
                (!normalizedData.propertyId || !normalizedData.customerId || !normalizedData.propertyCode) &&
                reservationId
            ) {
                const reservation = await this.reviewRepository.getReservationForReview(reservationId);
                if (!reservation) {
                    return errorResponse("Reservation not found");
                }

                normalizedData = {
                    propertyId: reservation.propertyId,
                    propertyCode: reservation.propertyCode || data.hotelCode || '',
                    propertyName: reservation.hotelName || reservation.property?.propertyName || data.hotelName || '',
                    customerId: reservation.customerId || data.userId,
                    rating: data.rating,
                    review: data.review || data.comment || '',
                };
            } else {
                normalizedData = {
                    ...normalizedData,
                    review: data.review || data.comment || '',
                    propertyCode: normalizedData.propertyCode || data.hotelCode || '',
                    propertyName: normalizedData.propertyName || data.hotelName || '',
                    customerId: normalizedData.customerId || data.userId,
                };
            }

            if (
                !normalizedData.propertyId ||
                !normalizedData.propertyCode ||
                !normalizedData.propertyName ||
                !normalizedData.customerId ||
                !normalizedData.review ||
                typeof normalizedData.rating !== 'number'
            ) {
                return errorResponse("Missing required review fields");
            }

            const review = await this.reviewRepository.createReview(normalizedData);
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
            const normalized = (reviews as any[]).map((review) => ({
                ...review,
                _id: review.id,
                comment: review.review,
                guestEmail: review?.Customer?.email || '',
            }));
            return successResponse("Reviews fetched successfully", normalized);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch reviews", error.message);
            }
            return errorResponse("Failed to fetch reviews", "Unknown error occurred");
        }
    }

    public async getReviewByReservationId(reservationId: string): Promise<IApiResponse> {
        try {
            const review = await this.reviewRepository.getReviewById(reservationId);
            if (!review) {
                return successResponse("No review found for reservation", { customerReview: [] });
            }

            return successResponse("Review fetched successfully", { customerReview: [review] });
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch review", error.message);
            }
            return errorResponse("Failed to fetch review", "Unknown error occurred");
        }
    }

    public async getReservationForReview(reservationId: string): Promise<IApiResponse> {
        try {
            const reservation = await this.reviewRepository.getReservationForReview(reservationId);
            if (!reservation) {
                return errorResponse("Reservation not found");
            }

            const payload = {
                reservationId: reservation.id,
                hotelCode: reservation.propertyCode || '',
                hotelName: reservation.hotelName || reservation.property?.propertyName || '',
                userId: reservation.customerId,
                email: reservation.bookingUserEmail,
            };

            return successResponse("Reservation details fetched successfully", payload);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to fetch reservation details", error.message);
            }
            return errorResponse("Failed to fetch reservation details", "Unknown error occurred");
        }
    }
}
