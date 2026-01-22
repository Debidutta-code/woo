export interface IUserRolesAndAccess {
    role:
        | 'super_admin'
        | 'group_manager'
        | 'brand_manager'
        | 'hotel_manager'
        | 'staff'
        | 'revenue_manager'
    level: number;
    isActive: boolean;
  canCreateHotel:boolean
  canUpdateHotel:boolean
  canDeleteHotel:boolean
  canViewHotel  :boolean

  canUpdatePaymentDetails:boolean
  //crud for rate plans
  canCreateRatePlan:boolean
  canViewRatePlan:boolean
  canUpdateRatePlan:boolean
  canDeleteRatePlan:boolean
  //crud for inventory
  canAddInventory:boolean
  canCreateRoomAvailability:boolean
  canMapRatePlan:boolean
  canUpdateRoomPrice:boolean
  //crud for bookings
  canSeeBookingDetails:boolean
  canUpdateBookingStatus:boolean
  //crud for analytics
  canViewAnalytics:boolean
  //crud for members
  canCreateMembers:boolean
  canViewMembers:boolean
  canUpdateMembers:boolean
  canDeleteMembers:boolean
  //crud for users
  canCreateLevel0User:boolean
  canCreateLevel1User:boolean
  canCreateLevel2User:boolean
  canCreateLevel3User:boolean
  canUpdateLevel0User:boolean
  canUpdateLevel1User:boolean
  canUpdateLevel2User:boolean
  canUpdateLevel3User:boolean
  canDeleteLevel0User:boolean
  canDeleteLevel1User:boolean
  canDeleteLevel2User:boolean
  canDeleteLevel3User:boolean
  //crud for logs
  canViewLogs:boolean
  //crud for roles
  canCreateNewRole:boolean
  canViewAccess:boolean
  canModifyAccess:boolean
  canDeleteRole:boolean
  //crud for policies
  canCreatePolicy:boolean
  canUpdatePolicy:boolean
  canDeletePolicy:boolean
  //crud for management apis
  canCDCategory:boolean
  canCDPropertyType:boolean
  canCDDestinationType:boolean
  canCDAmenity:boolean
  canSeeDraftedProperties:boolean

  //new Access controllers
  //start stop sell api

  canModifyStartStopSell:boolean

  canCreateRoomTypes:boolean
  canUpdateRoomTypes:boolean
  canDeleteRoomTypes:boolean
  //front office apis
  //reservation apis

  //Addons Management
  canAddAddons:boolean
  canViewAddons:boolean
  canUpdateAddons:boolean
  canDeleteAddons:boolean
  canAddAddonsForBookings:boolean
  //Tax Management
  canAddTax:boolean
  canViewTax:boolean
  canUpdateTax:boolean
  canDeleteTax:boolean
  canCreateTaxGroup:boolean
  canDeleteTaxGroup:boolean
  canAddTaxToRatePlans:boolean
  canAddPolicyToRatePlans:boolean
  canAdd360Images:boolean

  canCreateCTA:boolean
  canUpdateCTA:boolean
  canDeleteCTA:boolean
  canViewCTA:boolean
  canCreateGeoRatePlan:boolean
  canUpdateGeoRatePlan:boolean
  canDeleteGeoRatePlan:boolean
  canViewGeoRatePlan:boolean

  // --- Reservation Management ---
  canCreateReservation:boolean
  canViewReservation:boolean
  canCancelReservation:boolean
  canAmendReservation:boolean
}
