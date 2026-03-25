import { Request, Response } from 'express';
import { searchPropertiesService } from '../service/property.service';

export async function searchPropertiesController(req: Request, res: Response) {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query "q" is required and must be at least 2 characters',
        count: 0,
        requiresDisambiguation: false,
        data: [],
      });
    }

    const result = await searchPropertiesService(q.trim());
    return res.status(200).json(result);

  } catch (error) {
    console.error('[searchPropertiesController]', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong, please try again',
      count: 0,
      requiresDisambiguation: false,
      data: [],
    });
  }
}