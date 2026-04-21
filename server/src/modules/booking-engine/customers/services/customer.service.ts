import { IApiResponse,successResponse,errorResponse, assignToken, assignCustomerToken, } from "../../../../common/utils";
import { config } from "../../../../config";
import { compareHash, createHash } from "../../../extranet/auth/utills/bcryptHelper";
import {CustomerRepository} from "../repositories";
import {
    ICCustomerS,
    ILoginBody,
    IUCustomer
} from "../types"
export class CustomerService{
    private customerRepository:CustomerRepository;
    constructor(
    ){
        this.customerRepository = new CustomerRepository();
    }
    public async createCustomer(data:ICCustomerS):Promise<IApiResponse>{
        try {
            const [customerByEmail,customerByPhone,deletedUserByEmail,deletedUserByPhone]=await Promise.all([
                this.customerRepository.getCustomerByEmail(data.email),
                this.customerRepository.getCustomerByPhoneNumber(data.mobilePhone),
                this.customerRepository.getCustomerByEmail(data.email,true),
                this.customerRepository.getCustomerByPhoneNumber(data.mobilePhone,true)
            ])
            if(customerByEmail){
                return errorResponse("Customer with this email already exists");
            }
            if(customerByPhone){
                return errorResponse("Customer with this phone number already exists");
            }
            if(deletedUserByEmail){
                return errorResponse("Account with this email was deleted previously, please contact support");
            }
            if(deletedUserByPhone){
                return errorResponse("Account with this phone number was deleted previously, please contact support");
            }
            const password = await createHash(data.password);
            await this.customerRepository.createCustomer({
                ...data,
                referralCode:"",
                referralLink:"",
                referralQRCode:"",
                password:password
            });
            return successResponse("Customer created successfully");
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to register as customer",error.message);
            }
            return errorResponse("Failed to register as customer","Unknown error occurred");
        }
    }
    public async updateCustomer(id:string,data:IUCustomer):Promise<IApiResponse>{
        try {
            const customer = await this.customerRepository.getCustomerById(id);
            if(!customer){
                return errorResponse("Customer not found");
            }
            const updatedCustomer = await this.customerRepository.updateCustomer(id,data);
            return successResponse("Customer updated successfully",updatedCustomer);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to update customer",error.message);
            }
            return errorResponse("Failed to update customer","Unknown error occurred");
        }
    }
    public async getCustomerById(id:string):Promise<IApiResponse>{
        try {
            const customer = await this.customerRepository.getCustomerById(id);
            if(!customer){
                return errorResponse("Customer not found");
            }
            return successResponse("Customer fetched successfully",customer);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to fetch customer",error.message);
            }
            return errorResponse("Failed to fetch customer","Unknown error occurred");
        }
    }
    public async deleteUser(id:string):Promise<IApiResponse>{
        try {
            const customer = await this.customerRepository.getCustomerById(id);
            if(!customer){
                return errorResponse("Customer not found");
            }
            const deletedCustomer = await this.customerRepository.deleteCustomer(id);
            return successResponse("Customer deleted successfully",deletedCustomer);
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to delete customer",error.message);
            }
            return errorResponse("Failed to delete customer","Unknown error occurred");
        }
    }
    public async loginUser(loginBody:ILoginBody):Promise<IApiResponse>{
        try {
            const customer = await this.customerRepository.getCustomerByEmail(loginBody.email);
            if(!customer){
                return errorResponse("User not found");
            }
            const isPasswordValid = await compareHash(loginBody.password,customer.password);
            if(!isPasswordValid ){
                return errorResponse("Invalid password for the user");
            }
            const accessToken: any = assignCustomerToken(
                    {
                        id: customer.id,
                        email: customer.email,
                        phoneNo: customer.mobilePhone,
                    },
                    config.customerJWTSecret!,
                    config.customerJWTExpiresIn!
                );
            return successResponse("Logged in successfully",{accessToken});
        } catch (error) {
            if(error instanceof Error){
                return errorResponse("Failed to login",error.message);
            }
            return errorResponse("Failed to login","Unknown error occurred");
        }
    }
}