import { NextFunction, Response } from "express";
import { CustomerRequest, decodeToken, errorResponse } from "../utils";
import { config } from "../../config";

export const customerProtect = async (
    req: CustomerRequest,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies?.accessToken;
    

    if (!token) {
        return res.status(401).json(
            errorResponse("Authentication required")
        );
    }

    try {
        const decoded = await decodeToken(
            token,
            config.customerJWTSecret!
        );

        if (!decoded?.id || !decoded?.email) {
            return res.status(401).json(
                errorResponse("Invalid authentication credentials")
            );
        }

        req.jwt = token;
        req.Customer = {
            id: decoded.id,
            email: decoded.email,
            phoneNo: decoded.phoneNo,
        };

        next();
    } catch (error: any) {
        if (error instanceof Error && error.name === "TokenExpiredError") {
            return res.status(401).json(
                errorResponse("Session expired. Please log in again.")
            );
        }

        return res.status(401).json(
            errorResponse("Authentication failed")
        );
    }
};