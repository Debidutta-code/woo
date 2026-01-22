import createAxiosInstance from "../axiosInstance";
import type {INewGBP} from "@/pages/property/types/types"
export const createEntity=async(payload:INewGBP)=>{
try {
    const axiosInstance=createAxiosInstance()
    const response=await axiosInstance.post("/create",payload);
    return response.data
} catch (error: any) {
        if (error?.response?.data) {
            return error.response.data;
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}