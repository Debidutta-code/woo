import { Request, Response } from 'express';
import { SearchService } from '../service';
import { errorResponse } from '../../../../common/utils';

export class SearchController {
    private searchService: SearchService;

    constructor() {
        this.searchService = new SearchService();
    }

    public async searchProperties(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const result = await this.searchService.searchProperties(req.query);

            return res.status(200).json(result);
        } catch (error) {
            console.error('Search error:', error);
            return res.status(500).json(errorResponse('Internal server error'));
        }
    }

    public async getUniqueCities(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const result = await this.searchService.getUniqueCities();
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error in getUniqueCities:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Failed to fetch cities',
            });
        }
    }

    public async getAmenities(req: Request, res: Response): Promise<Response> {
        try {
            const result = await this.searchService.getAmenities();
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching amenities:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch amenities',
            });
        }
    }

    public async getPropertyCategories(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const result = await this.searchService.getPropertyCategories();
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching property categories:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch property categories',
            });
        }
    }

    public async getPropertyTypes(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const result = await this.searchService.getPropertyTypes();
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error fetching property types:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch property types',
            });
        }
    }
}
