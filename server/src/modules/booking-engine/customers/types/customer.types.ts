export interface ICCustomerS {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobilePhone: string;
    promotionalEmailEnabled: boolean;
}
export interface IUCustomer {
    firstName: string;
    lastName: string;
    promotionalEmailEnabled: boolean;
}
export interface ICCustomerR {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    mobilePhone: string;
    referralCode: string | null;
    referralLink: string | null;
    referralQRCode: string | null;
    promotionalEmailEnabled: boolean;
}
export interface ICustomer extends ICCustomerR {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    metaData: any;
}
export interface ILoginBody{
    email:string;
    password:string;
}