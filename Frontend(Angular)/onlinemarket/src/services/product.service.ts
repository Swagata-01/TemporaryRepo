
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IProductDTO } from '../model/class/interface/Products';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { IReview } from '../model/class/interface/Products';

interface ProductView {
  productid: number;
  name: string;
  imageUrl: string;
  description: string;
  avg_rating: number;
  subscription_count: number;
}
interface UserDetail {
  firstName: string;
  lastName: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  dateOfBirth: string;
  postalCode: number;
  userId: number;

}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getTopSubscribedProducts(): Observable<IProductDTO[]> {
    return this.http.get<IProductDTO[]>("http://localhost:9090/OMP/topSubscribedProduct");
  }

  getTopRatedProducts(): Observable<IProductDTO[]> {
    return this.http.get<IProductDTO[]>("http://localhost:9090/OMP/topRatedProducts");
  }

  getProductList(): Observable<any> {
    return this.http.get("http://localhost:9090/OMP/viewAllProducts");
  }

  private baseUrl = 'http://localhost:9090/OMP'; // Update with your backend URL

  addProduct(name: string, description: string, imageFile: File, isActive: boolean): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('imageFile', imageFile);
    formData.append('isActive',isActive.toString());

    return this.http.post(`${this.baseUrl}/admin/addProduct`, formData);
  }

  updateProduct(name: string, upName: string, description: string, imageFile?: File, isActive?: boolean): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('name', name);
    if (upName) formData.append('upName', upName);
    if (description) formData.append('description', description);
    if (imageFile) {
      formData.append('file', imageFile, imageFile.name);
    }
    if (isActive !== undefined) formData.append('isActive', isActive.toString());

    return this.http.put(`${this.baseUrl}/admin/updateProduct/${name}`, formData);
  }

  uploadMultipleProducts(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/admin/uploadMultipleRecords`, formData);
  }

  getProductImageByName(name: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/product/imageByName/${name}`, { responseType: 'blob' });
  }


  private searchResultsSource = new BehaviorSubject<any[]>([]);
  searchResults$ = this.searchResultsSource.asObservable();
 
  setSearchResults(results: any[]) {
    this.searchResultsSource.next(results);
  }
 
  searchProduct(productName: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/searchProductByName`, { params: { productName } });
  }


  searchProductByName(productName: string): Observable<ProductView[]>{
    return this.http.get<[]>(`http://localhost:9090/OMP/searchProductByName?productName=${productName}`);
  }
 
  searchProductBySubsCount(count: number) {
    return this.http.get<[]>(`http://localhost:9090/OMP/searchProductBySubsCount?count=${count}`);
  }
 
  searchProductByRating(rating: number) {
    return this.http.get<[]>(`http://localhost:9090/OMP/searchProductByRating?rating=${rating}`);
  }
 
  searchProductBySubsCountAndRating(count: number, rating: number) {
    return this.http.get<[]>(`http://localhost:9090/OMP/searchProductBySubsCountAndRating?count=${count}&rating=${rating}`);
  }
 
  searchProductByNameAndSubsCount(productName: string, count: number) {
    return this.http.get<[]>(`http://localhost:9090/OMP/searchProductByNameAndSubsCount?name=${productName}&count=${count}`);
  }
 
  searchProductByNameAndRating(productName: string, rating: number) {
    return this.http.get<[]>(`http://localhost:9090/OMP/searchProductByNameAndRating?name=${productName}&rating=${rating}`);
  }
 
  searchProductByNameSubsRating(productName: string, rating: number, count: number) {
    return this.http.get<[]>(`http://localhost:9090/OMP/searchProductByNameSubsRating?name=${productName}&rating=${rating}&count=${count}`);
  }
  viewProductDetails(productId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/viewProductDetails/${productId}`);
  }
 
  getProductSubscriptionList(productId: number): Observable<UserDetail[]> {
    return this.http.get<UserDetail[]>(`${this.baseUrl}/viewUsersSubscribedToProduct?productId=${productId}`);
  }


  updateUserReviews(userId: number, reviews: IReview[]): Observable<any> {
    const url = 'http://localhost:9090/OMP/reviews/updateReview'; // Adjust your backend API endpoint
    return this.http.put(url, reviews); // Send the array of updated reviews in the request body
  }
 
  updateReviewStatus(reviewId: number, userId: number | null, isActive: boolean): Observable<any> {
    const params = new HttpParams()
      .set('ratingId', reviewId.toString())
      .set('userId', userId ? userId.toString() : '')
      .set('reviewActiveStatus', isActive.toString());
 
    return this.http.put('http://localhost:9090/OMP/reviews/updateReview', null, { params }); // Reusing your existing update endpoint
  }
 

}