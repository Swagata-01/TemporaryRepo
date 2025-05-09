export interface IProductDTO{
  productid : number,
  name : string,
  imageUrl? : string; // Make imageUrl optional
  description? : string, // Make description optional
  avg_rating : number,
  subscription_count : number
}
 
export interface IReview {
  ratingId: number;
  productid: number;
  productName: string;
  imageUrl? : string; // Make imageUrl optional
  subscribersCount?: number; // Make subscribersCount optional
  averageRating: number;
  rating: number;
  review: string;
  reviewActiveStatus : boolean
}
 
export interface ISigninResponse{
  message : String,
  success : boolean,
  email : String
}
 
export interface IRatingDTO extends IProductDTO{
ratingId : number,
productid : number,
productName : string,
userId : number,
rating : number,
review : string,
reviewCreatedOn : Date,
reviewUpdatedOn : Date,
reviewDeletedOn : Date,
reviewActiveStatus : boolean,
subscribersCount?: number;
imageUrl? : string;
description? : string;
}
 
export type IUserIdResponse = number;
 
 
export interface IUserDetails {
  userID: number;
  firstName: string;
  lastName: string;
  email: string;
  nickName: string;
  address: string;
  photo: string;
  contactNumber: string;
  dateOfBirth: string;
  userRole: string;
  emailVerification: boolean;
  isActive: boolean;
  createdOn: string;
  updatedOn: string;
}
 
