import createAxiosInstance from "@/components/axiosInstance";
import type { ICSeasonalDynamicPricing, ISeasonalDynamicPricingS } from "../interface";

const axiosInstance = createAxiosInstance();

export const createSeasonalPricingApi = async (propertyId: string, seasonalData: ISeasonalDynamicPricingS) => {
    try {
        const response = await axiosInstance.post(`/dynamic-pricing/seasonal/create/${propertyId}`, seasonalData);
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

export const getSeasonalPricingApi = async (roomId: string) => {
    try {
        const response = await axiosInstance.get(`/dynamic-pricing/seasonal/by-room/${roomId}`);
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

export const updateSeasonalPricingApi = async (id: string, seasonalData: ICSeasonalDynamicPricing) => {
    try {
        const response = await axiosInstance.put(`/dynamic-pricing/seasonal/update/${id}`, seasonalData);
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

export const deleteSeasonalPricingApi = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/dynamic-pricing/seasonal/delete/${id}`);
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