import { Response } from 'express';
import { Request } from 'express';
import { AuthService } from '../services/userAuthentication.service';
import { errorResponse, successResponse } from '../../utils/return';
import { CustomRequest } from '../../utils/customRequest';
export class AuthController {
    public static async login(req: Request, res: Response) {
        try {
            const { cred, password } = req.body;
            if (!cred) {
                return res
                    .status(400)
                    .json(
                        errorResponse(
                            'Email or Username are required for login'
                        )
                    );
            }
            if (!password) {
                return res
                    .status(400)
                    .json(errorResponse('Password is required for login'));
            }
            const response = await AuthService.loginUser({
                cred,
                password,
            });
            if (response.success) {
                return res
                    .status(200)
                    .cookie('accessToken', response?.data?.accessToken, {
                        httpOnly: true,
                        secure: true,
                    })
                    .json(
                        successResponse('Login Successful', response.data.user)
                    );
            } else {
                return res
                    .status(401)
                    .json(errorResponse(response?.message, ''));
            }
        } catch (error) {
            return res
                .status(500)
                .json(errorResponse('Unexpected Error occur in login'));
        }
    }
    public static async logout(req: Request, res: Response) {
        res.clearCookie('accessToken');
        res.status(200).json({
            status: 'success',
            message: 'User logged out successfully',
        });
    }
    public static async createUser(req: CustomRequest, res: Response) {
        try {
            const creatorAuthKey = req.user?.authKey;
            const creatorLevel = req.permission?.level;
            const creatorId = req.user?.id;
            if (!creatorId || !creatorLevel || !creatorAuthKey) {
                return res
                    .status(400)
                    .json(errorResponse('In sufficient creator data'));
            }
            
            const requestedRoleLevel = req.body.level;
            if (
                requestedRoleLevel == '0' &&
                !req?.permission?.canCreateLevel0User
            ) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            "You don't have permission to create Level 0 User"
                        )
                    );
            } else if (
                requestedRoleLevel == '1' &&
                !req?.permission?.canCreateLevel1User
            ) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            "You don't have permission to create Level 1 User"
                        )
                    );
            } else if (
                requestedRoleLevel == '2' &&
                !req?.permission?.canCreateLevel2User
            ) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            "You don't have permission to create Level 2 User"
                        )
                    );
            } else if (
                requestedRoleLevel == '3' &&
                !req?.permission?.canCreateLevel3User
            ) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            "You don't have permission to create Level 3 User"
                        )
                    );
            }
            console.log(req.body);
            // console.log()
            const userData = {
                ...req.body,
                level:
                    req.body && req.body.level in [0, 1, 2, 3]
                        ? req.body.level
                        : 1,
                        
                createdBy: creatorAuthKey,
            };
            const newUser = await AuthService.createUser(userData, creatorId);
            if (newUser?.success) {
                return res.status(200).json(newUser);
            } else {
                return res.status(400).json(newUser);
            }
        } catch (error: any) {
            // console.log(error);
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Error occur while creating user',
                        error?.message
                    )
                );
        }
    }
}
