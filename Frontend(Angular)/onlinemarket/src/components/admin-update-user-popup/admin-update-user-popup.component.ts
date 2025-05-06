// import { CommonModule } from '@angular/common';
// import { Component, Output, EventEmitter, Input } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { ProductReviewComponent } from '../product-review/product-review.component';
// import { ProductSubscriptionsComponent } from '../product-subscriptions/product-subscriptions.component';
// import { ProfileComponent } from '../profile/profile.component';
// import { UserService } from '../../services/user.service';
// import { IUserDetails } from '../../model/class/interface/Products';
 
// @Component({
//     selector: 'app-admin-update-user-popup',
//     standalone: true,
//     imports: [FormsModule, CommonModule, ProductReviewComponent, ProductSubscriptionsComponent, ProfileComponent],
//     templateUrl: './admin-update-user-popup.component.html',
//     styleUrls: ['./admin-update-user-popup.component.css']
// })
// export class UpdateUserPopupComponent {
//     @Input() isUpdateUserPopupVisible: boolean = false;
//     @Output() close = new EventEmitter<void>();
//     @Output() submit = new EventEmitter<any>();
 
//     searchEmail: string = '';
//     foundUser: IUserDetails | null = null;
//     userNotFoundMessage: string | null = null;
//     showProfile: boolean = false;
//     showSubscriptions: boolean = false;
//     showReviews: boolean = false;
 
//     constructor(private userService: UserService) { } // Inject your UserService
 
//     openPopup() {
//         this.isUpdateUserPopupVisible = true;
//         this.foundUser = null;
//         this.userNotFoundMessage = null;
//         this.searchEmail = '';
//         this.showProfile = false;
//         this.showSubscriptions = false;
//         this.showReviews = false;
//     }
 
//     closePopup() {
//         this.isUpdateUserPopupVisible = false;
//         this.close.emit();
//     }
 
//     searchUserByEmail() {
//         this.userNotFoundMessage = null;
//         this.foundUser = null;
//         if (this.searchEmail) {
//           this.userService.getUserIdByEmail(this.searchEmail).subscribe({
//             next: (userId: number) => { // Expecting a number (the userId)
//               this.loadUserDetails(userId);
//             },
//                 error: (error) => {
//                     console.error('Error searching user:', error);
//                     this.userNotFoundMessage = 'User with this email not found.';
//                 }
//             });
//         } else {
//             this.userNotFoundMessage = 'Please enter an email to search.';
//         }
//     }
 
//     loadUserDetails(userId: number) {
//       this.userService.getUserDetails(userId).subscribe({
//           next: (userDetails: IUserDetails) => {
//               this.foundUser = userDetails;
//           },
//           error: (error) => {
//               console.error('Error fetching user details:', error);
//               this.userNotFoundMessage = 'Error fetching user details.';
//               this.foundUser = null; // Ensure foundUser is null if details fetch fails
//           }
//       });
//     }
 
//     submitForm() {
//         if (this.foundUser) {
//             console.log('Submit clicked with user:', this.foundUser);
//             this.submit.emit(this.foundUser); // Emit the updated user data
//         } else {
//             console.warn('No user found to submit.');
//             this.userNotFoundMessage = 'Please search for a user before submitting.';
//         }
//     }
 
//     viewProfile() {
//         this.showProfile = true;
//         this.showSubscriptions = false;
//         this.showReviews = false;
//     }
 
//     viewSubscriptions() {
//         this.showProfile = false;
//         this.showSubscriptions = true;
//         this.showReviews = false;
//     }
 
//     viewReviews() {
//         this.showProfile = false;
//         this.showSubscriptions = false;
//         this.showReviews = true;
//     }
// }
 
// -------------------------------------------------------------------------------------------------------------------
 
// above is using components code
 
import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { ProductService } from '../../services/product.service';
import { IProductDTO } from '../../model/class/interface/Products';
import { IReview } from '../../model/class/interface/Products';
import { catchError, tap, switchMap, finalize } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
 
