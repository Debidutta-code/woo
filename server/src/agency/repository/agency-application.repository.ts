import {prisma} from "../../config";
import { AgencyApplicationStatus, IAgencyApplication } from "../types";


export class AgencyApplicationRepository {

    public async createApplication(data: IAgencyApplication): Promise<IAgencyApplication> {
        try {
            
            const application = await prisma.agentApplications.create({
                data
            });
            return application;
        } catch (error) {
            throw new Error(`Failed to create agency application`);
        }
    }
    public async getApplicationById(id: string): Promise<IAgencyApplication | null> {
        try {
            const application = await prisma.agentApplications.findUnique({
                where: { id }
            });
            return application;
        } catch (error) {
            throw new Error(`Failed to retrieve agency application`);
        }
    }
    public async getApplications(status: AgencyApplicationStatus, skip: number=0, take: number=10): Promise<IAgencyApplication[]> {
        try {
            const query: any = {};
            if (status) {
                query.status = status;
            }
            const applications = await prisma.agentApplications.findMany({
                where: query,
                skip,
                take
            });
            return applications;
        } catch (error) {
            throw new Error(`Failed to retrieve agency applications`);
        }
    }
    public async updateApplocationStatus(applicationId:string,newStatus:AgencyApplicationStatus):Promise<IAgencyApplication>{
        try {
            const updatedApplication = await prisma.agentApplications.update({
                where: { id: applicationId },
                data: { status: newStatus }
            });
            return updatedApplication;
        } catch (error) {
            throw new Error(`Failed to update agency application status`);
        }
    }
    public async lastAppliedCountByEmail(email: string): Promise<number> {
        try {
            const count = await prisma.agentApplications.findFirst({
                where: { applicantEmail: email }
            });
            if(!count){
                return 0;
            }
            return count?.applicationNoForThisUser;
        } catch (error) {
            throw new Error(`Failed to retrieve last applied count by email`);
        }
    }
}