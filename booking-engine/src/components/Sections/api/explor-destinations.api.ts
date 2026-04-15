import createAxiosInstance from "@/components/utils/axiosInstance";
import type { ICExplorDestination } from "../types";

const axiosInstance = createAxiosInstance();


export const getExplorDestinations = async () => {
  try {
    const response = await axiosInstance.get(
      "/extranet/utils-management/explor-destination",
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
