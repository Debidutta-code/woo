import {prisma} from "../../config";
import { errorResponse, successResponse } from "../../utils/return";
import { IApiResponse } from "../../utils/return.types";

export const getRoomType = async (roomId: string): Promise<IApiResponse> => {
    try {
        const room = await prisma.room.findUnique({
            where: {
                id: roomId
            }
        });
        if (!room) {
            return errorResponse("Room not found");
        }
        return successResponse("Room retrieved successfully", room);
    } catch (error) {
        if (error instanceof Error) {
            return errorResponse("Failed to retrieve room", error.message);
        }
        return errorResponse("Failed to retrieve room");
    }
};