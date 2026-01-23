import { IApiResponse } from "../../utils/return.types";
import { successResponse,errorResponse } from "../../utils/return";
import {CTAandCTDRepository} from "../repository";
import {getPropertyDetails} from "../utils";
export class CTAandCTDService {
    private ctaAndCTDRepository: CTAandCTDRepository;

    constructor() {
        this.ctaAndCTDRepository = new CTAandCTDRepository();
    }
    public async createCTAService(dates:Date[], propertyId: string, roomTypeCode?: string, ratePlanCode?: string):Promise<IApiResponse>{
        try {
            const property=await getPropertyDetails(propertyId);
            if(!property){
                return errorResponse("Property not found");
            }
            const result = await this.ctaAndCTDRepository.addCTA({ dates, propertyCode: property.propertyCode, roomTypeCode, ratePlanCode });
            return successResponse("CTA created successfully", result);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to create CTA",error.message);
            }
            return errorResponse("Failed to create CTA","Unknown error");
        }
    }
        public async createCTDService(dates:Date[], propertyId: string, roomTypeCode?: string, ratePlanCode?: string):Promise<IApiResponse>{
        try {
            const property=await getPropertyDetails(propertyId);
            if(!property){
                return errorResponse("Property not found");
            }
            const result = await this.ctaAndCTDRepository.addCTD({ dates, propertyCode: property.propertyCode, roomTypeCode, ratePlanCode });
            return successResponse("CTD created successfully", result);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to create CTD",error.message);
            }
            return errorResponse("Failed to create CTD","Unknown error");
        }
        
    }
        public async removeCTAService(dates:Date[], propertyId: string, roomTypeCode?: string, ratePlanCode?: string):Promise<IApiResponse>{
        try {
            const property=await getPropertyDetails(propertyId);
            if(!property){
                return errorResponse("Property not found");
            }
            const result = await this.ctaAndCTDRepository.closeCTA({ dates, propertyCode: property.propertyCode, roomTypeCode, ratePlanCode });
            return successResponse("CTA removed successfully", result);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to remove CTA",error.message);
            }
            return errorResponse("Failed to remove CTA","Unknown error");
        }
    }
        public async removeCTDService(dates:Date[], propertyId: string, roomTypeCode?: string, ratePlanCode?: string):Promise<IApiResponse>{
        try {
            const property=await getPropertyDetails(propertyId);
            if(!property){
                return errorResponse("Property not found");
            }
            const result = await this.ctaAndCTDRepository.closeCTD({ dates, propertyCode: property.propertyCode, roomTypeCode, ratePlanCode });
            return successResponse("CTD removed successfully", result);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to remove CTD",error.message);
            }
            return errorResponse("Failed to remove CTD","Unknown error");
        }
        
    }
    public async getCtaAndCtdService(propertyId: string):Promise<IApiResponse>{
        try {
            const property=await getPropertyDetails(propertyId);
            if(!property){
                return errorResponse("Property not found");
            }
            const result = await this.ctaAndCTDRepository.getCtaAndCtd(property.propertyCode);
            return successResponse("CTA and CTD retrieved successfully", result);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to retrieve CTA and CTD",error.message);
            }
            return errorResponse("Failed to retrieve CTA and CTD","Unknown error");
        }
    }
}