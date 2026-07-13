import { successResponse } from "../../utils";
import { PropertyDetailsDao } from "../repository";

export class PropertyDetailsService {
    private propertyDao: PropertyDetailsDao;
    constructor() {
        this.propertyDao = new PropertyDetailsDao();
    }
    public async getPropertyDetailsByCode(
        propertyCode: string
    ) {
        try {
            const propertyDetails = await this.propertyDao.getPropertyDetailsByCode(propertyCode);
            if (!propertyDetails) {
                return successResponse("Property details not found", null);
            }
            return successResponse("Property details fetched successfully", propertyDetails);
        } catch (error) {
            throw new Error("Failed to fetch property details");
        }
    }
}