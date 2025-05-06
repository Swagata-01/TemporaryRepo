export interface IProductDTO{
    productid : number,
    name : String,
    imageUrl : String;
    description : String,
    avg_rating : number,
    subscription_count : number
}

export interface IReview { 
  ratingId: number;
  productid: number;
  productName: string;
  imageUrl: string;
  subscribersCount: number;
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
productName : String,
userId : number,
rating : number,
review : String,
reviewCreatedOn : Date,
reviewUpdatedOn : Date,
reviewDeletedOn : Date,
reviewActiveStatus : boolean
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




