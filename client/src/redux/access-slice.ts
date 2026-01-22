import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Access interface with all permissions
export interface Access {
    canModifyAccess: boolean;
    canViewAccess: boolean;
    canAddInventory: boolean;
    canCDAmenity: boolean;
    canCDCategory: boolean;
    canCDDestinationType: boolean;
    canCDPropertyType: boolean;
    canCreateHotel: boolean;
    canCreateLevel0User: boolean;
    canCreateLevel1User: boolean;
    canCreateLevel2User: boolean;
    canCreateLevel3User: boolean;
    canCreateMembers: boolean;
    canCreateNewRole: boolean;
    canCreatePolicy: boolean;
    canCreateRatePlan: boolean;
    canCreateRoomAvailability: boolean;
    canDeleteHotel: boolean;
    canDeleteLevel0User: boolean;
    canDeleteLevel1User: boolean;
    canDeleteLevel2User: boolean;
    canDeleteLevel3User: boolean;
    canDeleteMembers: boolean;
    canDeletePolicy: boolean;
    canDeleteRatePlan: boolean;
    canDeleteRole: boolean;
    canMapRatePlan: boolean;
    canSeeBookingDetails: boolean;
    canSeeDraftedProperties: boolean;
    canUpdateBookingStatus: boolean;
    canUpdateHotel: boolean;
    canUpdateLevel0User: boolean;
    canUpdateLevel1User: boolean;
    canUpdateLevel2User: boolean;
    canUpdateLevel3User: boolean;
    canUpdateMembers: boolean;
    canUpdatePolicy: boolean;
    canUpdateRatePlan: boolean;
    canUpdatePaymentDetails: boolean;
    canViewAnalytics: boolean;
    canUpdateRoomPrice: boolean;
    canViewHotel: boolean;
    canViewLogs: boolean;
    canViewMembers: boolean;
    canViewRatePlan: boolean;
    canCreateRoomTypes: boolean;
    canUpdateRoomTypes: boolean;
    canDeleteRoomTypes: boolean;
    canAdd360Images: boolean;
    canAddAddons: boolean;
    canAddAddonsForBookings: boolean;
    canAddPayments: boolean;
    canAddPolicyToRatePlans: boolean;
    canAddTax: boolean;
    canAddTaxToRatePlans: boolean;
    canAmendReservation: boolean;
    canCancelReservation: boolean;
    canCreateGuests: boolean;
    canCreateHouseKeepingTasks: boolean;
    canCreateReservation: boolean;
    canCreateIndividualRooms: boolean;
    canCreateTaxGroup: boolean;
    canDeleteAddons: boolean;
    canDeleteGuests: boolean;
    canDeleteHouseKeepingTasks: boolean;
    canDeletePayments: boolean;
    canDeleteIndividualRooms: boolean;
    canDeleteTax: boolean;
    canDeleteTaxGroup: boolean;
    canDownloadBookingVouchers: boolean;
    canDownloadInvoice: boolean;
    canDownloadReports: boolean;
    canMakeCheckIn: boolean;
    canMakeCheckOut: boolean;
    canMakeNoShow: boolean;
    canModifyStartStopSell: boolean;
    canPerformNightAudit: boolean;
    canUpdateAddons: boolean;
    canUpdateGuests: boolean;
    canUpdateHouseKeepingTasks: boolean;
    canUpdatePayments: boolean;
    canUpdateIndividualRooms: boolean;
    canUpdateRoomStatus: boolean;
    canUpdateTax: boolean;
    canViewAddons: boolean;
    canViewArrivals: boolean;
    canViewDepartures: boolean;
    canViewGuests: boolean;
    canViewHouseKeepingTasks: boolean;
    canViewPayments: boolean;
    canViewReports: boolean;
    canViewReservation: boolean;
    canViewIndividualRooms: boolean;
    canViewRoomStatus: boolean;
    canViewTax: boolean;
    canViewCheckIns: boolean;
    canViewCheckOuts: boolean;
    canAccessFrontoffice: boolean;
    canAccessHousekeeping: boolean;
}

// User interface
interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    userLevel: number;
    name?: string;
    creation?: string;
    propertyId?: string;
}

// Define the state
interface AccessState {
    user: User | null;
    access: Access | null;
    error: string | null;
}

