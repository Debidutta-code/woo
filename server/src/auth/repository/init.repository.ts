import { prisma } from '../../config';
import { createHash } from '../utills/bcryptHelper';
export class InitializeDB {
    public async initDb() {
        try {
            const password = await createHash('Admin@123');
            const userRes = await prisma.user.create({
                data: {
                    email: 'superadmin.woohoo@gmail.com',
                    //Admin@123
                    password: password,
                    firstName: 'Sandeep',
                    lastName: 'Mohapatra',
                    role: 'super_admin',
                    userLevel: 4,
                },
            });
            const creation = await prisma.creation.create({
                data: {
                    name: 'Super Group',
                    type: 'super',
                    isActive: true,
                    isDeleted: false,
                    createdAt: new Date(),
                    createdBy: {
                        connect: {
                            id: userRes.id,
                        },
                    },
                },
            });
            await prisma.user.update({
                where: {
                    id: userRes.id,
                },
                data: {
                    creationId: creation.id,
                },
            });
            await prisma.accessControl.create({
                data: {
                    role: 'super_admin',
                    level: 4,
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
            await prisma.accessControl.create({
                data: {
                    role: 'group_manager',
                    level: 3,
                    isActive: true,
                    // Hotels
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
            await prisma.accessControl.create({
                data: {
                    role: 'brand_manager',
                    level: 2,
                    isActive: true,
                    // Hotels
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
            await prisma.accessControl.create({
                data: {
                    role: 'hotel_manager',
                    level: 1,
                    isActive: true,
                    // Hotels (can only update their own hotel)
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
            await prisma.accessControl.create({
                data: {
                    role: 'revenue_manager',
                    level: 1,
                    isActive: true,
                    // Hotels
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
            await prisma.accessControl.create({
                data: {
                    role: 'staff',
                    level: 0,
                    isActive: true,
                    // Basic viewing permissions
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

            return userRes;
        } catch (error) {
            throw new Error('Failed to init db');
        }
    }
}
