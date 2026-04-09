import { Request, Response } from 'express';
import { AvailabilityService } from '../service/availability.service';
import { errorResponse } from '../../../../common/utils';

export class AvailabilityController {
    private availabilityService: AvailabilityService;

    constructor() {
        this.availabilityService = new AvailabilityService();
        // ✅ Added binding to ensure 'this' context is preserved
        this.getHotelAvailability = this.getHotelAvailability.bind(this);
    }

    public async getHotelAvailability(req: Request, res: Response): Promise<Response> {
        try {
            const { hotelCode, checkIn, checkOut } = req.query;

            // Validate hotelCode
            if (!hotelCode || typeof hotelCode !== 'string') {
                return res.status(400).json(errorResponse('hotelCode is required and must be a string'));
            }

            // Validate checkIn date format if provided
            if (checkIn && typeof checkIn === 'string') {
                const checkInDate = new Date(checkIn);
                if (isNaN(checkInDate.getTime())) {
                    return res.status(400).json(errorResponse('Invalid checkIn date format. Use ISO date format (YYYY-MM-DD)'));
                }
            }

            // Validate checkOut date format if provided
            if (checkOut && typeof checkOut === 'string') {
                const checkOutDate = new Date(checkOut);
                if (isNaN(checkOutDate.getTime())) {
                    return res.status(400).json(errorResponse('Invalid checkOut date format. Use ISO date format (YYYY-MM-DD)'));
                }
            }

            // Validate checkOut is after checkIn if both provided
            if (checkIn && checkOut && typeof checkIn === 'string' && typeof checkOut === 'string') {
                const checkInDate = new Date(checkIn);
                const checkOutDate = new Date(checkOut);
                
                if (checkOutDate <= checkInDate) {
                    return res.status(400).json(errorResponse('checkOut must be after checkIn'));
                }
            }

            // ✅ Added service initialization check
            if (!this.availabilityService) {
                console.error('Controller - AvailabilityService not initialized');
                return res.status(500).json(errorResponse('Service configuration error'));
            }

            // Call service to get availability
            const result = await this.availabilityService.getHotelAvailability(
                hotelCode,
                checkIn as string,
                checkOut as string
            );

            if (!result.success) {
                return res.status(200).json(result);
            }

            // Return successful response with data
            return res.status(200).json({
                success: true,
                data: {
                    hotelCode: result.hotelCode,
                    totalDays: result.totalDays,
                    days: result.days,
                }
            });

        } catch (error) {
            console.error('Error in getHotelAvailability controller:', error);
            return res.status(500).json(errorResponse('Internal server error while fetching availability'));
        }
    }
}