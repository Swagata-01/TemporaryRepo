import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, switchMap, of } from 'rxjs';
import { Router } from '@angular/router';
import { CookieServiceService } from './cookie-service.service';
import { IUserDetails, IUserIdResponse, IProductDTO, IRatingDTO, IReview } from '../model/class/interface/Products';
import { catchError } from 'rxjs/operators';


interface User {
  id: string | number;
  email: string;
  isActive: boolean;
  userEmail : string;
 
}
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:9090/OMP';
  private userIdSubject = new BehaviorSubject<number | null>(null);
  userId$ = this.userIdSubject.asObservable();
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdminSubject.asObservable();
  userDetails: IUserDetails | null = null;
  private _userId: number | null = null; // Private backing field for userId

  constructor(private http: HttpClient, private cookieService: CookieServiceService, private router: Router) {
    this.loadUserIdFromLocalStorage();
    this.loadUserDetailsFromLocalStorage();
    this.userId$.subscribe(userId => {
      if (userId) {
        this.fetchAndUpdateAdminStatus(userId);
      } else {
        this.isAdminSubject.next(false);
      }
    });
  }

  private fetchAndUpdateAdminStatus(userId: number): void {
    this.getUserDetails(userId).subscribe({
      next: (details) => {
        this.isAdminSubject.next(details?.userRole === 'ADMIN');
        this.userDetails = details; // Update userDetails
        localStorage.setItem('userDetails', JSON.stringify(details)); // Keep local storage in sync
      },
      error: () => {
        this.isAdminSubject.next(false);
        this.userDetails = null;
        localStorage.removeItem('userDetails');
      }
    });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:9090/OMP/login', { email, password });
  }

  getUserIdByEmail(email: string): Observable<IUserIdResponse> {
    const params = new HttpParams().set('emailId', email);
    return this.http.get<IUserIdResponse>('http://localhost:9090/OMP/getUserIdByEmail', { params }).pipe(
      tap(response => this.setUserId(response)) // Set userId on successful retrieval
    );
  }

  getUserDetails(userId: number): Observable<IUserDetails> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<IUserDetails>('http://localhost:9090/OMP/myDetails', { params });
  }

  getProductSubscriptionList(userId: number): Observable<IProductDTO[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<IProductDTO[]>('http://localhost:9090/OMP/getProductSubscriptionList', { params });
  }

  getProductRatingList(userId: number): Observable<IRatingDTO[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<IRatingDTO[]>('http://localhost:9090/OMP/reviews/user/' + userId, { params });
  }

  register(formData: FormData): Observable<any> {
    return this.http.post('http://localhost:9090/OMP/register', formData, {
      headers: {
        'Accept': 'application/json'
      }
    });
  }

  // registerUser(addUser: any): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('firstName', addUser.firstName);
  //   formData.append('lastName', addUser.lastName);
  //   formData.append('nickName', addUser.nickName);
  //   formData.append('dateOfBirth', addUser.dob);
  //   formData.append('contactNumber', addUser.contactNo); // Corrected parameter name
  //   formData.append('addressLine1', addUser.addressL1);
  //   formData.append('addressLine2', addUser.addressL2);
  //   formData.append('email', addUser.email);
  //   formData.append('postalCode', addUser.postalCode);
  //   if (addUser.uploadPhoto) {
      
  //     formData.append('imageFile', addUser.uploadPhoto); // Ensure this matches the server's expected parameter name
  //   }
  //   formData.append('isAdmin', addUser.isAdmin.toString());
 
  //   return this.http.post(`${this.baseUrl}/admin/register`, formData);
  // }

  updateUser(userId: any, userData : any): Observable<any> {
    return this.http.put(`http://localhost:9090/OMP/updateUser/${userId}`, userData, {
      headers: {
        'Accept': 'application/json'
      }
    });
  }

  addReview(productId: number, userId: number, rating: number, review: string, reviewActiveStatus: boolean): Observable<any> {
    const params = new HttpParams()
      .set('productId', productId.toString())
      .set('userId', userId.toString())
      .set('rating', rating.toString())
      .set('review', review)
      .set('reviewActiveStatus', reviewActiveStatus.toString());

    return this.http.post<any>('http://localhost:9090/OMP/reviews/createReview', null, { params: params });
  }

  addSubscription(userId: number, productId: number): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('productId', productId.toString());
    return this.http.post<any>('http://localhost:9090/OMP/addSubscription', null, { params: params });
  }

  removeSubscription(userId: number, productId: number): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('productId', productId.toString());
    return this.http.put<any>('http://localhost:9090/OMP/removeSubscription', null, { params: params });
  }

  handleLoginSuccess(email: string): void {
    this.cookieService.setCookie(email);
    console.log('Login successful, fetching user ID for:', email);
    this.getUserIdByEmail(email).subscribe({
      next: (response: IUserIdResponse) => {
        this.setUserId(response); // Use the setter
        localStorage.setItem('userId', response.toString());
        console.log('User ID stored in local storage:', response);
        this.router.navigate(['/home']).then(() => {
          window.location.reload(); // Consider if full reload is necessary
        });
      },
      error: (err) => {
        console.error('Error fetching user ID:', err);
      },
    });
  }

  loadUserIdFromLocalStorage(): void {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      this.setUserId(parseInt(storedUserId, 10)); // Use the setter
      console.log('User ID loaded from local storage:', this._userId);
    }
  }

  loadUserDetailsFromLocalStorage(): void {
    const storedUserDetails = localStorage.getItem('userDetails');
    if (storedUserDetails) {
      try {
        this.userDetails = JSON.parse(storedUserDetails);
        console.log('User details loaded from local storage:', this.userDetails);
        this.isAdminSubject.next(this.userDetails?.userRole === 'ADMIN'); // Set initial admin status
      } catch (error) {
        console.error('Error parsing user details from local storage:', error);
        localStorage.removeItem('userDetails');
        this.isAdminSubject.next(false);
      }
    } else {
      this.isAdminSubject.next(false);
    }
  }

  saveUserDetailsToLocalStorage(details: IUserDetails): void {
    localStorage.setItem('userDetails', JSON.stringify(details));
    this.userDetails = details;
    console.log('User details saved to local storage:', this.userDetails);
  }

  clearUserDetails(): void {
    this.userDetails = null;
    localStorage.removeItem('userDetails');
  }

  setUserId(userId: number | null): void {
    this.userIdSubject.next(userId);
    this._userId = userId; // Update the backing field
    if (userId) {
      this.fetchAndUpdateAdminStatus(userId); // Fetch admin status when userId is set
    } else {
      this.isAdminSubject.next(false);
    }
  }

  get userId(): number | null {
    return this._userId; // Return the value of the backing field
  }

  watchUserId(): Observable<number | null> {
    return this.userId$;
  }

  updateReview(ratingId: number, userId: number | null, rating: number | null, review: string | null, reviewActiveStatus: boolean): Observable<any> {
    let params = new HttpParams().set('ratingId', ratingId.toString());
    if (userId !== null) params = params.set('userId', userId.toString());
    if (rating !== null) params = params.set('rating', rating.toString());
    if (review !== null) params = params.set('review', review);
    params = params.set('reviewActiveStatus', reviewActiveStatus.toString());
 
    return this.http.put<any>('http://localhost:9090/OMP/reviews/updateReview', {}, { params: params });
  }
 
  deleteReview(ratingId: number): Observable<any> {
    return this.updateReview(ratingId, null, null, null, false);
  }

  getUserProductReviews(userId: number): Observable<IReview[]> {
    // const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<IReview[]>('http://localhost:9090/OMP/reviews/all/user/' + userId); // Adjust the endpoint
  }
 
