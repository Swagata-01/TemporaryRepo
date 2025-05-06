import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { interval, Subscription, Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CookieServiceService implements OnInit, OnDestroy {
  private cookieCheckInterval = 5000;
  private cookieCheckSubscription: Subscription | undefined;
  private cookieName = "userEmail";
  private userDataKey = "userData";
  private logoutSubject = new Subject<void>();

  logout$ = this.logoutSubject.asObservable();

  constructor(
    private cookieService: CookieService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.startCookieExpirationCheck();
  }

  ngOnDestroy(): void {
    this.stopCookieExpirationCheck();
  }

  setCookie(cookieValue: string, expirationMinutes: number = 20): void {
    const expires = new Date(Date.now() + expirationMinutes * 60 * 1000);
    this.cookieService.set(this.cookieName, cookieValue.toString(), expires, '/');
  }

  getCookie(): string {
    return this.cookieService.get(this.cookieName);
  }

  isLoggedIn(): boolean {
    return this.cookieService.check(this.cookieName);
  }

  deleteCookie(): void {
    this.cookieService.delete(this.cookieName);
    this.clearLogoutData(); // Use the unified method
    // this.navigateToHome();
  }

  clearLogoutData(): void {
    localStorage.removeItem(this.userDataKey);
    console.log('User data cleared from local storage.');
    this.logoutSubject.next();
  }

  private startCookieExpirationCheck(): void {
    this.cookieCheckSubscription = interval(this.cookieCheckInterval).subscribe(() => {
      if (!this.isLoggedIn()) {
        this.clearLogoutData(); // Use the unified method
        this.stopCookieExpirationCheck();
        // this.navigateToHome();
      }
    });
  }

  private stopCookieExpirationCheck(): void {
    if (this.cookieCheckSubscription) {
      this.cookieCheckSubscription.unsubscribe();
      this.cookieCheckSubscription = undefined;
    }
  }

  // private navigateToHome(): void {
  //   this.router.navigate(['/home']);
  // }
}