// Initial state with all access permissions defaulting to false
const initialAccessState: Access = {
    canModifyAccess: false,
    canViewAccess: false,
    canAddInventory: false,
    canCDAmenity: false,
    canCDCategory: false,
    canCDDestinationType: false,
    canCDPropertyType: false,
    canCreateHotel: false,
    canCreateLevel0User: false,
    canCreateLevel1User: false,
    canCreateLevel2User: false,
    canCreateLevel3User: false,
    canCreateMembers: false,
    canCreateNewRole: false,
    canCreatePolicy: false,
    canCreateRatePlan: false,
    canCreateRoomAvailability: false,
    canDeleteHotel: false,
    canDeleteLevel0User: false,
    canDeleteLevel1User: false,
    canDeleteLevel2User: false,
    canDeleteLevel3User: false,
    canDeleteMembers: false,
    canDeletePolicy: false,
    canDeleteRatePlan: false,
    canDeleteRole: false,
    canMapRatePlan: false,
    canSeeBookingDetails: false,
    canSeeDraftedProperties: false,
    canUpdateBookingStatus: false,
    canUpdateHotel: false,
    canUpdateLevel0User: false,
    canUpdateLevel1User: false,
    canUpdateLevel2User: false,
    canUpdateLevel3User: false,
    canUpdateMembers: false,
    canUpdatePolicy: false,
    canUpdateRatePlan: false,
    canUpdatePaymentDetails: false,
    canViewAnalytics: false,
    canUpdateRoomPrice: false,
    canViewHotel: false,
    canViewLogs: false,
    canViewMembers: false,
    canViewRatePlan: false,
    canCreateRoomTypes: false,
    canUpdateRoomTypes: false,
    canDeleteRoomTypes: false,
    canAdd360Images: false,
    canAddAddons: false,
    canAddAddonsForBookings: false,
    canAddPayments: false,
    canAddPolicyToRatePlans: false,
    canAddTax: false,
    canAddTaxToRatePlans: false,
    canAmendReservation: false,
    canCancelReservation: false,
    canCreateGuests: false,
    canCreateHouseKeepingTasks: false,
    canCreateReservation: false,
    canCreateIndividualRooms: false,
    canCreateTaxGroup: false,
    canDeleteAddons: false,
    canDeleteGuests: false,
    canDeleteHouseKeepingTasks: false,
    canDeletePayments: false,
    canDeleteIndividualRooms: false,
    canDeleteTax: false,
    canDeleteTaxGroup: false,
    canDownloadBookingVouchers: false,
    canDownloadInvoice: false,
    canDownloadReports: false,
    canMakeCheckIn: false,
    canMakeCheckOut: false,
    canMakeNoShow: false,
    canModifyStartStopSell: false,
    canPerformNightAudit: false,
    canUpdateAddons: false,
    canUpdateGuests: false,
    canUpdateHouseKeepingTasks: false,
    canUpdatePayments: false,
    canUpdateIndividualRooms: false,
    canUpdateRoomStatus: false,
    canUpdateTax: false,
    canViewAddons: false,
    canViewArrivals: false,
    canViewDepartures: false,
    canViewGuests: false,
    canViewHouseKeepingTasks: false,
    canViewPayments: false,
    canViewReports: false,
    canViewReservation: false,
    canViewIndividualRooms: false,
    canViewRoomStatus: false,
    canViewTax: false,
    canViewCheckIns: false,
    canViewCheckOuts: false,
    canAccessFrontoffice: false,
    canAccessHousekeeping: false,
};

const initialState: AccessState = {
    user: null,
    access: null,
    error: null,
};

// Create the access slice
const accessSlice = createSlice({
    name: 'access',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.error = null;
        },

        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                Object.assign(state.user, action.payload);
            }
        },

        setAccess: (state, action: PayloadAction<Access>) => {
            state.access = action.payload;
            state.error = null;
        },

        updateAccess: (state, action: PayloadAction<Partial<Access>>) => {
            if (state.access) {
                Object.assign(state.access, action.payload);
            } else {
                state.access = { ...initialAccessState, ...action.payload };
            }
        },

        clearAccess: (state) => {
            state.user = null;
            state.access = null;
            state.error = null;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

// Extract the action creators and reducer
export const { setUser, updateUser, setAccess, updateAccess, clearAccess, setError } = accessSlice.actions;
export type {  User, AccessState };
export { initialAccessState };
export default accessSlice.reducer;