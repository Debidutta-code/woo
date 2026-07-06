import createAxiosInstance from "@/components/axiosInstance";
import type { ICOccupancyBasedDynamicPricing, ICOccupancyBasedDynamicPricingS } from "../interface";

const axiosInstance = createAxiosInstance();

export const createOccupancyApi = async (propertyId: string, occupancyData: ICOccupancyBasedDynamicPricingS) => {
    try {
        const response = await axiosInstance.post(`/dynamic-pricing/occupancy/create/${propertyId}`, occupancyData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};

export const getOccupancyByRoomApi = async (roomId: string) => {
    try {
        const response = await axiosInstance.get(`/dynamic-pricing/occupancy/by-room/${roomId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};

export const updateOccupancyApi = async (id: string, occupancyData: ICOccupancyBasedDynamicPricing) => {
    try {
        const response = await axiosInstance.put(`/dynamic-pricing/occupancy/update/${id}`, occupancyData);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};

export const deleteOccupancyApi = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/dynamic-pricing/occupancy/delete/${id}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            };
        }
    }
};