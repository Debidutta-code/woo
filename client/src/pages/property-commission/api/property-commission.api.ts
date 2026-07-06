import createAxiosInstance from "@/components/axiosInstance";
import type { ICPropertyCommission, IUPropertyCommission, ICommissionCalculate } from "../interfaces/property-commission.type";

const axiosInstance = createAxiosInstance();

export const createPropertyCommission = async (data: ICPropertyCommission) => {
    try {
        const response = await axiosInstance.post("/property-commission", data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: error?.message,
        };
    }
};

export const getPropertyCommission = async (propertyId: string) => {
    try {
        const response = await axiosInstance.get(`/property-commission/${propertyId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: error?.message,
        };
    }
};

export const updatePropertyCommission = async (propertyId: string, data: IUPropertyCommission) => {
    try {
        const response = await axiosInstance.put(`/property-commission/${propertyId}`, data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: error?.message,
        };
    }
};

export const deletePropertyCommission = async (propertyId: string) => {
    try {
        const response = await axiosInstance.delete(`/property-commission/${propertyId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: error?.message,
        };
    }
};

export const calculateCommission = async (propertyId: string, data: ICommissionCalculate) => {
    try {
        const response = await axiosInstance.post(`/property-commission/${propertyId}/calculate`, data);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: error?.message,
        };
    }
};