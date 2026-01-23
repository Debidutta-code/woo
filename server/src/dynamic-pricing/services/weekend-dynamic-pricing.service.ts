import { successResponse, errorResponse } from "../../utils/return";
import { IApiResponse } from "../../utils/return.types";
import { WeekendDayDynamicPricingRepository, WeekendPricing } from "../repository";
import { getRoomType, getDynamicPricingForProperty } from "../utils";
import { ICreateWeekendPricing, ICreateWeekendPricingS, ICWeekendPricingDays, IUWeekendPricingDays } from "../types";
export class WeekendDayDynamicPricingService {
    private weekendPricingRepo: WeekendDayDynamicPricingRepository;
    private weekendPricing: WeekendPricing;

    constructor() {
        this.weekendPricingRepo = new WeekendDayDynamicPricingRepository();
        this.weekendPricing = new WeekendPricing();
    }
    public async createWeekendPricing(data: ICreateWeekendPricingS,
        friDayPricing?: ICWeekendPricingDays,
        saturdayPricing?: ICWeekendPricingDays,
        sundayPricing?: ICWeekendPricingDays
    ): Promise<IApiResponse> {
        try {
            const roomTypeDetails = await getRoomType(data.roomId);
            if (!roomTypeDetails.success) {
                return errorResponse("Room type not found");
            }
            const dynamicPricing = await getDynamicPricingForProperty(data.propertyId);
            if (!dynamicPricing.success) {
                return errorResponse("Dynamic pricing not found");
            }
            const getWeekendPriceForRoom = await this.weekendPricing.getWeekendPricingForRoom(data.propertyId, data.roomId);
            if(getWeekendPriceForRoom?.weekDays.length===3) {
                return errorResponse(`Weekend pricing for all days already exists for this room`);
            }
            if (getWeekendPriceForRoom?.weekDays.find(day => day.day === "fri_day") && friDayPricing) {
                return errorResponse(`Weekend pricing for Friday already exists for this room`);
            }
            if (getWeekendPriceForRoom?.weekDays.find(day => day.day === "sat_day") && saturdayPricing) {
                return errorResponse(`Weekend pricing for Saturday already exists for this room`);
            }
            if (getWeekendPriceForRoom?.weekDays.find(day => day.day === "sun_day") && sundayPricing) {
                return errorResponse(`Weekend pricing for Sunday already exists for this room`);
            }
            const weekendPricingRepo = await this.weekendPricing.createWeekendPricing({
                propertyId: data.propertyId,
                dynamicPricingId: dynamicPricing.data.id,
                roomId: data.roomId,
                roomName: roomTypeDetails.data.roomName,
                roomType: roomTypeDetails.data.roomType,
            })
            if (friDayPricing) {
                await this.weekendPricingRepo.createWeekDayPricing({
                    day:"fri_day",
                    weekendPricingId: weekendPricingRepo.id,
                    adjustmentType: friDayPricing?.adjustmentType,
                    adjustmentValue: friDayPricing?.adjustmentValue,
                    currencyCode: friDayPricing?.currencyCode
                });
            }
            if (saturdayPricing) {
                await this.weekendPricingRepo.createWeekDayPricing({
                    day:"sat_day",
                    weekendPricingId: weekendPricingRepo.id,
                    adjustmentType: saturdayPricing?.adjustmentType,
                    adjustmentValue: saturdayPricing?.adjustmentValue,
                    currencyCode: saturdayPricing?.currencyCode
                });
            }
            if (sundayPricing) {
                await this.weekendPricingRepo.createWeekDayPricing({
                    day:"sun_day",
                    weekendPricingId: weekendPricingRepo.id,
                    adjustmentType: sundayPricing?.adjustmentType,
                    adjustmentValue: sundayPricing?.adjustmentValue,
                    currencyCode: sundayPricing?.currencyCode
                });
            }
            return successResponse("Weekend pricing created successfully", weekendPricingRepo);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(`Failed to create weekend pricing`, error.message);
            }
            return errorResponse("Failed to create weekend pricing");
        }
    }
    public async getWeekendPricingForProperty(propertyId: string): Promise<IApiResponse> {
        try {
            const weekendPricing = await this.weekendPricing.getWeekendPricing(propertyId);
            if (!weekendPricing) {
                return errorResponse("No weekend pricing found for this property");
            }
            return successResponse("Weekend pricing retrieved successfully", weekendPricing);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(`Failed to retrieve weekend pricing`, error.message);
            }
            return errorResponse("Failed to retrieve weekend pricing");
        }
    }

    public async deleteWeekendPricing(id: string): Promise<IApiResponse> {
        try {
            const deleted = await this.weekendPricing.deleteWeekendPricing(id);
            if (!deleted) {
                return errorResponse("Failed to delete weekend pricing");
            }
            return successResponse("Weekend pricing deleted successfully");
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(`Failed to delete weekend pricing`, error.message);
            }
            return errorResponse("Failed to delete weekend pricing");
        }
    }

    public async updateWeekendPricing(id: string, data: IUWeekendPricingDays): Promise<IApiResponse> {
        try {
            const updated = await this.weekendPricingRepo.updateForTotalWeekends(id, data);
            if (!updated) {
                return errorResponse("Failed to update weekend pricing");
            }
            return successResponse("Weekend pricing updated successfully", updated);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(`Failed to update weekend pricing`, error.message);
            }
            return errorResponse("Failed to update weekend pricing");
        }
    }
    public async updateWeekendDayPricing(id: string, data: IUWeekendPricingDays): Promise<IApiResponse> {
        try {
            const updated = await this.weekendPricingRepo.updateForASingleDay(id, data);
            if (!updated) {
                return errorResponse("Failed to update weekend day pricing");
            }
            return successResponse("Weekend day pricing updated successfully", updated);
        } catch (error) {
            if (error instanceof Error) {
                return errorResponse(`Failed to update weekend day pricing`, error.message);
            }
            return errorResponse("Failed to update weekend day pricing");
        }
    }
}