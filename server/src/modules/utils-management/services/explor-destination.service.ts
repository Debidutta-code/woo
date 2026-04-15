import { IApiResponse,successResponse,errorResponse } from "../../../common/utils";
import {ExplorDestinationRepository} from "../repository/explor-destination.repository";
import {ICExplorDestination,IExplorDestination} from "../types";

export class ExplorDestinationService {
    private explorDestinationRepository: ExplorDestinationRepository;
    constructor(
    ) {
        this.explorDestinationRepository = new ExplorDestinationRepository();
    }
    public async createExplorDestination(
        data: ICExplorDestination
    ): Promise<IApiResponse<IExplorDestination>> {
        try {
            const [existByCity,existBySlNo] = await Promise.all([
                this.explorDestinationRepository.getDestinationFromName(data.destinationName),
                this.explorDestinationRepository.getBySlNo(data.slNo)
            ])
            if(existByCity){
                throw new Error("Destination name already exists");
            }
            if(existBySlNo){
                throw new Error("Sl no already exists");
            }
            const result = await this.explorDestinationRepository.createExplorDestination(data);
            return successResponse("Destination created successfully");
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to create destination",error.message);
            }
            return errorResponse("Failed to create destination","Unknown error occured");
        }
    }
    public async getExplorDestinations(): Promise<IApiResponse<IExplorDestination[]>> {
        try {
            const result = await this.explorDestinationRepository.getExplorDestinations();
            return successResponse("Destinations fetched successfully",result);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to fetch destinations",error.message);
            }
            return errorResponse("Failed to fetch destinations","Unknown error occured");
        }
    }
    public async updateExplorDestination(
        id: string,
        data: ICExplorDestination
    ): Promise<IApiResponse<IExplorDestination>> {
        try {
            const [getById,getByCity,getBySlNo] = await Promise.all([
                this.explorDestinationRepository.getById(id),
                this.explorDestinationRepository.getDestinationFromName(data.destinationName),
                this.explorDestinationRepository.getBySlNo(data.slNo)
            ])
            if(!getById){
                throw new Error("Destination not found");
            }
            if(getByCity && getByCity.id !== id){
                throw new Error("Destination name already exists");
            }
            if(getBySlNo && getBySlNo.id !== id){
                throw new Error("Sl no already exists");
            }
            const result = await this.explorDestinationRepository.updateExplorDestination(id, data);
            return successResponse("Destination updated successfully",result);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to update destination",error.message);
            }
            return errorResponse("Failed to update destination","Unknown error occured");
        }
    }
    public async deleteExplorDestination(
        id: string
    ): Promise<IApiResponse<IExplorDestination>> {
        try {
            const getById = await this.explorDestinationRepository.getById(id);
            if(!getById){
                throw new Error("Destination not found");
            }
            const result = await this.explorDestinationRepository.deleteExplorDestination(id);
            return successResponse("Destination deleted successfully",result);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to delete destination",error.message);
            }
            return errorResponse("Failed to delete destination","Unknown error occured");
        }
    }
}