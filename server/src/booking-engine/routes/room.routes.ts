import { Router } from 'express';
import { RoomBookingController } from '../controllers';
import { attachPropertyDetails } from '../../middlewares/property.middleware';
import { pricingRouter } from './pricing.route';
import { groupSearchRouter } from './group-search.route';
import { propertyDetailsRouter } from './property-details.route';
export const BookingEngineRoutes = Router();

BookingEngineRoutes.post(
    '/fetch-rooms',
    attachPropertyDetails({
        identifierType: "code",
        key: "propertyCode",
        source: "body"
    }), RoomBookingController.fetchRooms);
BookingEngineRoutes.post("/calendar-prices",
    attachPropertyDetails({
        identifierType: "code",
        key: "propertyCode",
        source: "body"
    }), RoomBookingController.getCalendarPrices);
BookingEngineRoutes.use("/pricing", pricingRouter);
BookingEngineRoutes.use("/group-search", groupSearchRouter);
BookingEngineRoutes.use("/property-details", propertyDetailsRouter);

// --- COMPATIBILITY BRIDGE ROUTING FOR NEXT.JS BOOKING ENGINE ---
import { prisma } from '../../config';
import { RoomBookingService } from '../service';
import { BookingEngineRoomsInterceptor } from '../../multi-language/interceptors/booking-engine/booking-engine-rooms.interceptor';
import { HotelService } from '../../ota/property/services/hotel.service';
import { PricingController } from '../controllers/pricing.controller';
import { CustomerController } from '../../customer/controllers';
import { customerProtect } from '../../middlewares/customer-auth.middleware';
import { ReviewController } from '../../ota/review/controllers';
import { PropertyWishController } from '../../ota/wishlist/controller/property-wish.controller';
import { CustomRequest } from '../../utils';

const hotelService = new HotelService();
const pricingController = new PricingController();
const customerController = new CustomerController();
const reviewController = new ReviewController();
const propertyWishController = new PropertyWishController();

