import { Router, Request, Response, NextFunction } from 'express';
import { ReservationController } from '../../reservation/controllers';
import { attachPropertyDetails } from '../../middlewares/property.middleware';
import { customerProtect } from '../../middlewares/customer-auth.middleware';
import { errorResponse, CustomRequest } from '../../utils';
import { NewReservationService } from '../../reservation/services';
import { RoomBookingService } from '../service';

const router = Router();
const reservationController = new ReservationController();
const reservationService = new NewReservationService();

// Payload adapter for reservation creation
const adaptReservationPayload = (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const body = req.body;
        const customerId = req.customer?.id || body.customerId || null;
        
        const checkInDate = body.checkInDate || body.checkIn;
        const checkOutDate = body.checkOutDate || body.checkOut;
        const hotelCode = body.hotelCode || body.propertyCode;
        const hotelName = body.hotelName || " ";
        
        // guests format mapping
        const guestList = (body.guests || []).map((g: any) => ({
            firstName: g.firstName || "",
            lastName: g.lastName || "",
            email: g.email || body.email || "",
            phoneNumber: g.phone || body.phone || "",
            type: g.type || "adult",
            propertyId: body.propertyId || ""
        }));

        // finalPrice format mapping
        const totalAmount = body.roomTotalPrice || body.amount || 0;
        const taxValue = body.taxValue || 0;
        const finalPrice = body.finalPrice || {
            totalAmount,
            amountBeforeTax: totalAmount - taxValue,
            taxedAmount: taxValue,
            totalTaxAmount: taxValue,
            numberOfNights: Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (24 * 3600 * 1000))),
            dailyPriceBrakeDown: [],
            addonBrakeDowns: [],
            promotionBrakeDown: [],
            taxBrakeDown: []
        };

        // Mutate body for ReservationController compatibility
        req.body = {
            propertyCode: hotelCode,
            reservationStartDate: checkInDate,
            reservationEndDate: checkOutDate,
            hotelName,
            roomName: body.roomName || "",
            roomTypeCode: body.roomTypeCode || body.roomType || "",
            bookingUserEmail: body.email || "",
            bookingUserPhone: body.phone || "",
            numberOfRooms: body.numberOfRooms || body.rooms || 1,
            finalPrice,
            promoCode: body.coupon ? body.coupon[0] : "",
            currencyCode: body.currencyCode || body.currency || "USD",
            guestDetails: guestList,
            ratePlanCode: body.ratePlanCode || "",
            paymentMethod: body.paymentMethod || (body.paymentInfo ? "payment_gateway" : "pay_at_hotel"),
            bookingSource: "direct",
            platforms: body.provider || "web",
            agencyId: null,
            customerId: customerId,
            ngeniusOrderRef: body.paymentInfo?.setupIntentId || undefined
        };
        next();
    } catch (err: any) {
        return res.status(400).json(errorResponse('Failed to parse booking payload: ' + err.message));
    }
};

// 1. Create reservation endpoints
router.post(
    '/createreservation',
    customerProtect,
    adaptReservationPayload,
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'body',
    }),
    reservationController.createReservation.bind(reservationController)
);

router.post(
    '/create-reservation-with-card',
    customerProtect,
    adaptReservationPayload,
    attachPropertyDetails({
        identifierType: 'code',
        key: 'propertyCode',
        source: 'body',
    }),
    reservationController.createReservation.bind(reservationController)
);

// 2. Cancel reservation endpoint (handles PATCH and PUT)
router.route('/cancel-reservation/:reservationId')
    .patch(customerProtect, reservationController.cancelReservation.bind(reservationController))
    .put(customerProtect, reservationController.cancelReservation.bind(reservationController));

// 3. Update reservation endpoint (booking engine uses POST!)
router.post(
    '/update-reservation/:reservationCode',
    customerProtect,
    reservationController.updateReservation.bind(reservationController)
);

// 4. Retrieve reservations endpoints
const getReservationsByGuestIdHandler = async (req: Request, res: Response) => {
    try {
        const guestId = req.params.guestId || req.params.customerId;
        const result = await reservationService.getReservationsByGuestId(guestId);
        
        // Return BOTH format mappings for compatibility: 'bookings' and 'data'
        return res.status(result.success ? 200 : 400).json({
            success: result.success,
            message: result.message,
            bookings: result.data || [],
            data: result.data || []
        });
    } catch (error: any) {
        return res.status(500).json(errorResponse('Internal server error', error.message));
    }
};

router.get('/getUserReservations/:guestId', getReservationsByGuestIdHandler);
router.get('/customers/booking/details/:customerId', getReservationsByGuestIdHandler);

// 5. Rebook / Check Availability endpoint
router.get('/check/availability', async (req: Request, res: Response) => {
    try {
        const { hotelCode, invTypeCode, ratePlanCode, startDate, endDate } = req.query as any;
        if (!hotelCode || !invTypeCode || !ratePlanCode || !startDate || !endDate) {
            return res.status(400).json(errorResponse('Missing query parameters'));
        }
        
        // Use fetchRooms service to verify if the rooms are available
        const fetchRes = await RoomBookingService.fetchRooms({
            propertyCode: hotelCode,
            startDate,
            endDate,
            guests: { adults: 1, children: 0, rooms: 1 }
        });
        
        if (fetchRes.success && fetchRes.data) {
            const rooms = (fetchRes.data as any).rooms || [];
            const roomMatch = rooms.find((r: any) => r.roomTypeCode === invTypeCode || r.roomType === invTypeCode);
            if (roomMatch && roomMatch.availabilityCount > 0) {
                return res.status(200).json({
                    success: true,
                    message: 'available'
                });
            }
        }
        
        return res.status(200).json({
            success: false,
            message: 'Room not available for selected dates'
        });
    } catch (error: any) {
        return res.status(500).json(errorResponse('Failed to check availability', error.message));
    }
});

// Explicit availability filter endpoint (mirrors compatibility route)
router.get('/filters/availability', async (req: Request, res: Response) => {
    try {
        const { hotelCode, checkIn, checkOut } = req.query as any;
        if (!hotelCode || !checkIn || !checkOut) {
            return res.status(400).json(errorResponse('Missing required query parameters'));
        }
        const fetchRes = await RoomBookingService.fetchRooms({
            propertyCode: hotelCode,
            startDate: checkIn,
            endDate: checkOut,
            guests: { adults: 1, children: 0, rooms: 1 }
        });
        if (fetchRes.success && fetchRes.data) {
            const rooms = (fetchRes.data as any).rooms || [];
            const anyAvailable = rooms.some((r: any) => r.availabilityCount && r.availabilityCount > 0);
            if (anyAvailable) {
                return res.status(200).json({ success: true, message: 'available' });
            }
        }
        return res.status(200).json({ success: false, message: 'Room not available for selected dates' });
    } catch (error: any) {
        return res.status(500).json(errorResponse('Failed to check availability', error.message));
    }
});

export const BookingRoutes = router;
