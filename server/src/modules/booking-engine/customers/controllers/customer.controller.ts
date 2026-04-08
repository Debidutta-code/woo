import { Request, Response } from 'express';
import { CustomerRequest, errorResponse } from '../../../../common/utils';
import { CustomerService } from '../services';
import { ICCustomerS, ILoginBody, IUCustomer } from '../types';

export class CustomerController {
    private customerService: CustomerService;

    constructor() {
        this.customerService = new CustomerService();
    }

    public async createCustomer(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const payload: ICCustomerS = req.body;
            const emailRegEx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
            if (!emailRegEx.test(payload.email)) {
                return res.status(400).json(errorResponse('Provide a valid email address'));
            }
            const result = await this.customerService.createCustomer(payload);
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to register, try again later', error.message));
            }
            return res.status(500).json(errorResponse('Failed to register, try again later', 'Unknown error'));
        }
    }

    public async loginCustomer(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const payload: ILoginBody = req.body;
            if (!payload.email || !payload.email.trim() || !payload.password || !payload.password.trim()) {
                return res.status(400).json(errorResponse('Provide email and password'));
            }
            const result = await this.customerService.loginUser(payload);
            if (!result.success) {
                return res.status(400).json(result);
            }
            res.cookie('woohooCustomerAccess', result.data.accessToken, {
                httpOnly: true,
                secure: true,
            });
            return res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Login failed, try again later', error.message));
            }
            return res.status(500).json(errorResponse('Login failed, try again later', 'Unknown error'));
        }
    }

    public async getProfile(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const customerId = req.Customer!.id;
            const result = await this.customerService.getCustomerById(customerId);
            return res.status(result.success ? 200 : 404).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to fetch profile', error.message));
            }
            return res.status(500).json(errorResponse('Failed to fetch profile', 'Unknown error'));
        }
    }

    public async updateProfile(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const customerId = req.Customer!.id;
            const payload: IUCustomer = req.body;
            const result = await this.customerService.updateCustomer(customerId, payload);
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to update profile', error.message));
            }
            return res.status(500).json(errorResponse('Failed to update profile', 'Unknown error'));
        }
    }

    public async deleteAccount(
        req: CustomerRequest,
        res: Response
    ): Promise<Response> {
        try {
            const customerId = req.Customer!.id;
            const result = await this.customerService.deleteUser(customerId);
            if (result.success) {
                res.clearCookie('woohooCustomerAccess');
            }
            return res.status(result.success ? 200 : 400).json(result);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json(errorResponse('Failed to delete account', error.message));
            }
            return res.status(500).json(errorResponse('Failed to delete account', 'Unknown error'));
        }
    }

    public async logoutCustomer(
        _req: Request,
        res: Response
    ): Promise<Response> {
        res.clearCookie('woohooCustomerAccess');
        return res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
}
