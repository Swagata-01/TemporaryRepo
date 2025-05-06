import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { from, Subscription } from 'rxjs';
import { IProductDTO } from '../../model/class/interface/Products';
import { FormsModule } from '@angular/forms';
 
interface SubscriptionViewModel extends IProductDTO {
    isSelectedToRemove: boolean;
}
 
@Component({
    selector: 'app-product-subscriptions',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './product-subscriptions.component.html',
    styleUrl: './product-subscriptions.component.css'
})
export class ProductSubscriptionsComponent implements OnInit, OnDestroy {
    userId: number | null = null;
    subscriptions: SubscriptionViewModel[] = [];
    userIdSubscription: Subscription | undefined;
    showSubscriptionPopup: boolean = false;
    updateSuccessMessage: string | null = null;
 
    constructor(private userService: UserService, private router: Router) {}
 
    ngOnInit(): void {
        this.userIdSubscription = this.userService.watchUserId().subscribe(id => {
            this.userId = id;
            if (this.userId) {
                this.loadUserSubscriptions();
            } else {
                console.warn('User ID not available.');
            }
        });
    }
 
    ngOnDestroy(): void {
        if (this.userIdSubscription) {
            this.userIdSubscription.unsubscribe();
        }
    }
 
    loadUserSubscriptions(): void {
        if (this.userId) {
            this.userService.getProductSubscriptionList(this.userId).subscribe({
                next: (data) => {
                    this.subscriptions = data.map(sub => ({ ...sub, isSelectedToRemove: true })); // Initialize as selected for removal if unchecked
                    console.log('User Subscriptions:', this.subscriptions);
                },
                error: (error) => {
                    console.error('Error loading subscriptions:', error);
                }
            });
        }
    }
 
    removeSelectedSubscriptions(): void {
        if (this.userId) {
            const productsToRemove = this.subscriptions
                .filter(sub => !sub.isSelectedToRemove) // Find those that are *not* selected for removal (i.e., unchecked)
                .map(sub => sub.productid);
 
            if (productsToRemove.length > 0) {
                let removalCount = 0;
                productsToRemove.forEach(productId => {
                    this.userService.removeSubscription(this.userId!, productId).subscribe({
                        next: (response) => {
                            console.log(`Subscription for product ${productId} removed successfully:`, response);
                            removalCount++;
                            if (removalCount === productsToRemove.length) {
                                this.loadUserSubscriptions(); // Reload the list after all removals
                                this.updateSuccessMessage = 'Profile Updated Successfully';
                                setTimeout(() => this.updateSuccessMessage = null, 3000); // Clear message after 3 seconds
                            }
                        },
                        error: (error) => {
                            console.error(`Error removing subscription for product ${productId}:`, error);
                            // Handle the error (e.g., display an error message)
                        }
                    });
                });
            } else {
                console.log('No products selected for unsubscription.');
                // Optionally display a message
            }
        } else {
            console.warn('User ID not available, cannot remove subscriptions.');
        }
    }
 
    openSubscriptionPopup(): void {
        this.showSubscriptionPopup = true;
        this.updateSuccessMessage = null; // Clear any previous success message
        if (this.userId) {
            this.loadUserSubscriptions();
        }
    }
 
    closeSubscriptionPopup(): void {
        this.showSubscriptionPopup = false;
        this.updateSuccessMessage = null; // Clear success message when closing
    }
}