// booking-engine/controllers/property.controller.ts

import { Request, Response } from 'express';
import { PropertyService } from '../service/property.service';
import { errorResponse, toUTCDate } from '../../../../common/utils';

export class PropertyController {
    private propertyService: PropertyService;

    constructor() {
        this.propertyService = new PropertyService();
    }

    public async getPropertyDetails(req: Request, res: Response): Promise<Response> {
        try {
            let { id, checkIn, checkOut, rooms, adults, children } = req.query;

            // ✅ Validate id (required)
            if (!id || typeof id !== 'string' || id.trim() === '') {
                return res.status(400).json(errorResponse('Property ID is required'));
            }

            // Validate UUID format
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id as string)) {
                return res.status(400).json(errorResponse('Invalid property ID format. Must be a valid UUID'));
            }

            // Default dates if not provided
            if (!checkIn) {
                const today = new Date();
                checkIn = today.toISOString().split('T')[0];
            }
            if (!checkOut) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                checkOut = tomorrow.toISOString().split('T')[0];
            }

            // Validate numbers
            if (adults && isNaN(Number(adults))) {
                return res.status(400).json(errorResponse('adults must be a valid number'));
            }
            if (children && isNaN(Number(children))) {
                return res.status(400).json(errorResponse('children must be a valid number'));
            }
            if (rooms && isNaN(Number(rooms))) {
                return res.status(400).json(errorResponse('rooms must be a valid number'));
            }

            // Parse dates
            const checkInDateObj = new Date(String(checkIn));
            const checkOutDateObj = new Date(String(checkOut));

            if (isNaN(checkInDateObj.getTime())) {
                return res.status(400).json(errorResponse('Invalid checkIn date'));
            }
            if (isNaN(checkOutDateObj.getTime())) {
                return res.status(400).json(errorResponse('Invalid checkOut date'));
            }

            const checkInDate = toUTCDate(checkInDateObj);
            const checkOutDate = toUTCDate(checkOutDateObj);

            if (checkOutDate <= checkInDate) {
                return res.status(400).json(errorResponse('checkOut must be after checkIn'));
            }

            const nights = Math.round(
                (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (nights < 1) {
                return res.status(400).json(errorResponse('Minimum stay is 1 night'));
            }

            // ✅ Call service with id
            const response = await this.propertyService.getPropertyDetails({
                propertyId: id as string,  // Pass id as propertyId to service
                checkIn: checkInDate,
                checkOut: checkOutDate,
                rooms: rooms ? Number(rooms) : 1,
                adults: adults ? Number(adults) : 1,
                children: children ? Number(children) : 0,
            });

            return res.status(response.success ? 200 : 404).json(response);

        } catch (error) {
            console.error('Property detail controller error:', error);
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Internal server error', error.message));
            }
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }
}