interface IUserIdResponse {
    userId: number;
}
 
interface IUserDetails {
    userID: string | number;
    email: string;
    isActive: boolean;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    contactNumber?: string;
    postalCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    // Add other relevant user properties
}
 
interface ISubscription {
    id: number;
    productId: number;
    productName: string;
    imageUrl: string;
    subscribersCount: number;
    averageRating: number;
    isSelected: boolean;
}
 
// interface IReview {
//     reviewId: number;
//     productId: number;
//     productName: string;
//     imageUrl: string;
//     subscribersCount: number;
//     averageRating: number;
//     userRating: number;
//     userComment: string;
//     reviewActiveStatus : boolean
// }
 
@Component({
    selector: 'app-admin-update-user-popup',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './admin-update-user-popup.component.html',
    styleUrls: ['./admin-update-user-popup.component.css']
})
export class UpdateUserPopupComponent implements OnInit, OnDestroy {
    @Input() isUpdateUserPopupVisible: boolean = false;
    @Output() close = new EventEmitter<void>();
    @Output() submit = new EventEmitter<any>();
 
    searchEmail: string = '';
    foundUser: IUserDetails | null = null;
    userNotFoundMessage: string | null = null;
    showProfileSection: boolean = false;
    showSubscriptionsSection: boolean = false;
    //showReviewsSection: boolean = false;
 
    areReviewsVisible: boolean = false;
 
    userSubscriptions: ISubscription[] = [];
    userReviews: IReview[] = [];
 
    public currentUserId: number | null = null;
    public currentUser: any = {};
 
    constructor(private userService: UserService,
       private productService: ProductService,
       private http: HttpClient,
       private route: ActivatedRoute) { }
 
    ngOnInit(): void {
        if (this.currentUserId) {
            this.loadUserReviews(this.currentUserId); // Load all reviews on init if user ID is available
          }
        this.route.params.subscribe(params => {
          this.currentUserId = +params['id'];
            if (this.currentUserId) {
              this.loadUserDetails(this.currentUserId); // Load user details
              this.loadUserReviews(this.currentUserId);
            }
          });
        // this.loadUserDetails(this.currentUserId!);
    }
 
    ngOnDestroy(): void {
        // Clean up subscriptions if any
    }
 
    openPopup() {
        this.isUpdateUserPopupVisible = true;
        this.foundUser = null;
        this.userNotFoundMessage = null;
        this.searchEmail = '';
        this.showProfileSection = false;
        this.showSubscriptionsSection = false;
        this.showReviewsSection = false;
        this.userSubscriptions = [];
        this.userReviews = [];
        this.currentUserId = null;
    }
 
    closePopup() {
        this.isUpdateUserPopupVisible = false;
        this.close.emit();
    }
 
    searchUserByEmail() {
        this.userNotFoundMessage = null;
        this.foundUser = null;
        this.showProfileSection = false;
        this.showSubscriptionsSection = false;
        this.showReviewsSection = false;
        this.userSubscriptions = [];
        this.userReviews = [];
        this.currentUserId = null;
 
        if (this.searchEmail) {
            this.userService.getUserIdByEmail(this.searchEmail).subscribe({
                next: (userId: number) => {
                    this.currentUserId = userId;
                    this.loadUserDetails(this.currentUserId);
                    this.loadUserSubscriptions(this.currentUserId);
                    this.loadUserReviews(this.currentUserId);
                },
                error: (error) => {
                    console.error('Error searching user ID:', error);
                    this.userNotFoundMessage = 'User with this email not found.';
                }
            });
        } else {
            this.userNotFoundMessage = 'Please enter an email to search.';
        }
    }
 
