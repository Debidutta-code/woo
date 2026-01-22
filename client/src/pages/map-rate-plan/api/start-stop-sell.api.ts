import createAxiosInstance from "@/components/axiosInstance";
import type { ICStartStopSell } from "../types";

const axiosInstance = createAxiosInstance();

export const startStopSellAPI = async (propertyId: string, data: ICStartStopSell) => {
    try {
        const response = await axiosInstance.patch(`/ari/start-stop-sell/${propertyId}`, data);
        return response.data;
    } catch (error: any) {
        if (error.response.data) {
            return error.response.data;
        }
        else {
            return { message: 'An unexpected error occurred', success: false };
        }
    }
}



export const getMultiRoomRentPrice = async (
    propertyId: string,
    rooms: {
        ratePlanCode: string;
        invTypeCode: string;
        startDate: Date;
        endDate: Date;
        noOfChildren: number;
        noOfAdults: number;
        noOfRooms: number;
    }[]
) => {
    try {
        const response = await axiosInstance.post(`/ari/price/get-price`, {
            propertyId,
            rooms,
        });
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return { message: 'Failed to get multi-room rent price', success: false };
        }
    }
}