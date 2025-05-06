import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';
import { ProductSubscriptionsComponent } from '../product-subscriptions/product-subscriptions.component';
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ProductReviewComponent } from "../product-review/product-review.component";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    ProductSubscriptionsComponent,
    ProductReviewComponent
],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  photoError: string = '';
  currentPhotoUrl: string | null = null;
  userId: number | null = null;
  userIdSubscription: Subscription | undefined;
  @ViewChild(ProductSubscriptionsComponent) productSubscriptionsPopup!: ProductSubscriptionsComponent;
  @ViewChild(ProductReviewComponent) productReviewsPopup!: ProductReviewComponent;


  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9._]{3,15}$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9._]{3,15}$/)]],
      nickName: ['', [Validators.required, Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9._]{3,15}$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.(com|net|org)$/)]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      addressLine1: ['', [Validators.required, Validators.minLength(10)]],
      addressLine2: ['', [Validators.required, Validators.minLength(10)]],
      dateOfBirth: ['', [Validators.required, this.minimumAgeValidator(18)]],
      photo: ['']
    });
    this.profileForm.controls['email'].disable();
  }

  ngOnInit(): void {
    this.userIdSubscription = this.userService.watchUserId().subscribe(id => {
      this.userId = id;
      if (this.userId) {
        this.loadUserProfile();
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

  loadUserProfile(): void {
    if (this.userId) {
      this.userService.getUserDetails(this.userId).subscribe({
        next: (profileData: any) => {
          console.log('Profile Data:', profileData);
          this.profileForm.patchValue({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            nickName: profileData.nickName,
            email: profileData.email,
            contactNumber: profileData.contactNumber,
            postalCode: profileData.postalCode,
            addressLine1: profileData.addressLine1,
            addressLine2: profileData.addressLine2,
            dateOfBirth: this.datePipe.transform(profileData.dateOfBirth, 'yyyy-MM-dd')
          });
          this.currentPhotoUrl = profileData.photo;
          console.log('Current Photo URL:', this.currentPhotoUrl);
          this.cdr.detectChanges(); 
        },
        error: (error) => {
          console.error('Error loading profile:', error);
        }
      });
    } else {
      console.warn('User ID is not available, cannot load profile.');
    }
  }

  minimumAgeValidator(minAge: number) {
    return (control: any) => {
      const dateOfBirth = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - dateOfBirth.getFullYear();
      const hasHadBirthday = today.getMonth() > dateOfBirth.getMonth() ||
        (today.getMonth() === dateOfBirth.getMonth() && today.getDate() >= dateOfBirth.getDate());
      return age > minAge || (age === minAge && hasHadBirthday) ? null : { minAge: true };
    };
  }

  onFileChange(event: any) {
    const file = event?.target?.files?.[0];
    if (file) {
      if (file.size < 10240 || file.size > 20480) {
        this.photoError = 'Photo must be between 10KB and 20KB.';
      } else {
        this.photoError = '';
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.currentPhotoUrl = e.target.result;
          this.cdr.detectChanges(); // Manually trigger change detection for OnPush
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removePhoto() {
    const photoInput = document.getElementById('photo') as HTMLInputElement;
    if (photoInput) {
      photoInput.value = '';
      this.photoError = '';
      this.currentPhotoUrl = null;
      this.cdr.detectChanges(); // Manually trigger change detection for OnPush
    }
  }

  onSubmit(): void {
    console.log('onSubmit() called'); // Diagnostic log
    if (this.profileForm.valid && !this.photoError && this.userId) {
      const formData = new FormData();
      formData.append('firstName', this.profileForm.get('firstName')?.value || '');
      formData.append('lastName', this.profileForm.get('lastName')?.value || '');
      formData.append('nickName', this.profileForm.get('nickName')?.value || '');
      formData.append('email', this.profileForm.get('email')?.value || '');
      formData.append('contactNumber', this.profileForm.get('contactNumber')?.value || '');
      formData.append('addressLine1', this.profileForm.get('addressLine1')?.value || '');
      formData.append('addressLine2', this.profileForm.get('addressLine2')?.value || '');
      formData.append('postalCode', this.profileForm.get('postalCode')?.value || '');
      formData.append('dateOfBirth', this.profileForm.get('dateOfBirth')?.value || '');
      const address = `${this.profileForm.get('addressLine1')?.value || ''}, ${this.profileForm.get('addressLine2')?.value || ''} - ${this.profileForm.get('postalCode')?.value || ''}`;
      formData.append('address', address);
      const photoInput = document.getElementById('photo') as HTMLInputElement;
      if (photoInput?.files?.length) {
        formData.append('photo', photoInput.files[0]);
      }
      console.log('Form Data:', Array.from(formData.entries()));
      this.userService.updateUser(this.userId, formData).subscribe({
        next: (response) => {
          console.log('Profile updated successfully:', response);
          alert('Profile updated successfully!');
          this.loadUserProfile();
        },
        error: (err) => {
          console.error('Profile update failed:', err);
          alert(`Profile update failed: ${err.message}`);
        }
      });
    }
  }

  openSubscriptions(): void {
    console.log('openSubscriptions() called'); // Diagnostic log
    this.productSubscriptionsPopup.openSubscriptionPopup();
  }

    openReviewPopup(): void {
      this.productReviewsPopup.openReviewPopup();
    }
}