// 1. Property Details Availability Filter
BookingEngineRoutes.get('/filters/property', async (req, res) => {
    try {
        const { id, checkIn, checkOut, rooms, adults, children } = req.query as any;
        if (!id) {
            return res.status(400).json({ success: false, message: 'Property ID is required' });
        }
        
        const property = await prisma.property.findUnique({
            where: { id },
            select: { propertyCode: true }
        });
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        
        const guests = {
            rooms: rooms ? parseInt(rooms) : 1,
            adults: adults ? parseInt(adults) : 1,
            children: children ? parseInt(children) : 0
        };
        
        const locale = (req.headers['accept-language'] as string | undefined)?.slice(0, 2).toLowerCase() || 'en';
        
        let roomsResponse = await RoomBookingService.fetchRooms({
            propertyCode: property.propertyCode,
            startDate: checkIn,
            endDate: checkOut,
            guests
        });
        
        roomsResponse = await BookingEngineRoomsInterceptor.intercept(roomsResponse, locale);
        
        return res.status(roomsResponse.success ? 200 : 400).json({
            success: roomsResponse.success,
            data: {
                propertyCode: property.propertyCode,
                availableRooms: roomsResponse.data || []
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// 2. Autocomplete / Location-based property searches with filters
BookingEngineRoutes.get('/filters/search', async (req, res) => {
    try {
        const { location, amenities, propertyTypes, propertyCategories, page, limit } = req.query as any;
        
        const filters: any = {
            page: page || '1',
            limit: limit || '10',
            search: location,
            amenities,
            propertyType: propertyTypes,
            propertyCategory: propertyCategories
        };
        
        const result = await hotelService.fetchAutocompleteLocations(filters);
        if (!result.success || !result.data) {
            return res.status(200).json({ success: true, message: result.message || 'No properties found', data: [] });
        }
        
        const formattedHotels = await Promise.all(result.data.map(async (prop: any) => {
            const reviewSummary = await prisma.review.aggregate({
                _avg: { rating: true },
                _count: { id: true },
                where: { propertyId: prop.id, isDeleted: false }
            });
            
            const amenitiesRecord: Record<string, boolean> = {};
            if (Array.isArray(prop.amenities)) {
                prop.amenities.forEach((amenity: any) => {
                    if (amenity.name) {
                        amenitiesRecord[amenity.name] = true;
                    }
                });
            }
            
            const baseAmount = prop.baseAmount || 100;
            
            const propertyWithAddress = await prisma.property.findUnique({
                where: { id: prop.id },
                select: {
                    starRating: true,
                    propertyAddress: true
                }
            });
            
            const address = propertyWithAddress?.propertyAddress ? {
                addressLine1: propertyWithAddress.propertyAddress.addressLine1 || "",
                addressLine2: propertyWithAddress.propertyAddress.addressLine2 || null,
                city: propertyWithAddress.propertyAddress.city || "",
                state: propertyWithAddress.propertyAddress.state || "",
                country: propertyWithAddress.propertyAddress.country || "",
                zipCode: propertyWithAddress.propertyAddress.zipCode || "",
                landmark: propertyWithAddress.propertyAddress.landmark || ""
            } : {
                addressLine1: "",
                addressLine2: null,
                city: "",
                state: "",
                country: "",
                zipCode: "",
                landmark: ""
            };
            
            return {
                id: prop.id,
                propertyName: prop.propertyName,
                propertyEmail: prop.propertyEmail,
                propertyContact: prop.propertyContact,
                starRating: propertyWithAddress?.starRating || null,
                propertyCode: prop.propertyCode,
                description: prop.description || "",
                images: prop.image || [],
                image: prop.image || [],
                amenities: amenitiesRecord,
                address,
                baseAmount,
                currencyCode: prop.currencyCode || "USD",
                customerReviewData: {
                    averageRating: reviewSummary._avg.rating ? parseFloat(reviewSummary._avg.rating.toFixed(1)) : 0,
                    totalReviews: reviewSummary._count.id || 0
                }
            };
        }));
        
        return res.status(200).json({
            success: true,
            message: result.message,
            data: formattedHotels
        });
    } catch (error: any) {
        console.error('Search mapping failed:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// 3. Metadata endpoints for filtering
BookingEngineRoutes.get('/filters/search/unique-cities', async (req, res) => {
    try {
        const addresses = await prisma.propertyAddress.findMany({
            where: { property: { isDeleted: false, propertyConfigs: { isAvailableForOTA: true } } },
            select: { city: true }
        });
        
        const counts: Record<string, number> = {};
        addresses.forEach(addr => {
            if (addr.city) {
                const cityName = addr.city.trim();
                counts[cityName] = (counts[cityName] || 0) + 1;
            }
        });
        
        const data = Object.entries(counts).map(([city, propertyCount]) => ({
            city,
            propertyCount
        }));
        
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

BookingEngineRoutes.get('/filters/search/amenities', async (req, res) => {
    try {
        const list = await prisma.masterAmenity.findMany({
            select: { amenityName: true }
        });
        const data = Array.from(new Set(list.map((a: any) => a.amenityName).filter(Boolean)));
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

BookingEngineRoutes.get('/filters/search/property-categories', async (req, res) => {
    try {
        const list = await prisma.masterPropertyCategory.findMany({
            select: { categoryName: true }
        });
        const data = Array.from(new Set(list.map((c: any) => c.categoryName).filter(Boolean)));
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

BookingEngineRoutes.get('/filters/search/property-types', async (req, res) => {
    try {
        const list = await prisma.masterPropertyType.findMany({
            select: { propertyTypeName: true }
        });
        const data = Array.from(new Set(list.map((t: any) => t.propertyTypeName).filter(Boolean)));
        return res.status(200).json({ success: true, data });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// 4. Room pricing endpoints
BookingEngineRoutes.post('/get-price',
    attachPropertyDetails({
        identifierType: "code",
        key: "propertyCode",
        source: "body"
    }),
    pricingController.getRoomRentController.bind(pricingController)
);

BookingEngineRoutes.post('/pricing/get-price',
    attachPropertyDetails({
        identifierType: "code",
        key: "propertyCode",
        source: "body"
    }),
    pricingController.getRoomRentController.bind(pricingController)
);

// 5. Customer Authentication & Profile endpoints
BookingEngineRoutes.post('/customer/register', customerController.register.bind(customerController));
BookingEngineRoutes.post('/customer/login', customerController.login.bind(customerController));
BookingEngineRoutes.post('/customer/logout', customerController.logout.bind(customerController));
BookingEngineRoutes.get('/customer/me', customerProtect, customerController.getMe.bind(customerController));
BookingEngineRoutes.put('/customer/me', customerProtect, customerController.updateProfile.bind(customerController));

// 6. Review System
BookingEngineRoutes.get('/review/property/:hotelCode', async (req, res) => {
    try {
        const hotelCode = req.params.hotelCode;
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
        
        const property = await prisma.property.findUnique({
            where: { propertyCode: hotelCode },
            select: { id: true }
        });
        if (!property) {
            return res.status(200).json({ success: true, data: [] });
        }
        
        const reviews = await prisma.review.findMany({
            where: { propertyId: property.id, isDeleted: false },
            include: {
                Reservation: {
                    select: {
                        bookingUserEmail: true
                    }
                }
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
        
        const total = await prisma.review.count({
            where: { propertyId: property.id, isDeleted: false }
        });
        
        const formattedReviews = reviews.map((r: any) => ({
            _id: r.id,
            id: r.id,
            reservationId: r.reservationId,
            hotelName: r.propertyName,
            hotelCode: r.propertyCode,
            userId: r.customerId,
            guestEmail: r.Reservation?.bookingUserEmail || "guest@example.com",
            comment: r.review,
            rating: r.rating,
            createdAt: r.createdAt
        }));
        
        return res.status(200).json({
            success: true,
            data: formattedReviews,
            meta: {
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

BookingEngineRoutes.post('/review/create', customerProtect, async (req: CustomRequest, res) => {
    try {
        const { hotelCode, comment, rating, reservationId } = req.body;
        
        req.body = {
            propertyCode: hotelCode,
            review: comment,
            rating,
            reservationId
        };
        
        return reviewController.createReview(req, res);
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

BookingEngineRoutes.get('/review/get', async (req, res) => {
    try {
        const { reservationId } = req.query as any;
        if (!reservationId) {
            return res.status(400).json({ success: false, message: 'reservationId is required' });
        }
        
        const reviews = await prisma.review.findMany({
            where: { reservationId, isDeleted: false },
            include: {
                Reservation: {
                    select: {
                        bookingUserEmail: true
                    }
                }
            }
        });
        
        const formattedReviews = reviews.map((r: any) => ({
            _id: r.id,
            id: r.id,
            reservationId: r.reservationId,
            hotelName: r.propertyName,
            hotelCode: r.propertyCode,
            userId: r.customerId,
            guestEmail: r.Reservation?.bookingUserEmail || "guest@example.com",
            comment: r.review,
            rating: r.rating,
            createdAt: r.createdAt
        }));
        
        return res.status(200).json({
            success: true,
            data: {
                customerReview: formattedReviews
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// 7. Wishlist Integration
BookingEngineRoutes.post('/wish-list', customerProtect, async (req: CustomRequest, res) => {
    try {
        const customer = req.customer;
        if (!customer) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const { propertyId } = req.body;
        if (!propertyId) {
            return res.status(400).json({ success: false, message: 'Property ID is required' });
        }
        
        const exists = await prisma.wishList.findUnique({
            where: {
                customerId_propertyId: {
                    customerId: customer.id,
                    propertyId
                }
            }
        });
        
        if (exists) {
            req.params = { propertyId };
            return propertyWishController.removeFromWishlist(req, res);
        } else {
            return propertyWishController.addToWishlist(req, res);
        }
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

BookingEngineRoutes.get('/wish-list/my', customerProtect, propertyWishController.getWishlistForUser.bind(propertyWishController));

