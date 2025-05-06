import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { UserService } from '../../services/user.service'; // Import UserService

interface Review {
  userId: number;
  rating: number;
  review: string;
  userName?: string; // Add userName property
  productName: string;
  reviewCreatedOn: string;
}

@Component({
  selector: 'app-user-review',
  imports: [CommonModule],
  templateUrl: './user-review.component.html',
  styleUrls: ['./user-review.component.css'],
  providers: [UserService] // Provide UserService here
})
export class UserReviewComponent implements OnInit {
  reviews: Review[] = [];
  highestRatedReview: Review | null = null;
  showPopup = false;
  productId: number = 0;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    public userService: UserService // Inject UserService (make it public to access in the template)
  ) {}

  ngOnInit() {
    this.productId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchReviews();
    this.fetchHighestRatedReview();
  }

  fetchReviews() {
    this.http
      .get<Review[]>(
        `http://localhost:9090/OMP/reviews/getSpecificProductReviews?productId=${this.productId}`,
        { responseType: 'json' }
      )
      .subscribe(
        (data) => {
          this.reviews = data;
          this.reviews.forEach((review) => {
            this.fetchUserName(review.userId);
          });
        },
        (error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            console.error('Client-side error:', error.error.message);
          } else {
            console.error(`Server-side error: ${error.status} - ${error.message}`);
          }
        }
      );
  }

  fetchHighestRatedReview() {
    this.http
      .get<Review>(
        `http://localhost:9090/OMP/reviews/highestRatedReview?productId=${this.productId}`,
        { responseType: 'json' }
      )
      .subscribe(
        (review) => {
          this.highestRatedReview = review;
          this.fetchUserNameForHighestRated(review.userId);
        },
        (error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            console.error('Client-side error:', error.error.message);
          } else {
            console.error(`Server-side error: ${error.status} - ${error.message}`);
          }
        }
      );
  }

  fetchUserName(userId: number) {
    this.http
      .get<{ firstName: string }>(`http://localhost:9090/OMP/myDetails?userId=${userId}`, {
        responseType: 'json',
      })
      .subscribe(
        (response) => {
          const review = this.reviews.find((r) => r.userId === userId);
          if (review) {
            review.userName = response?.firstName || 'Unknown User';
          }
        },
        (error) => {
          console.error(`Error fetching user name for userId ${userId}:`, error);
          const review = this.reviews.find((r) => r.userId === userId);
          if (review) {
            review.userName = 'Unknown User';
          }
        }
      );
  }

  fetchUserNameForHighestRated(userId: number) {
    this.http
      .get<{ firstName: string }>(`http://localhost:9090/OMP/myDetails?userId=${userId}`, {
        responseType: 'json',
      })
      .subscribe(
        (response) => {
          if (this.highestRatedReview && this.highestRatedReview.userId === userId) {
            this.highestRatedReview.userName = response?.firstName || 'Unknown User';
          }
        },
        (error) => {
          console.error(`Error fetching user name for userId ${userId}:`, error);
          if (this.highestRatedReview && this.highestRatedReview.userId === userId) {
            this.highestRatedReview.userName = 'Unknown User';
          }
        }
      );
  }

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  exportToExcel() {
    if (this.reviews && this.reviews.length > 0) {
      const formattedReviews = this.reviews.map((review) => ({
        'User ID': review.userId,
        'User Name': review.userName || 'Unknown',
        'Product Name': review.productName,
        'Rating': review.rating,
        'Review': review.review,
        'Added Date': review.reviewCreatedOn,
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedReviews);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Reviews');
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, `product_${this.productId}_reviews`);
    } else {
      alert('No reviews available for this product to export.');
    }
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    saveAs(data, fileName + '.xlsx');
  }
}