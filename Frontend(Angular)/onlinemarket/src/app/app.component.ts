import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../components/header/header.component";
import { FooterComponent } from "../components/footer/footer.component";
import { CookieServiceService } from '../services/cookie-service.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { IUserDetails } from '../model/class/interface/Products';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterModule, RouterLink, RouterLinkActive, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [CookieServiceService, UserService, ProductService, AuthService],
})
export class AppComponent implements OnInit {
  title = 'onlinemarket';
  loggedIn: boolean = false;
  userId: number | null = null;
  userDetails: IUserDetails | null = null;

  constructor(
    private cookieService: CookieServiceService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.updateLoginStatus();
    this.userId = this.userService.userId;
    if (this.loggedIn && this.userId) {
      this.loadUserDetails();
    }
  }

  updateLoginStatus(): void {
    this.loggedIn = this.cookieService.isLoggedIn();
    console.log('Logged In Status:', this.loggedIn);
    this.cdr.detectChanges();
  }

  isLoggedIn(): boolean {
    return this.cookieService.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.loggedIn && this.userDetails?.userRole === 'ADMIN';
  }

  logout(): void {
    this.cookieService.deleteCookie();
    localStorage.removeItem('userId');
    this.loggedIn = false;
    this.userDetails = null;
    this.updateLoginStatus();
    this.router.navigate(['/home']).then(() => {
      window.location.reload();
    });
  }

  onLoginSuccess(): void {
    this.updateLoginStatus();
    this.loadUserDetails();
  }

  loadUserDetails(): void {
    const userId = this.userService.userId;
    console.log('User ID in AppComponent:', userId);
    if (userId !== null) {
      this.userService.getUserDetails(userId).subscribe({
        next: (details) => {
          this.userDetails = details;
          this.cdr.detectChanges();
          console.log('User details in AppComponent:', this.userDetails);
        },
        error: (error) => {
          console.error('Error fetching user details in AppComponent:', error);
        }
      });
    } else {
      console.error('User ID is null or undefined in AppComponent');
    }
  }
}