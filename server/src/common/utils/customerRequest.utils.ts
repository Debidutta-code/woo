import { Request as ExpressRequest } from 'express';
export interface CustomerRequest extends ExpressRequest {
    Customer?: {
        id: string;
        email: string;
        phoneNo: string;
    };
    jwt?: string;
}
