import { IPropertyFReviews } from ".";

export interface ICWishlistR{
    customerId:string;
    propertyId:string;
    propertyCode:string;
    propertyName:string;
    
    roomId:string|null;
    roomType:string|null;
    roomName:string|null;

}
export interface IWishlist extends ICWishlistR{
    id:string;
    createdAt:Date;
    updatedAt:Date;
}
export interface IWishlistWProperty extends IWishlist{
    Property:IPropertyFReviews;
}