updateUserSubscriptions(userId: number, productIds: number[]): Observable<any> {
    const url = 'http://localhost:9090/OMP/getProductSubscriptionList'; // Adjust the endpoint for updating subscriptions
    return this.http.put(url, { productIds }); // Send the array of product IDs in the request body
  }
 
  getUserEmailById(userId: number): Observable<string | null> {
    return this.http.get(`${this.baseUrl}/getUserEmailById?id=${userId}`, { responseType: 'text' }).pipe(
      catchError(error => {
        console.error('Error fetching user email:', error);
        return of(null);
      })
    );
  }
 
  updateUserActiveStatus(userId: number, isActive: boolean): Observable<any> {
    return this.getUserEmailById(userId).pipe(
      switchMap((userEmail: string | null) => {
        if (userEmail) {
          const params = new HttpParams()
            .set('email', userEmail)
            .set('isActive', isActive.toString()); // Convert boolean to string
 
          return this.http.put(`${this.baseUrl}/admin/updateProfile`, null, { params });
        } else {
          console.error('User email not found for user ID:', userId);
          return of(null); // Or return an error Observable
        }
      })
    );
  }
 
  getUserById(userId: number): Observable<User | null> {
    const url = `${this.baseUrl}/users/${userId}`;
    return this.http.get<User>(url).pipe(
      catchError(this.handleError<User>(`getUserById id=${userId}`))
    );
  }
 
  // Generic error handling method
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
 

}