import { CustomRequest } from '../../utils/customRequest';
import { Response } from 'express';
import { RoomRentCalculationService } from '../services';
import { errorResponse } from '../../utils/return';
export class RoomRentCalculationController {
    public static async getRoomRentController(
        req: CustomRequest,
        res: Response
    ): Promise<Response> {
        try {
            const { propertyId, rooms } = req.body;

            // Validate input
            if (!propertyId) {
                return res.status(400).json({
                    success: false,
                    message: 'Property ID is required',
                });
            }

            if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one room configuration is required',
                });
            }
            const parsedRooms = rooms.map((room: any) => ({
                ...room,
                startDate: new Date(room.startDate),
                endDate: new Date(room.endDate),
            }));

            // Calculate rates
            const result =
                await RoomRentCalculationService.getMultiRoomRentService({
                    propertyId,
                    rooms: parsedRooms,
                });

            if (!result.success) {
                return res.status(400).json(result);
            }
            return res.status(200).json(result);
        } catch (error: any) {
            console.error('Error in getRoomRentController:', error);
            return res
                .status(500)
                .json(errorResponse('Internal server error', error?.message));
        }
    }
}
