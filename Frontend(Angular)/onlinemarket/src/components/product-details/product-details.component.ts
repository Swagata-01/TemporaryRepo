import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UserReviewComponent } from "../user-review/user-review.component";
import { FormsModule } from '@angular/forms';
import { CookieServiceService } from '../../services/cookie-service.service';
import { UserService } from '../../services/user.service';
import { IProductDTO } from '../../model/class/interface/Products';
import { Subscription, take } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { SubscriberListComponent } from '../subscriber-list/subscriber-list.component';

@Component({
  selector: 'app-product-details',
  imports: [CommonModule, RouterModule, UserReviewComponent, FormsModule, SubscriberListComponent],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
  providers: [CookieServiceService, UserService]
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  [x: string]: any;

  public stars: number[] = [1, 2, 3, 4, 5];
  public rating: number = 0;
  public reviewDescription: string = "";
  readonly MIN_REVIEW_LENGTH = 100;
  public reviewSubmitted: boolean = false;
  public reviewError: string = '';
  public loggedIn: boolean = false;
  userId: number | null = null;
  public product: any;
  isSubscribed: boolean = false; // Track subscription status for the current product
  userSubscription$: Subscription | undefined;
  userSpecificSubscriptions: IProductDTO[] = [];
  isSubscribing: boolean = false; // To prevent multiple submissions
  showReviewPopup: boolean = false;
  showSubscribePopup: boolean = false;

  userName: String = "";
  userNameSubscription: Subscription | undefined;

  showSubscribersPopup: boolean = false;
  isAdmin$: Subscription | undefined; // Observable to track admin status

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cookieService: CookieServiceService,
    public userService: UserService // Inject UserService
  ) { }

  updateLoginStatus(): void {
    this.loggedIn = this.cookieService.isLoggedIn();
    console.log('Logged In Status:', this.loggedIn);
  }

  isLoggedIn(): boolean {
    return this.cookieService.isLoggedIn();
  }

  ngOnInit() {
    this.updateLoginStatus();
    this.userId = this.userService.userId;
    const product_Id = this.route.snapshot.paramMap.get('id');
    if (product_Id) {
      this.fetchProductDetails(product_Id);
    } else {
      this.product = null;
    }
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (productId) {
        const productIdNumber = parseInt(productId, 10);
        this.isSubscribed = false; // Reset subscription state when loading a new product
        this.loadProductDetails(productIdNumber);
      } else {
        this.product = null;
        this.isSubscribed = false; // Reset even if no product ID
      }
    });
    this.userSubscription$ = this.userService.userId$.subscribe(() => {
      this.loadUserSubscriptionsAndCheckStatus();
    });

    // Subscribe to the isAdmin$ observable from the UserService
    this.isAdmin$ = this.userService.isAdmin$.subscribe(() => {
      // No need to assign to a local isAdmin property if you only use it in the template with async pipe
    });
  }

  fetchProductDetails(productId: string) {
    this.productService.viewProductDetails(productId).subscribe(
      (product: any) => {
        this.product = product;
      },
      (error: any) => {
        this.product = null;
        console.error('Error fetching product details:', error);
      }
    );
  }

  loadProductDetails(productId: number): void {
    this.http.get(`http://localhost:9090/OMP/viewProductDetails/${productId}`).subscribe(
      (product: any) => {
        this.product = product;
        this.loadUserSubscriptionsAndCheckStatus(); // Load subscriptions after product details
      },
      error => {
        this.product = null;
      }
    );
  }

  loadUserSubscriptionsAndCheckStatus(): void {
    if (this.loggedIn && this.userId) {
      this.userService.getProductSubscriptionList(this.userId).pipe(take(1)).subscribe({
        next: (subscriptions) => {
          this.userSpecificSubscriptions = subscriptions;
          console.log('User Subscriptions:', this.userSpecificSubscriptions);
          this.checkSubscriptionStatus();
        },
        error: (error) => {
          console.error('Error loading user subscriptions in product details:', error);
          this.userSpecificSubscriptions = [];
          this.checkSubscriptionStatus();
        }
      });
    } else {
      this.userSpecificSubscriptions = [];
      this.checkSubscriptionStatus();
    }
  }

  checkSubscriptionStatus(): void {
    if (this.loggedIn && this.userId && this.product?.productid && this.userSpecificSubscriptions) {
      this.isSubscribed = this.userSpecificSubscriptions.some(
        (sub) => sub.productid === this.product.productid
      );
    } else {
      this.isSubscribed = false;
    }
    console.log('Subscription Status:', this.isSubscribed);
  }

  ngOnDestroy(): void {
    if (this.userSubscription$) {
      this.userSubscription$.unsubscribe();
    }
    if (this.userNameSubscription) {
      this.userNameSubscription.unsubscribe();
    }
    if (this.isAdmin$) {
      this.isAdmin$.unsubscribe();
    }
  }

  fetchUserName(userId: number) {
    this.userNameSubscription = this.http.get<{ firstName: string }>(`http://localhost:9090/OMP/myDetails?userId=${userId}`, { responseType: 'json' }).subscribe(
      response => {
        this.userName = response?.firstName || 'Unknown User';
        console.log('Fetched username:', this.userName);
      },
      error => {
        console.error(`Error fetching user name for userId ${userId}:`, error);
        this.userName = 'Unknown User';
      }
    );
  }

  openSubscribePopup() {
    this.showSubscribePopup = true;
    if (this.loggedIn && this.userId && !this.userName) {
      this.fetchUserName(this.userId);
    }
  }

  closeSubscribePopup() {
    this.showSubscribePopup = false;
  }

  openReviewPopup() {
    this.showReviewPopup = true;
    this.reviewSubmitted = false;
    this.reviewError = '';
    if (this.loggedIn && this.userId && !this.userName) {
      this.fetchUserName(this.userId);
    }
  }

  closeReviewPopup() {
    this.showReviewPopup = false;
  }

  openSubscribersPopup() {
    this.showSubscribersPopup = true;
  }

  closeSubscribersPopup() {
    this.showSubscribersPopup = false;
  }

  rate(value: number): void {
    this.rating = value;
    console.log('User rated:', this.rating);
  }

  submitReview() {
    this.reviewSubmitted = false;
    this.reviewError = '';

    if (!this.rating) {
      this.reviewError = 'Please select a rating.';
      return;
    }

    if (!this.reviewDescription.trim()) {
      this.reviewError = 'Please enter a review description.';
      return;
    }

    if (this.reviewDescription.trim().length < this.MIN_REVIEW_LENGTH) {
      this.reviewError = `Review description must be at least ${this.MIN_REVIEW_LENGTH} characters long.`;
      return;
    }

    if (this.loggedIn && this.userId && this.product?.productid) {
      this.userService.addReview(
        this.product.productid,
        this.userId,
        this.rating,
        this.reviewDescription,
        true
      ).subscribe({
        next: (response) => {
          console.log('Review added successfully:', response);
          alert('Review Submitted successfully');
          this.reviewDescription = "";
          this.rating = 0;
          this.closeReviewPopup(); // Close review popup on success
        },
        error: (error) => {
          console.error('Error adding review:', error);
          this.reviewError = 'Failed to add review. Please try again later.';
        }
      });
    } else {
      console.warn('Missing required data to submit review.');
      this.reviewError = 'Could not submit review. Please ensure you are logged in.';
    }
  }

  toggleSubscription(): void {
    if (!this.loggedIn || !this.userId || !this.product?.productid || this.isSubscribing) {
      return;
    }
    this.isSubscribing = true;

    const productId = this.product.productid;
    const userId = this.userId;

    const subscriptionCall = this.isSubscribed
      ? this.userService.addSubscription(userId, productId) // If checked, we are now subscribing
      : this.userService.removeSubscription(userId, productId); // If unchecked, we are unsubscribing

    subscriptionCall.subscribe({
      next: (response) => {
        const message = this.isSubscribed ? 'Product Subscribed Successfully' : 'Product Unsubscribed Successfully';
        alert(message);
        this.loadUserSubscriptionsAndCheckStatus(); // Refresh the subscription list
        this.isSubscribing = false;
      },
      error: (error) => {
        console.error('Error toggling subscription:', error);
        alert(`Error: ${this.isSubscribed ? 'Subscribing' : 'Unsubscribing'} failed.`);
        // Revert the checkbox state on error
        this.isSubscribed = !this.isSubscribed;
        this.isSubscribing = false;
      }
    });
  }
}