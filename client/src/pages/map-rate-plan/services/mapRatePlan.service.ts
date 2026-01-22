import createAxiosInstance from "@/components/axiosInstance";
import type { ICreateCharges, IAdditionalGuestAmount, IBaseGuestAmounts, CreateMappingPayload } from "../types";
import {  getMultiRoomRentPrice } from "../api"
const axiosInstance = createAxiosInstance();



export const createMappingService = async (
    propertyId: string,
    data: ICreateCharges,
    ratePlanName: string,
    roomTypeName: string
) => {
    try {
        // Transform the data to match backend expectations
        const payload: CreateMappingPayload = {
            ratePlanCode: data.ratePlanCode,
            ratePlanName: ratePlanName,
            roomTypeCode: data.roomTypeCode,
            roomTypeName: roomTypeName,
            baseByGuestAmounts: data.baseByGuestAmounts.map((item) => ({
                numberOfGuests: item.numberOfGuests,
                amountBeforeTax: item.amountBeforeTax,
            })),
            additionalGuestAmounts: data.additionalGuestAmounts.map((item) => ({
                ageQualifyingCode: item.ageQualifyingCode,
                amount: item.amount,
            })),
            currencyCode: data.currencyCode,
            startDate: data.startDate,
            endDate: data.endDate,
        };

        const response = await axiosInstance.put(
            `/ari/inventory/map/rateplan/${propertyId}`,
            payload
        );

        return response.data;
    } catch (error: any) {
        console.error("Error creating mapping:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to create mapping",
            error: error.message,
        };
    }
};

export const getMappedRatePlansService = async (
    propertyId: string,
    filters: {
        ratePlanCode?: string;
        roomTypeCode?: string;
        startDate?: string;
        endDate?: string;
    },
    page: number = 1 // Add page parameter with default
) => {
    try {
        const response = await axiosInstance.post(
            `/ari/inventory/get-mapped/rateplan?page=${page}`,
            {
                propertyId,
                ...filters,
            }
        );

        return response.data;
    } catch (error: any) {
        console.error("Error fetching mapped rate plans:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch mapped rate plans",
            error: error.message,
        };
    }
};

export const updateMappedPriceService = async (
    chargeId: string,
    baseGuestAmounts: IBaseGuestAmounts[],
    additionalGuestAmounts: IAdditionalGuestAmount[],
) => {
    try {
        const response = await axiosInstance.patch(
            `/ari/inventory/update/price`,
            {
                id: chargeId,
                baseGuestAmounts: baseGuestAmounts,
                additionalGuestAmounts: additionalGuestAmounts,
            }
        );

        return response.data;
    } catch (error: any) {
        console.error("Error updating price:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to update price",
            error: error.message,
        };
    }
};

export const deleteMappingService = async (chargeId: string) => {
    try {
        const response = await axiosInstance.delete(
            `/ari/rate-plan/delete-charges/${chargeId}`
        );

        return response.data;
    } catch (error: any) {
        console.error("Error deleting mapping:", error);
        return {
            success: false,
            message: error.response?.data?.message || "Failed to delete mapping",
            error: error.message,
        };
    }
};

export const getMultiRoomRentPriceService = async (
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
        console.log("Serv called")
        const response = await getMultiRoomRentPrice(propertyId, rooms);
        return response;
    } catch (error: any) {
        console.error("Error in getMultiRoomRentPriceService:", error);
        return {
            success: false,
            message: error?.message || "Failed to calculate multi-room prices",
        };
    }
};