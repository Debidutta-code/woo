import { CustomRequest } from "../../utils/customRequest";
import { ErrorResponse } from "../../utils/errormessage.utill";
import { Response } from "express";
import {
    CTAandCTDService
} from "../services";
import { errorResponse } from "../../utils/return";
export class CtaCtdController {
    private ctaAndCTDService: CTAandCTDService;

    constructor() {
        this.ctaAndCTDService = new CTAandCTDService();
    }
    public async createCTA(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { dates, propertyId, roomTypeCode, ratePlanCode } = req.body;
            if (!dates || !propertyId) {
                return res.status(400).json(errorResponse("All fields are required"));
            }
            if (dates.length === 0) {
                return res.status(400).json(errorResponse("Dates array is required"));
            }
            if (!roomTypeCode && !ratePlanCode) {
                return res.status(400).json(errorResponse("At least one of roomTypeCode or ratePlanCode is required"));
            }
            const response = await this.ctaAndCTDService.createCTAService(dates, propertyId, roomTypeCode, ratePlanCode);
            return res.status(response.success ? 201 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create CTA", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async createCTD(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { dates, propertyId, roomTypeCode, ratePlanCode } = req.body;
            if (!dates || !propertyId) {
                return res.status(400).json(errorResponse("All fields are required"));
            }
            if (dates.length === 0) {
                return res.status(400).json(errorResponse("Dates array is required"));
            }
            if (!roomTypeCode && !ratePlanCode) {
                return res.status(400).json(errorResponse("At least one of roomTypeCode or ratePlanCode is required"));
            }
            const response = await this.ctaAndCTDService.createCTDService(dates, propertyId, roomTypeCode, ratePlanCode);
            return res.status(response.success ? 201 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create CTA", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async removeCTD(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { dates, propertyId, roomTypeCode, ratePlanCode } = req.body;
            if (!dates || !propertyId) {
                return res.status(400).json(errorResponse("All fields are required"));
            }
            if (dates.length === 0) {
                return res.status(400).json(errorResponse("Dates array is required"));
            }
            if (!roomTypeCode && !ratePlanCode) {
                return res.status(400).json(errorResponse("At least one of roomTypeCode or ratePlanCode is required"));
            }
            const response = await this.ctaAndCTDService.removeCTDService(dates, propertyId, roomTypeCode, ratePlanCode);
            return res.status(response.success ? 201 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create CTA", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
        public async removeCTA(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { dates, propertyId, roomTypeCode, ratePlanCode } = req.body;
            if (!dates || !propertyId) {
                return res.status(400).json(errorResponse("All fields are required"));
            }
            if (dates.length === 0) {
                return res.status(400).json(errorResponse("Dates array is required"));
            }
            if (!roomTypeCode && !ratePlanCode) {
                return res.status(400).json(errorResponse("At least one of roomTypeCode or ratePlanCode is required"));
            }
            const response = await this.ctaAndCTDService.removeCTAService(dates, propertyId, roomTypeCode, ratePlanCode);
            return res.status(response.success ? 201 : 400).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to create CTA", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
    public async getCTACTDStatus(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { propertyId } = req.params;
            if (!propertyId) {
                return res.status(400).json(errorResponse("Property ID is required"));
            }
            const response = await this.ctaAndCTDService.getCtaAndCtdService(propertyId);
            return res.status(response.success ? 200 : 404).json(response);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse("Failed to retrieve CTA and CTD status", error.message));
            }
            return res.status(500).json(errorResponse("Internal Server Error"));
        }
    }
}
