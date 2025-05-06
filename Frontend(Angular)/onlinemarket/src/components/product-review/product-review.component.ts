import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { IProductDTO, IRatingDTO } from '../../model/class/interface/Products';
 
interface ReviewViewModel extends IRatingDTO{
    isActive?: boolean;
    ratingId: number;
    productid: number;
    productName: String;
    userId: number;
    rating: number;
    review: String;
    reviewCreatedOn: Date;
    reviewUpdatedOn: Date;
    reviewDeletedOn: Date;
    reviewActiveStatus: boolean;
    
  }
 
@Component({
    selector: 'app-product-review',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './product-review.component.html',
    styleUrls: ['./product-review.component.css']
})
export class ProductReviewComponent implements OnInit, OnDestroy {
    userId: number | null = null;
    reviews: ReviewViewModel[] = [];
    userIdReview: Subscription | undefined;
    showReviewPopup: boolean = false;
    updateSuccessMessage: string | null = null;
    errorMessage: string | null = null;
 
    constructor(private userService: UserService, private router: Router) { }
 
    ngOnInit(): void {
        this.userIdReview = this.userService.watchUserId().subscribe(id => {
            this.userId = id;
            if (this.userId) {
                this.loadUserReviews();
            } else {
                console.warn('User ID not available.');
            }
        });
    }
 
    ngOnDestroy(): void {
        if (this.userIdReview) {
            this.userIdReview.unsubscribe();
        }
    }
 
    loadUserReviews(): void {
        if (this.userId) {
          this.userService.getProductRatingList(this.userId).subscribe({
            next: (data) => {
              this.reviews = data.map(review => ({
                isActive: review.reviewActiveStatus,
                ratingId: review.ratingId,
                productid: review.productid,
                productName: review.productName,
                userId: review.userId,
                rating: review.rating,
                review: review.review,
                reviewCreatedOn: review.reviewCreatedOn,
                reviewUpdatedOn: review.reviewUpdatedOn,
                reviewDeletedOn: review.reviewDeletedOn,
                reviewActiveStatus: review.reviewActiveStatus,
                // You are not assigning name, description, avg_rating, subscription_count here
              } as ReviewViewModel)); // Explicitly cast to ReviewViewModel
              console.log('User Reviews:', this.reviews);
            },
            error: (error) => {
              console.error('Error loading reviews:', error);
              this.errorMessage = 'Error Loading reviews';
              setTimeout(() => this.errorMessage = null, 3000);
            }
          });
        }
      }
 
    inactivateReview(review: ReviewViewModel): void {
        review.isActive = false;
    }
    markForDeletion(review: ReviewViewModel): void {
        review.isActive = false; // Visually indicate it's marked for deletion
    }
 
    deleteReview(reviewToDelete: ReviewViewModel): void {
        if (confirm(`Are you sure you want to remove your review for ${reviewToDelete.productName}?`)) {
          this.userService.updateReview(
            reviewToDelete.ratingId,
            null,                  
            null,                
            null,            
            false                  
          ).subscribe({
            next: (response) => {
              console.log('Review marked for removal successfully:', response);
              this.updateSuccessMessage = `Review for ${reviewToDelete.productName} removed.`;
              this.loadUserReviews(); // Reload reviews to reflect the update
              setTimeout(() => this.updateSuccessMessage = null, 3000);
            },
            error: (error) => {
              console.error('Error marking review for removal:', error);
              this.errorMessage = `Error removing review for ${reviewToDelete.productName}.`;
              setTimeout(() => this.errorMessage = null, 3000);
            }
          });
        }
      }
 
    submitReviews(): void {
        const activeReviews = this.reviews.filter(review => review.isActive);
        console.log('Active reviews to submit:', activeReviews);
        this.updateSuccessMessage = 'Reviews Updated Successfully';
        setTimeout(() => this.updateSuccessMessage = null, 3000);
    }
 
    openReviewPopup(): void {
        this.showReviewPopup = true;
        this.updateSuccessMessage = null;
        if (this.userId && (!this.reviews || this.reviews.length === 0)) {
            this.loadUserReviews();
        }
    }
 
    closeReviewPopup(): void {
        this.showReviewPopup = false;
        this.updateSuccessMessage = null;
    }
}