import { Request, Response } from 'express';
import { SyncQueryParams } from '../types';
import { syncProperties } from '../services';


export const syncPropertiesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { countryCode } = req.query as SyncQueryParams;

    const stats = await syncProperties({ countryCode });

    res.status(200).json({
      success: true,
      message: 'Property sync completed successfully',
      data: stats,
    });
  } catch (error: any) {
    console.error('Sync failed:', error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Property sync failed',
      error: error?.response?.data || error.message,
    });
  }
};