    loadUserDetails(userId: number) {
        this.userService.getUserDetails(userId).subscribe({
            next: (userDetails: any) => {
                this.foundUser = userDetails;
                this.currentUser = {...userDetails};
                console.log('User details fetched:', this.currentUser);
            },
            error: (error) => {
                console.error('Error fetching user details:', error);
                this.userNotFoundMessage = 'Error fetching user details.';
                this.foundUser = null;
                this.currentUser = {};
            }
        });
    }
 
    loadUserSubscriptions(userId: number) {
        this.userService.getProductSubscriptionList(userId).subscribe({ // Assuming this service method exists
          next: (productDTOs: IProductDTO[]) => {
            this.userSubscriptions = productDTOs.map(dto => ({
                productId: dto.productid,
                productName: dto.name,
                imageUrl: dto.imageUrl,
                subscribersCount: dto.subscription_count,
                averageRating: dto.avg_rating,
                isSelected: false // Initialize isSelected
            } as ISubscription)); // Initialize isSelected
            },
            error: (error) => {
                console.error('Error fetching user subscriptions:', error);
                // Optionally display an error message
            }
        });
    }
 
    showReviews(userId: number) {
        this.areReviewsVisible = true;
        this.loadUserReviews(userId); // Load all reviews when the section is shown
    }
 
    loadUserReviews(userId: number) {
        this.userService.getUserProductReviews(userId).subscribe({ // Assuming this service method exists
            next: (reviews: IReview[]) => {
                console.log('Reviews fetched:', reviews);
                this.userReviews = reviews;
            },
            error: (error) => {
                console.error('Error fetching user reviews:', error);
                // Optionally display an error message
            }
        });
    }
 
    submitMainForm() {
      if (this.foundUser) {
        console.log('Submitting user data with ID:', this.foundUser.userID, this.foundUser);
        this.submit.emit(this.foundUser); // Emit the foundUser object
      } else {
        console.warn('No user found or user ID is missing on submit.');
        this.userNotFoundMessage = 'Please search for a user before submitting.';
      }
    }
 
    submitProfileChanges() {
        if (this.foundUser) {
          console.log('Saving profile changes for:', this.foundUser);
          this.userService.updateUser(this.foundUser.userID, this.foundUser).pipe(
            tap(response => {
              console.log('Profile changes saved successfully:', response);
              // Optionally provide feedback to the user (e.g., a success message)
            }),
            catchError(error => {
              console.error('Error saving profile changes:', error);
              // Optionally display an error message to the user
              return of(null);
            })
          ).subscribe();
        } else {
          console.warn('No user found to update profile.');
          // Optionally inform the user that no user was found
        }
      }
   
 
    submitSubscriptionChanges() {
        const selectedSubscriptions = this.userSubscriptions
          .filter(sub => sub.isSelected)
          .map(sub => sub.productId);
   
        if (this.currentUserId) {
          console.log('Updating subscriptions for user:', this.currentUserId, selectedSubscriptions);
          this.userService.updateUserSubscriptions(this.currentUserId, selectedSubscriptions).pipe(
            tap(response => {
              console.log('Subscriptions updated successfully:', response);
              // Optionally provide feedback to the user
            }),
            catchError(error => {
              console.error('Error updating subscriptions:', error);
              // Optionally display an error message
              return of(null);
            })
          ).subscribe();
        } else {
          console.warn('No user ID available to update subscriptions.');
          // Optionally inform the user
        }
    }
   
 
    deleteReview(reviewId: number) {
        if (this.currentUserId) {
          console.log('Deleting review:', reviewId, 'for user:', this.currentUserId);
     
          this.productService.updateReviewStatus(reviewId, this.currentUserId, false).pipe(
            tap(response => {
              // Backend deletion successful, now update the frontend
              console.log('Review deleted successfully from backend:', response);
              this.userReviews = this.userReviews.filter(review => review.ratingId !== reviewId);
              // Optionally, you can emit an event or show a success message
            }),
            catchError(error => {
              // Handle backend deletion error
              console.error('Error deleting review from backend:', error);
              // Optionally, show an error message to the user
              return of(null); // Or throw the error again if you want the observable to error out
            })
          ).subscribe(); // Don't forget to subscribe to trigger the observable
        }
    }
 
