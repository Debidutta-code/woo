import {createPolicyService,getPoliciesByHotelCodeService,addPolicyToRatePlanService, deletePolicyService, updatePolicyService} from "./policy.services";
import {fetchRatePlansService} from "../../rate-plan/services"
export{
    createPolicyService,
    getPoliciesByHotelCodeService as getPoliciesService,
    fetchRatePlansService, 
    updatePolicyService,
    addPolicyToRatePlanService,
    deletePolicyService
}