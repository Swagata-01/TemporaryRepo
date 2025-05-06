import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IUserDetails } from '../../model/class/interface/Products';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { CookieServiceService } from '../../services/cookie-service.service'; // Import CookieServiceService

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  providers : [UserService]
})
export class HeaderComponent implements OnInit, OnDestroy, OnChanges {
  @Input() loggedIn: boolean = false;
  userDetails: IUserDetails | null = null;
  userIconSource: string = 'assets/images/profile.png'; // Default user icon
  userDetailsSubscription: Subscription | undefined;
  logoutSubscription: Subscription | undefined; // Subscription for the logout event

  constructor(
    private userService: UserService,
    private cookieService: CookieServiceService // Inject CookieServiceService
  ) {}
  ngOnInit(): void {
    this.loadUserDetails();
    this.loggedIn = this.cookieService.isLoggedIn(); // Use the service to check login status
    this.subscribeToLogout(); // Subscribe to the logout event
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loggedIn']) {
      if (!changes['loggedIn'].currentValue) {
        this.clearUserDetails(); // Call a dedicated function to clear user details
      } else if (changes['loggedIn'].currentValue && this.cookieService.isLoggedIn()) {
        this.loadUserDetails();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.userDetailsSubscription) {
      this.userDetailsSubscription.unsubscribe();
    }
    if (this.logoutSubscription) {
      this.logoutSubscription.unsubscribe();
    }
  }

  loadUserDetails(): void {
    const userId = this.userService.userId;
    console.log('User ID in HeaderComponent:', userId);

    if (userId !== null) {
      this.userDetailsSubscription = this.userService.getUserDetails(userId).subscribe({
        next: (details) => {
          this.userDetails = details;
          this.updateHeaderContent();
          console.log('User details in HeaderComponent:', this.userDetails);
        },
        error: (error) => {
          console.error('Error fetching user details in HeaderComponent:', error);
        }
      });
    } else {
      this.clearUserDetails();
      console.log('User ID is null in HeaderComponent');
    }
  }

  updateHeaderContent(): void {
    if (this.loggedIn && this.userDetails?.photo) {
      this.userIconSource = this.userDetails.photo;
    } else {
      this.userIconSource = 'assets/images/profile.png'; // Reset to default
    }
  }

  subscribeToLogout(): void {
    this.logoutSubscription = this.cookieService.logout$.subscribe(() => {
      console.log('Logout/expiration signal received in HeaderComponent.');
      this.clearUserDetails();
      this.loggedIn = false; // Update the loggedIn status
      this.userIconSource = 'assets/images/profile.png'; // Reset the user icon
    });
  }

  clearUserDetails(): void {
    this.userDetails = null;
    console.log('User details cleared in HeaderComponent.');
  }
}