    submitReviewChanges() {
      if (this.currentUserId && this.userReviews) {
        console.log('Saving review changes for user:', this.currentUserId, this.userReviews);
   
        forkJoin( // Use forkJoin to wait for all updates to complete
          this.userReviews.map(review => {
            const params = new HttpParams()
              .set('ratingId', review.ratingId ? review.ratingId.toString() : '') // Assuming ratingId exists
              .set('userId', this.currentUserId ? this.currentUserId.toString() : '')
              .set('rating', review.rating ? review.rating.toString() : '')
              .set('review', review.review ? review.review : '')
              .set('reviewActiveStatus', review.reviewActiveStatus ? review.reviewActiveStatus.toString() : '');
   
            return this.http.put(
              'http://localhost:9090/OMP/reviews/updateReview',
              null, // No body, parameters are in the URL
              { params }
            ).pipe(
              tap(response => console.log('Review updated:', response)),
              catchError(error => {
                console.error('Error updating review:', error);
                return of(error); // Or handle the error as needed
              })
            );
          })
        ).subscribe(results => {
          console.log('All review updates completed', results);
          // Optionally, show a success message or reload data
        });
      }
    }
 
    private _showReviewsSection = false;
 
    set showReviewsSection(value: boolean) {
        this._showReviewsSection = value;
        if (value && this.currentUserId) {
          this.areReviewsVisible = true; // Make the review grid visible
          this.loadUserReviews(this.currentUserId); // Load ALL reviews
        } else {
          this.areReviewsVisible = false;
          this.userReviews = [];
        }
    }
   
    get showReviewsSection(): boolean {
        return this._showReviewsSection;
    }
   
    toggleReviewStatus(review: IReview) {
        const newStatus = !review.reviewActiveStatus;
        this.productService.updateReviewStatus(review.ratingId, this.currentUserId, newStatus) // Assuming this service method exists
          .pipe(
            tap(response => {
              console.log('Review status updated:', response);
              // Update the local array to reflect the change immediately
              review.reviewActiveStatus = newStatus;
            }),
            catchError(error => {
              console.error('Error updating review status:', error);
              // Optionally show an error message
              return of(null);
            })
          )
          .subscribe();
    }
    getProductImage(productId: number): string {
        // Replace this with your actual logic to fetch the image URL
        console.log("Get Image method called");
        return `http://localhost:9090/OMP/product/image/${productId}`;
      }
   
    updateUserActiveStatus(event: any): void {
      const isActive = event.target.checked;
      if (this.currentUserId && this.foundUser) {
          this.userService.updateUserActiveStatus(this.currentUserId, isActive).subscribe({
            next: (response) => {
              console.log('User active status updated in backend:', response);
              this.foundUser!.isActive = isActive; // Update the local foundUser object
              // Optionally, show a success message
            },
            error: (error) => {
              console.error('Error updating user active status in backend:', error);
              // Optionally, revert the UI change or show an error message
            }
          });
        }
      }
 
    onActiveStatusChange(event: any) {
        this.updateUserActiveStatus(event.target.checked);
    }
 
    deleteSubscription(productIdToDelete: number, index: number): void {
      if (this.currentUserId && productIdToDelete && confirm('Are you sure...?')) {
        this.userService.removeSubscription(this.currentUserId, productIdToDelete).subscribe({
          next: (response) => {
            console.log('Subscription removed successfully:', response);
            this.userSubscriptions.splice(index, 1);
            // Optionally update UI or show success message
          },
          error: (error) => {
            console.error('Error removing subscription:', error);
            // Optionally show error message
          }
        });
      } else {
        console.warn('User ID or Product ID is missing.');
      }
    }
}
 
 