import createAxiosInstance from "@/components/utils/axiosInstance";
import { ICCustomerS } from "../types";

const axiosInstance = createAxiosInstance();

export const registerApi = async (data: ICCustomerS) => {
  try {
    const response = await axiosInstance.post(
      "/booking-engine/customer/register",
      data,
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data;
    } else {
      return {
        success: false,
        message: error?.message,
      };
    }
  }
};
