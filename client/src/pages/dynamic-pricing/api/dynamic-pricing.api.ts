import createAxiosInstance from "@/components/axiosInstance";
const axiosInstance=createAxiosInstance();


export const getDynamicPricingApi=async(propertyId:string)=>{
    try {
        const response = await axiosInstance.get(`/dynamic-pricing/${propertyId}`);
        return response.data;
    } catch (error: any) {
        if (error?.response?.data) {
            return error.response.data
        } else {
            return {
                success: false,
                message: error?.message
            }
        }
    }
}