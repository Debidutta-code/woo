import { Response, NextFunction } from 'express';
import { CustomRequest } from '../utils/customRequest';
import { errorResponse } from '../utils/return';
import { prisma } from '../config';
export type Role =
    | 'super_admin'
    | 'group_manager'
    | 'brand_manager'
    | 'hotel_manager'
    | 'staff'
    | 'revenue_manager'
type Permission =
    //Hotel
    | 'canCreateHotel'
    | 'canUpdateHotel'
    | 'canDeleteHotel'
    | 'canViewHotel'
    //Payment
    | 'canUpdatePaymentDetails'
    //Rate Plan
    | 'canCreateRatePlan'
    | 'canViewRatePlan'
    | 'canUpdateRatePlan'
    | 'canDeleteRatePlan'
    //Inventory
    | 'canAddInventory'
    | 'canCreateRoomAvailability'
    | 'canMapRatePlan'
    | 'canUpdateRoomPrice'
    //Booking
    | 'canSeeBookingDetails'
    | 'canUpdateBookingStatus'
    //Analytics
    | 'canViewAnalytics'
    //Members
    | 'canCreateMembers'
    | 'canViewMembers'
    | 'canUpdateMembers'
    | 'canDeleteMembers'
    //User Management
    | 'canCreateLevel0User'
    | 'canCreateLevel1User'
    | 'canCreateLevel2User'
    | 'canCreateLevel3User'
    | 'canUpdateLevel0User'
    | 'canUpdateLevel1User'
    | 'canUpdateLevel2User'
    | 'canUpdateLevel3User'
    | 'canDeleteLevel0User'
    | 'canDeleteLevel1User'
    | 'canDeleteLevel2User'
    | 'canDeleteLevel3User'
    //Logs
    | 'canViewLogs'
    //Roles
    | 'canCreateNewRole'
    | 'canViewAccess'
    | 'canModifyAccess'
    | 'canDeleteRole'
    //Policy
    | 'canCreatePolicy'
    | 'canUpdatePolicy'
    | 'canDeletePolicy'
    //Utils Management
    | 'canCDCategory'
    | 'canCDPropertyType'
    | 'canCDDestinationType'
    | 'canCDAmenity'
    | 'canSeeDraftedProperties'
    //Start/Stop Sell
    | 'canModifyStartStopSell'
    //Room Types
    | 'canCreateRoomTypes'
    | 'canUpdateRoomTypes'
    | 'canDeleteRoomTypes'
    //Reservation
    | 'canCreateReservation'
    | 'canViewReservation'
    | 'canCancelReservation'
    | 'canViewArrivals'
    | 'canViewDepartures'
    | 'canViwCheckIns'
    | 'canViwCheckOuts'
    | 'canDownloadBookingVouchers'
    | 'canDownloadInvoice'
    //Amendment
    | 'canAmendReservation'
    //Check In/Out
    | 'canMakeCheckIn'
    | 'canMakeCheckOut'
    | 'canMakeNoShow'
    //Guests
    | 'canViewGuests'
    | 'canUpdateGuests'
    | 'canDeleteGuests'
    | 'canCreateGuests'
    //Reports
    | 'canViewReports'
    | 'canDownloadReports'
    //Night Audit
    | 'canPerformNightAudit'
    //Payments
    | 'canAddPayments'
    | 'canViewPayments'
    | 'canUpdatePayments'
    | 'canDeletePayments'
    //House Keeping
    | 'canViewHouseKeepingTasks'
    | 'canUpdateHouseKeepingTasks'
    | 'canDeleteHouseKeepingTasks'
    | 'canCreateHouseKeepingTasks'
    //Individual Rooms
    | 'canCreateIndividualRooms'
    | 'canUpdateIndividualRooms'
    | 'canDeleteIndividualRooms'
    | 'canViewIndividualRooms'
    //Room Status
    | 'canViewRoomStatus'
    | 'canUpdateRoomStatus'
    //Addons
    | 'canAddAddons'
    | 'canViewAddons'
    | 'canUpdateAddons'
    | 'canDeleteAddons'
    | 'canAddAddonsForBookings'
    //Tax
    | 'canAddTax'
    | 'canViewTax'
    | 'canUpdateTax'
    | 'canDeleteTax'
    | 'canCreateTaxGroup'
    | 'canDeleteTaxGroup'
    | 'canAddTaxToRatePlans'
    //Policy to Rate Plans
    | 'canAddPolicyToRatePlans'
    //360 Images
    | 'canAdd360Images';

