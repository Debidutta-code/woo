import createAxiosInstance from "@/components/axiosInstance";
import type { ICWeekendDynamicPricing, ICWeekendDynamicPricingS } from "../interface";

const axiosInstance = createAxiosInstance();

export const createWeekendPricingApi = async (propertyId: string, weekendData: ICWeekendDynamicPricingS) => {
    try {
        const response = await axiosInstance.post(`/dynamic-pricing/weekend/create/${propertyId}`, weekendData);
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

export const getWeekendPricingApi = async (roomId: string) => {
    try {
        const response = await axiosInstance.get(`/dynamic-pricing/weekend/by-room/${roomId}`);
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

export const updateWeekendPricingApi = async (id: string, weekendData: ICWeekendDynamicPricing) => {
    try {
        const response = await axiosInstance.put(`/dynamic-pricing/weekend/update/${id}`, weekendData);
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

export const deleteWeekendPricingApi = async (id: string) => {
    try {
        const response = await axiosInstance.delete(`/dynamic-pricing/weekend/delete/${id}`);
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