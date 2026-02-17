import { successResponse, errorResponse } from "../../utils/return";
import { IApiResponse } from "../../utils/return.types";
import { AgenticRoomRepository, AgenticPropertyRepository } from "../repository"
import { ICAgenticRoom } from "../types";
export class AgenticRoomService {
    private agenticRoomRepository: AgenticRoomRepository;
    private agenticPropertyRepository: AgenticPropertyRepository;

    constructor() {
        this.agenticRoomRepository = new AgenticRoomRepository();
        this.agenticPropertyRepository = new AgenticPropertyRepository();
    }
    public async createAgenticRoom(data: ICAgenticRoom): Promise<IApiResponse> {
        try {
            const agenticProperty = await this.agenticPropertyRepository.getAgenticPropertyById(data.agenticPropertyId);
            if (!agenticProperty) {
                return errorResponse("Agentic property not found");
            }
            if (!agenticProperty.isActive) {
                return errorResponse("Agentic property is not active");
            }
            if (agenticProperty.isDeleted) {
                return errorResponse("Agentic property is not available");
            }
            if(agenticProperty.AgenticRooms.length === 0) {
                return errorResponse("Agentic property has no available rooms");
            }
            if(agenticProperty.AgenticRooms.some(room => room.roomType === data.roomType && !room.isDeleted)) {
                return errorResponse("Room already exists");
            }

            const result = await this.agenticRoomRepository.createRoom(data);
            return successResponse("Added rooms for Agencies");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to add rooms to Agencies");
            }
            return errorResponse("Unknown error");
        }
    }
    public async removeAgenticRoom(id: string): Promise<IApiResponse> {
        try {
            const agenticRoom = await this.agenticRoomRepository.getRoomById(id);
            if (!agenticRoom) {
                return errorResponse("Room not found");
            }
            if (agenticRoom.isDeleted) {
                return errorResponse("Room is not allocated to the agencies");
            }
            const result = await this.agenticRoomRepository.deleteRoom(id);
            return successResponse("Removed rooms for Agencies", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to remove rooms from Agencies");
            }
            return errorResponse("Unknown error");
        }
    }
    public async updateAgenticRoomAvailability(id: string, isAvailable: boolean): Promise<IApiResponse> {
        try {
            const agenticRoom = await this.agenticRoomRepository.getRoomById(id);
            if (!agenticRoom) {
                return errorResponse("Room not found");
            }
            if (agenticRoom.isDeleted) {
                return errorResponse("Room is not allocated to the agencies");
            }
            const result = await this.agenticRoomRepository.updateRoomAvailability(id, isAvailable);
            return successResponse("Updated room availability", result);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse("Failed to update room availability");
            }
            return errorResponse("Unknown error");
        }
    }
}