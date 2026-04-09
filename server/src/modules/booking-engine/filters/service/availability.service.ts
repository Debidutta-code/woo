import {
    AvailabilityRepository,
    ChargeWithBaseAmounts,
} from '../repository/availability.repository';
import {
    DayAvailability,
    AvailabilityMapData,
    RateMapData,
    IInventoryData,
    AvailabilityResult,
} from '../types/availability.type';

export class AvailabilityService {
    private availabilityRepository: AvailabilityRepository;

    constructor() {
        this.availabilityRepository = new AvailabilityRepository();
    }

    /**
     * Generate all dates between start and end date
     */
    private generateDateRange(startDate: Date, endDate: Date): Date[] {
        const dates: Date[] = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }

    /**
     * Create availability map from inventory data
     */
    private createAvailabilityMap(
        inventoryData: IInventoryData[]
    ): Map<string, AvailabilityMapData> {
        const availabilityMap = new Map<string, AvailabilityMapData>();

        inventoryData.forEach(inv => {
            const dateKey = inv.date.toISOString().split('T')[0];
            availabilityMap.set(dateKey, {
                available: inv.availability > 0,
                availability: inv.availability,
            });
        });

        return availabilityMap;
    }

    /**
     * Create rate map from charge data
     */
    private createRateMap(
        ratesData: ChargeWithBaseAmounts[]
    ): Map<string, RateMapData> {
        const rateMap = new Map<string, RateMapData>();

        ratesData.forEach(charge => {
            const dateKey = charge.date.toISOString().split('T')[0];
            if (!rateMap.has(dateKey)) {
                const lowestRate = charge.baseGuestAmounts.reduce(
                    (min: number, curr) => Math.min(min, curr.amountBeforeTax),
                    Infinity
                );
                rateMap.set(dateKey, {
                    price:
                        lowestRate !== Infinity
                            ? Math.floor(lowestRate).toString()
                            : 'N/A',
                    currencyCode: charge.currencyCode,
                });
            }
        });

        return rateMap;
    }

    /**
     * Build days response array
     */
    private buildDaysResponse(
        dates: Date[],
        availabilityMap: Map<string, AvailabilityMapData>,
        rateMap: Map<string, RateMapData>
    ): DayAvailability[] {
        return dates.map(date => {
            const dateKey = date.toISOString().split('T')[0];
            const availability = availabilityMap.get(dateKey);
            const rate = rateMap.get(dateKey);

            return {
                checkIn: date.toISOString(),
                minPriceFormat: rate?.price || 'N/A',
                currencyCode: rate?.currencyCode || 'AED',
                available: availability?.available || false,
            };
        });
    }

    /**
     * Get hotel availability
     */
    async getHotelAvailability(
        hotelCode: string,
        checkIn?: string,
        checkOut?: string
    ): Promise<AvailabilityResult> {
        try {
            // Find property
            const property =
                await this.availabilityRepository.findPropertyByCode(hotelCode);

            if (!property) {
                return { success: false, error: 'Property not found' };
            }

            // Parse dates
            let startDate = checkIn ? new Date(checkIn) : new Date();
            let endDate = checkOut ? new Date(checkOut) : new Date();

            // Set to midnight for consistent comparison
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);

            // If no checkOut provided, show 30 days
            if (!checkOut) {
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 30);
            }

            // Generate all dates
            const dates = this.generateDateRange(startDate, endDate);

            // Get inventory and rates data
            const [inventoryData, ratesData] = await Promise.all([
                this.availabilityRepository.getInventoryByDateRange(
                    hotelCode,
                    dates
                ),
                this.availabilityRepository.getRatesByDateRange(
                    hotelCode,
                    dates
                ),
            ]);

            // Create maps
            const availabilityMap = this.createAvailabilityMap(inventoryData as IInventoryData[]);
const rateMap = this.createRateMap(ratesData);

            // Build response
            const days = this.buildDaysResponse(
                dates,
                availabilityMap,
                rateMap
            );

            return {
                success: true,
                hotelCode,
                totalDays: days.length,
                days,
            };
        } catch (error) {
            console.error('Error in getHotelAvailability service:', error);
            return {
                success: false,
                error: 'Failed to fetch availability data',
            };
        }
    }
}
