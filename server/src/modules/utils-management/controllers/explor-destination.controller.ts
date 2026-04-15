import { Request, Response } from "express";
import { CustomerRequest,errorResponse } from "../../../common/utils";
import {ExplorDestinationService} from "../services/explor-destination.service";
import {ICExplorDestination,IExplorDestination} from "../types";

export class ExplorDestinationController {
    private explorDestinationService: ExplorDestinationService;
    constructor(
    ) {
        this.explorDestinationService = new ExplorDestinationService();
    }
    public async createExplorDestination(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const payload:ICExplorDestination = req.body;
            if(!payload.destinationName || payload.destinationName.trim() === ""){
                throw new Error("Destination name is required");
            }
            if(!payload.destinationImage || payload.destinationImage.trim() === ""){
                throw new Error("Destination image is required");
            }
            if(!payload.slNo || payload.slNo === 0){
                throw new Error("Serial number is required to create destination and cannot be 0");
            }
            const result = await this.explorDestinationService.createExplorDestination(payload);
            return res.status(result.success?200:400).json(result);
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to create destination",error.message));
            }
            return res.status(500).json(errorResponse("Failed to create destination","Unknown error occured"));
        }
    }
    public async getExplorDestinations(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const result = await this.explorDestinationService.getExplorDestinations();
                        return res.status(result.success?200:400).json(result);

        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to fetch destinations",error.message));
            }
            return res.status(500).json(errorResponse("Failed to fetch destinations","Unknown error occured"));
        }
    }
    public async updateExplorDestination(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const id = req.params.id;
            if(!id||id.trim()===""){
                return res.status(400).json(errorResponse("Select a destination to update"))
            }
            const result = await this.explorDestinationService.updateExplorDestination(id, req.body);
            return res.status(result.success?200:400).json(result);
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to update destination",error.message));
            }
            return res.status(500).json(errorResponse("Failed to update destination","Unknown error occured"));
        }
    }
    public async deleteExplorDestination(   
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const id = req.params.id;
            if(!id||id.trim()===""){
                return res.status(400).json(errorResponse("Select a destination to delete"))
            }
            const result = await this.explorDestinationService.deleteExplorDestination(id);
            return res.status(result.success?200:400).json(result);
        } catch (error) {
            if(error instanceof Error){
                return res.status(500).json(errorResponse("Failed to delete destination",error.message));
            }
            return res.status(500).json(errorResponse("Failed to delete destination","Unknown error occured"));
        }
    }
}