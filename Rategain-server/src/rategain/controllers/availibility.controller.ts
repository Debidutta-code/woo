import { Request, Response } from 'express';
import { BestPropertiesDto, GetProductsDto } from '../types';
import { getAllProducts, getBestProperties } from '../services';

export const getBestPropertiesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const dto: BestPropertiesDto = req.body;

    if (!dto.checkin || !dto.checkout) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: checkin, checkout',
      });
      return;
    }

    if (!dto.destinationCode && !dto.PropertyId) {
      res.status(400).json({
        success: false,
        message: 'Either destinationCode or PropertyId must be provided',
      });
      return;
    }

    if (!dto.Rooms?.length) {
      res.status(400).json({
        success: false,
        message: 'Rooms must not be empty',
      });
      return;
    }

    if (!dto.Echotoken) {
      res.status(400).json({
        success: false,
        message: 'Echotoken is required',
      });
      return;
    }

    const result = await getBestProperties(dto);

    res.status(200).json({
      success:     true,
      message:     'Properties fetched successfully',
      totalRecord: result.totalRecord,
      data:        result.body,
    });
  } catch (error: any) {
    console.error('GetBestProperties failed:', error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'GetBestProperties failed',
      error:   error?.response?.data || error.message,
    });
  }
};

export const getAllProductsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const dto: GetProductsDto = req.body;

    if (!dto.propertyID || !dto.PropertyCode || !dto.BrandCode || !dto.checkin || !dto.checkout) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: propertyID, PropertyCode, BrandCode, checkin, checkout',
      });
      return;
    }

    if (!dto.Rooms?.length) {
      res.status(400).json({
        success: false,
        message: 'Rooms must not be empty',
      });
      return;
    }

    const result = await getAllProducts(dto);

    res.status(200).json({
      success: true,
      message: 'Products fetched successfully',
      data:    result.body,
    });
  } catch (error: any) {
    console.error('GetAllProducts failed:', error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'GetAllProducts failed',
      error:   error?.response?.data || error.message,
    });
  }
};