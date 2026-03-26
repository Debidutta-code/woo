import { Request, Response } from 'express';
import { PropertyService } from '../service/property.service';

export class PropertyController {
  private service: PropertyService;

  constructor() {
    this.service = new PropertyService();
    this.searchProperties = this.searchProperties.bind(this);
    this.getPropertyById = this.getPropertyById.bind(this);
    this.getPropertyAddress = this.getPropertyAddress.bind(this);
    this.getPropertyRooms = this.getPropertyRooms.bind(this);
  }

  // ─── GET /api/properties/search?propertyName=marina ──────────────
  async searchProperties(req: Request, res: Response) {
    try {
      const { propertyName, page, limit } = req.query;

      if (!propertyName || typeof propertyName !== 'string' || propertyName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: '"propertyName" is required and must be at least 2 characters',
          count: 0,
          requiresDisambiguation: false,
          data: [],
        });
      }

      const result = await this.service.searchProperties({
        propertyName: propertyName.trim(),
        page: page ? Number(page) : 1,
        limit: limit ? Math.min(Number(limit), 50) : 10,
      });

      return res.status(200).json(result);

    } catch (error) {
      console.error('[PropertyController.searchProperties]', error);
      return res.status(500).json({
        success: false,
        message: 'Something went wrong, please try again',
        count: 0,
        requiresDisambiguation: false,
        data: [],
      });
    }
  }

  // ─── GET /api/properties/:id ──────────────────────────────────────
  async getPropertyById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Property ID is required', data: null });
      }

      const result = await this.service.getPropertyById(id as string);
      return res.status(result.success ? 200 : 404).json(result);

    } catch (error) {
      console.error('[PropertyController.getPropertyById]', error);
      return res.status(500).json({ success: false, message: 'Something went wrong, please try again', data: null });
    }
  }

  // ─── GET /api/properties/:id/address ─────────────────────────────
  async getPropertyAddress(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Property ID is required', data: null });
      }

      const result = await this.service.getPropertyAddress(id as string);
      return res.status(result.success ? 200 : 404).json(result);

    } catch (error) {
      console.error('[PropertyController.getPropertyAddress]', error);
      return res.status(500).json({ success: false, message: 'Something went wrong, please try again', data: null });
    }
  }

  // ─── GET /api/properties/:id/rooms ───────────────────────────────
  async getPropertyRooms(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Property ID is required', count: 0, data: [] });
      }

      const result = await this.service.getPropertyRooms(id as string);
      return res.status(200).json(result);

    } catch (error) {
      console.error('[PropertyController.getPropertyRooms]', error);
      return res.status(500).json({ success: false, message: 'Something went wrong, please try again', count: 0, data: [] });
    }
  }
}