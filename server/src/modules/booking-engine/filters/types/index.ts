import type {
    IBookingSearchPayload,
    IFetchRoomsResponse,
    IRoom,
    IRoomPrice,
    IPromotion,
    IAddonDetail,
    IBaseByGuestAmount,
    ITouristTax,
    IAppliedDiscount,
} from './room.type';
export {
    IBookingSearchPayload,
    IFetchRoomsResponse,
    IRoom,
    IRoomPrice,
    IPromotion,
    IAddonDetail,
    IBaseByGuestAmount,
    ITouristTax,
    IAppliedDiscount,
};

// ── Search types ──────────────────────────────────────────────────────────────
import type {
    ISearchQueryParams,
    IParsedSearchParams,
    ISearchRatePlan,
    ISearchRoom,
    ISearchPropertyResult,
} from './search.types';
export {
    ISearchQueryParams,
    IParsedSearchParams,
    ISearchRatePlan,
    ISearchRoom,
    ISearchPropertyResult,
};
export * from './pricing.type';