export function checkRoleBased(requiredPermission: Permission) {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const role = req?.user?.role;

            if (!role) {
                return res
                    .status(401)
                    .json(errorResponse('Unauthorized: User role is missing'));
            }

            const roleDoc = await prisma.accessControl.findFirst({
                where: {
                    role: role as Role,
                    isActive: true,
                },
                select: {
                    role: true,
                    level: true,
                    isActive: true,
                    canCreateHotel: true,
                    canUpdateHotel: true,
                    canDeleteHotel: true,
                    canViewHotel: true,

                    canUpdatePaymentDetails: true,
                    //crud for rate plans
                    canCreateRatePlan: true,
                    canViewRatePlan: true,
                    canUpdateRatePlan: true,
                    canDeleteRatePlan: true,
                    //crud for inventory
                    canAddInventory: true,
                    canCreateRoomAvailability: true,
                    canMapRatePlan: true,
                    canUpdateRoomPrice: true,
                    //crud for bookings
                    canSeeBookingDetails: true,
                    canUpdateBookingStatus: true,
                    //crud for analytics
                    canViewAnalytics: true,
                    //crud for members
                    canCreateMembers: true,
                    canViewMembers: true,
                    canUpdateMembers: true,
                    canDeleteMembers: true,
                    //crud for users
                    canCreateLevel0User: true,
                    canCreateLevel1User: true,
                    canCreateLevel2User: true,
                    canCreateLevel3User: true,
                    canUpdateLevel0User: true,
                    canUpdateLevel1User: true,
                    canUpdateLevel2User: true,
                    canUpdateLevel3User: true,
                    canDeleteLevel0User: true,
                    canDeleteLevel1User: true,
                    canDeleteLevel2User: true,
                    canDeleteLevel3User: true,
                    //crud for logs
                    canViewLogs: true,
                    //crud for roles
                    canCreateNewRole: true,
                    canViewAccess: true,
                    canModifyAccess: true,
                    canDeleteRole: true,
                    //crud for policies
                    canCreatePolicy: true,
                    canUpdatePolicy: true,
                    canDeletePolicy: true,
                    //crud for management apis
                    canCDCategory: true,
                    canCDPropertyType: true,
                    canCDDestinationType: true,
                    canCDAmenity: true,
                    canSeeDraftedProperties: true,

                    //new Access controllers
                    //start stop sell api

                    canModifyStartStopSell: true,

                    canCreateRoomTypes: true,
                    canUpdateRoomTypes: true,
                    canDeleteRoomTypes: true,
                    //front office apis
                    //reservation apis

                    //Addons Management
                    canAddAddons: true,
                    canViewAddons: true,
                    canUpdateAddons: true,
                    canDeleteAddons: true,
                    canAddAddonsForBookings: true,
                    //Tax Management
                    canAddTax: true,
                    canViewTax: true,
                    canUpdateTax: true,
                    canDeleteTax: true,
                    canCreateTaxGroup: true,
                    canDeleteTaxGroup: true,
                    canAddTaxToRatePlans: true,
                    canAddPolicyToRatePlans: true,
                    canAdd360Images: true,

                    canCreateCTA: true,
                    canUpdateCTA: true,
                    canDeleteCTA: true,
                    canViewCTA: true,
                    canCreateGeoRatePlan: true,
                    canUpdateGeoRatePlan: true,
                    canDeleteGeoRatePlan: true,
                    canViewGeoRatePlan: true,

                    // --- Reservation Management ---
                    canCreateReservation: true,
                    canViewReservation: true,
                    canCancelReservation: true,
                    canAmendReservation: true,
                },
            });

            if (!roleDoc) {
                console.log(
                    'Role document not found or inactive for role:',
                    role
                );
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            'Access denied: Role not found or inactive'
                        )
                    );
            }

            const hasPermission =
                roleDoc[requiredPermission as keyof typeof roleDoc];

            if (!hasPermission || hasPermission !== true) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            `Access denied: You do not have permission for this action`
                        )
                    );
            }

            next();
        } catch (error: any) {
            console.error('Role-based access check error:', {
                error: error.message,
                stack: error.stack,
                role: req?.user?.role,
                permission: requiredPermission,
            });
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal server error while verifying permissions'
                    )
                );
        }
    };
}

