import { prisma } from '../../../config';
import { ICExplorDestination, IExplorDestination } from '../types';

export class ExplorDestinationRepository {
    public async createExplorDestination(
        data: ICExplorDestination
    ): Promise<IExplorDestination> {
        try {
            const result = await prisma.explorDestination.create({ data });
            return result;
        } catch (error) {
            throw new Error('Failed to create explor destination');
        }
    }
    public async getExplorDestinations(): Promise<IExplorDestination[]> {
        try {
            const result = await prisma.explorDestination.findMany({
                orderBy:{
                    slNo:"asc"
                }
            });
            return result;
        } catch (error) {
            throw new Error('Failed to get explor destinations');
        }
    }
    public async updateExplorDestination(
        id: string,
        data: ICExplorDestination
    ): Promise<IExplorDestination> {
        try {
            const result = await prisma.explorDestination.update({
                where: { id },
                data,
            });
            return result;
        } catch (error) {
            throw new Error('Failed to update explor destination');
        }
    }
    public async getDestinationFromName(destinationName:string):Promise<IExplorDestination|null>{
        try {
            const result = await prisma.explorDestination.findUnique({
                where: { destinationName },
            });
            return result;
        } catch (error) {
            throw new Error('Failed to get explor destination');
        }
    }
    public async getBySlNo(slNo:number):Promise<IExplorDestination|null>{
        try {
            const result = await prisma.explorDestination.findUnique({
                where: { slNo },
            });
            return result;
        } catch (error) {
            throw new Error('Failed to get explor destination');
        }
    }
    public async getById(id:string):Promise<IExplorDestination|null>{
        try {
            const result = await prisma.explorDestination.findUnique({
                where: { id },
            });
            return result;
        } catch (error) {
            throw new Error('Failed to get explor destination');
        }
    }
    public async deleteExplorDestination(
        id: string
    ): Promise<IExplorDestination> {
        try {
            const result = await prisma.explorDestination.delete({
                where: { id },
            });
            return result;
        } catch (error) {
            throw new Error('Failed to delete explor destination');
        }
    }

}
