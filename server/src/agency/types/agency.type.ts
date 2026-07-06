import { AgencyType, AgentCommissionType } from './agency-application.types';
import { IAgents } from './agents.types';
import { IAgenticProperty } from './agentic-property.type';
import { CurrencyCode } from '../../tax-system/interfaces/tourist-tax.type';

export interface ICAgency {
    agencyName: string;
    agencyType: AgencyType;
    agencyEmail: string;
    contactNo: string;
    taxNo: string;
    commissionType: AgentCommissionType;
    commissionValue: number;
    commissionCurrency: CurrencyCode | null;
    iataCode: string;
    address: string;
}
export interface IAgency extends ICAgency {
    id: string;
    isDeleted: boolean;
}
export interface IAgencyWD extends IAgency {
    Agents: IAgents[];
    AgenticProperties: IAgenticProperty[];
}