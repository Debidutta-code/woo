import { ICustomer } from '.';

export interface ICReviewsR {
    propertyId: string;
    propertyCode: string;
    propertyName: string;
    customerId: string;
    rating: number;
    review: string;
}

export interface IReviews extends ICReviewsR {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}
export interface ICReviewsWProperty extends IReviews {
    Property: IPropertyFReviews;
}
export interface IPropertyFReviews {
    id: string;
    propertyName: string;
    propertyEmail: string;
    propertyContact: string;
    propertyCode: string;
    description: string;
}
export interface IReviewsWCustomer extends IReviews {
    Customer: ICustomer;
}
export interface IReviewsForPropertyWCustomer extends ICReviewsWProperty {
    Customer: ICustomer;
}
