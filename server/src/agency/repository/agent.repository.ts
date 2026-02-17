import {prisma} from "../../config";
import { ICAgents,IAgents, IAgentsWA } from "../types";

export class AgentRepository{
    public async createAgent(data: ICAgents): Promise<IAgents> {
        try {
            return await prisma.agents.create({
                data
            });
        } catch (error) {
            throw new Error(`Failed to create agent`);
        }
    }

    public async getAgentById(id: string): Promise<IAgentsWA | null> {
        try {
            return await prisma.agents.findUnique({
                where: { id },
                include: {
                    agency: true
                }
            });
        } catch (error) {
            throw new Error(`Failed to get agent by ID: ${id}`);
        }
    }

    public async updateAgent(id: string, data: ICAgents): Promise<IAgents | null> {
        try {
            return await prisma.agents.update({
                where: { id },
                data
            });
        } catch (error) {
            throw new Error(`Failed to update agent: ${id}`);
        }
    }

    public async deleteAgent(id: string): Promise<IAgents | null> {
        try {
            return await prisma.agents.update({
                where: { id },
                data: { isDeleted: true }
            });
        } catch (error) {
            throw new Error(`Failed to delete agent: ${id}`);
        }
    }
}