// Optional: Export a helper function to check multiple permissions
export function checkMultiplePermissions(requiredPermissions: Permission[]) {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const role = req?.user?.role;

            if (!role) {
                return res
                    .status(401)
                    .json(errorResponse('Unauthorized: User role is missing'));
            }

            const roleDoc = await prisma.accessControl.findFirst({
                where: {
                    role: role as Role,
                    isActive: true,
                },
            });

            if (!roleDoc) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            'Access denied: Role not found or inactive'
                        )
                    );
            }

            // Check if user has ALL required permissions
            const missingPermissions = requiredPermissions.filter(
                permission => !roleDoc[permission as keyof typeof roleDoc]
            );

            if (missingPermissions.length > 0) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            `Access denied: Missing permissions: ${missingPermissions.join(', ')}`
                        )
                    );
            }

            next();
        } catch (error: any) {
            console.error('Multiple permissions check error:', error);
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal server error while verifying permissions'
                    )
                );
        }
    };
}

export function addRoleBasedDetails() {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const role = req.user?.role;

            if (!role) {
                return res
                    .status(401)
                    .json(errorResponse('Unauthorized: User role is missing'));
            }

            const roleDoc = await prisma.accessControl.findFirst({
                where: {
                    role: role as Role,
                    isActive: true,
                },
                  select: {
                    role: true,
                    level: true,
                    isActive: true,
                    canCreateHotel: true,
                    canUpdateHotel: true,
                    canDeleteHotel: true,
                    canViewHotel: true,

                    canUpdatePaymentDetails: true,
                    //crud for rate plans
                    canCreateRatePlan: true,
                    canViewRatePlan: true,
                    canUpdateRatePlan: true,
                    canDeleteRatePlan: true,
                    //crud for inventory
                    canAddInventory: true,
                    canCreateRoomAvailability: true,
                    canMapRatePlan: true,
                    canUpdateRoomPrice: true,
                    //crud for bookings
                    canSeeBookingDetails: true,
                    canUpdateBookingStatus: true,
                    //crud for analytics
                    canViewAnalytics: true,
                    //crud for members
                    canCreateMembers: true,
                    canViewMembers: true,
                    canUpdateMembers: true,
                    canDeleteMembers: true,
                    //crud for users
                    canCreateLevel0User: true,
                    canCreateLevel1User: true,
                    canCreateLevel2User: true,
                    canCreateLevel3User: true,
                    canUpdateLevel0User: true,
                    canUpdateLevel1User: true,
                    canUpdateLevel2User: true,
                    canUpdateLevel3User: true,
                    canDeleteLevel0User: true,
                    canDeleteLevel1User: true,
                    canDeleteLevel2User: true,
                    canDeleteLevel3User: true,
                    //crud for logs
                    canViewLogs: true,
                    //crud for roles
                    canCreateNewRole: true,
                    canViewAccess: true,
                    canModifyAccess: true,
                    canDeleteRole: true,
                    //crud for policies
                    canCreatePolicy: true,
                    canUpdatePolicy: true,
                    canDeletePolicy: true,
                    //crud for management apis
                    canCDCategory: true,
                    canCDPropertyType: true,
                    canCDDestinationType: true,
                    canCDAmenity: true,
                    canSeeDraftedProperties: true,

                    //new Access controllers
                    //start stop sell api

                    canModifyStartStopSell: true,

                    canCreateRoomTypes: true,
                    canUpdateRoomTypes: true,
                    canDeleteRoomTypes: true,
                    //front office apis
                    //reservation apis

                    //Addons Management
                    canAddAddons: true,
                    canViewAddons: true,
                    canUpdateAddons: true,
                    canDeleteAddons: true,
                    canAddAddonsForBookings: true,
                    //Tax Management
                    canAddTax: true,
                    canViewTax: true,
                    canUpdateTax: true,
                    canDeleteTax: true,
                    canCreateTaxGroup: true,
                    canDeleteTaxGroup: true,
                    canAddTaxToRatePlans: true,
                    canAddPolicyToRatePlans: true,
                    canAdd360Images: true,

                    canCreateCTA: true,
                    canUpdateCTA: true,
                    canDeleteCTA: true,
                    canViewCTA: true,
                    canCreateGeoRatePlan: true,
                    canUpdateGeoRatePlan: true,
                    canDeleteGeoRatePlan: true,
                    canViewGeoRatePlan: true,

                    // --- Reservation Management ---
                    canCreateReservation: true,
                    canViewReservation: true,
                    canCancelReservation: true,
                    canAmendReservation: true,
                },
            });

            if (!roleDoc) {
                return res
                    .status(403)
                    .json(
                        errorResponse(
                            'Access denied: Role not found or inactive'
                        )
                    );
            }

            // Add all permissions to request object
            req.permission = roleDoc;

            next();
        } catch (error: any) {
            console.error('Role-based details fetch error:', {
                error: error.message,
                stack: error.stack,
                role: req?.user?.role,
            });
            return res
                .status(500)
                .json(
                    errorResponse(
                        'Internal server error while fetching role permissions'

                    )
                );
        }
    };
}
