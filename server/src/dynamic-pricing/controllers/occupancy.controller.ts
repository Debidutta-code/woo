import { CustomRequest } from "../../utils";
import { Response } from "express";
import { IApiResponse,errorResponse } from "../../utils";
import {OccupancyBasedDynamicPricingService} from "../services";

export class OccupancyController {
    private occupancyService: OccupancyBasedDynamicPricingService;

    constructor() {
        this.occupancyService = new OccupancyBasedDynamicPricingService();
    }
    
}