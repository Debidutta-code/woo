import {fetchRoomTypesService} from "../../inventory/services";
import {fetchRatePlansService} from "../../rate-plan/services";
import {createMappingService, getMappedRatePlansService, updateMappedPriceService,getMultiRoomRentPriceService, deleteMappingService} from "./mapRatePlan.service";
import {useStartStopSellService} from "./start-stop-sell.service";
export{
    fetchRatePlansService,
    fetchRoomTypesService,
    createMappingService,
    getMappedRatePlansService,
    updateMappedPriceService,
    useStartStopSellService,
    getMultiRoomRentPriceService,
    deleteMappingService
}