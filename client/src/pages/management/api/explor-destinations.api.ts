import createAxiosInstance from "@/components/axiosInstance";
import type { ICExplorDestination } from "../types";

const axiosInstance = createAxiosInstance();

export const createExplorDestination = async (data: ICExplorDestination) => {
  try {
    const response = await axiosInstance.post(
      "/utils-management/explor-destination",
      data,
    );
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

export const getExplorDestinations = async () => {
  try {
    const response = await axiosInstance.get(
      "/utils-management/explor-destination",
    );
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};

export const updateExplorDestination = async (
  id: string,
  data: ICExplorDestination,
) => {
  try {
    const response = await axiosInstance.patch(
      `/utils-management/explor-destination/${id}`,
      data,
    );
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};
export const deleteExplorDestination = async (id: string) => {
  try {
    const response = await axiosInstance.delete(
      `/utils-management/explor-destination/${id}`,
    );
    return response.data;
  } catch (error: any) {
    if (!error?.response?.data?.success) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};
