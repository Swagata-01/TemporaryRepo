import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Subject, takeUntil } from 'rxjs';
 
@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
  providers : [UserService]
})
export class SignupComponent {
  signUpForm: FormGroup;
  photoError: string = '';
  emailError: string = '';
  potentiallyDuplicateEmails: string[] = [];
  destroy$ = new Subject<void>();
 
  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.signUpForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9._]{3,15}$/)]],
      lastName: ['', [Validators.required, Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9._]{3,15}$/)]],
      nickName: ['', [Validators.required, Validators.pattern(/^(?=.*[a-zA-Z])[a-zA-Z0-9._]{3,15}$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.(com|net|org)$/)]],
      contactNo: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/)
        ]
      ],
      confirmPassword: ['', [Validators.required]],
      addressLine1: ['', [Validators.required, Validators.minLength(10)]],
      addressLine2: ['', [Validators.required, Validators.minLength(10)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      dob: ['', [Validators.required, this.minimumAgeValidator(18)]],
    },
    { validator: this.passwordMatchValidator });

    this.signUpForm.get('email')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(email => {
      if (this.potentiallyDuplicateEmails.includes(email)) {
        this.signUpForm.get('email')?.setErrors({ 'potentialDuplicate': true });
      } else if (this.signUpForm.get('email')?.errors?.['potentialDuplicate']) {
        // Clear the potentialDuplicate error if the email changes to something new
        const currentErrors = { ...this.signUpForm.get('email')?.errors };
        delete currentErrors['potentialDuplicate'];
        this.signUpForm.get('email')?.setErrors(Object.keys(currentErrors).length > 0 ? currentErrors : null);
      }
    });
  }
 
  passwordMatchValidator(formGroup: FormGroup): void {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
 
    if (password && confirmPassword && password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }
 
  minimumAgeValidator(minAge: number) {
    return (control: any) => {
      const dob = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const hasHadBirthday = today.getMonth() > dob.getMonth() ||
                            (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
      return age > minAge || (age === minAge && hasHadBirthday) ? null : { minAge: true };
    };
  }
 
 
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size < 10240 || file.size > 20480) {
        this.photoError = 'Photo must be between 10KB and 20KB.';
      } else {
        this.photoError = '';
      }
    }
  }
 
  removePhoto() {
    const photoInput = document.getElementById('photo') as HTMLInputElement;
    if (photoInput) {
        photoInput.value = '';
        this.photoError = '';
    }
}
 
onSubmit(): void {
  if (this.signUpForm.valid && !this.photoError) {
    const formData = new FormData();
 
    // Append each field individually
    formData.append('firstName', this.signUpForm.get('firstName')?.value || '');
    formData.append('lastName', this.signUpForm.get('lastName')?.value || '');
    formData.append('email', this.signUpForm.get('email')?.value || '');
    formData.append('password', this.signUpForm.get('password')?.value || '');
    formData.append('nickName', this.signUpForm.get('nickName')?.value || '');
    formData.append('addressLine1', this.signUpForm.get('addressLine1')?.value || '');
    formData.append('addressLine2', this.signUpForm.get('addressLine2')?.value || '');
    formData.append('postalCode', this.signUpForm.get('postalCode')?.value || '');
    formData.append('contactNumber', this.signUpForm.get('contactNo')?.value || ''); // Ensure "contactNumber" matches the backend
    formData.append('dateOfBirth', this.signUpForm.get('dob')?.value || '');
 
    // Append the file
    const photoInput = (document.getElementById('photo') as HTMLInputElement);
    if (photoInput?.files?.length) {
      formData.append('imageFile', photoInput.files[0]);
    }
 
    console.log(Array.from(formData.entries())); // Debugging log
 
    this.userService.register(formData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response)
        this.router.navigate(['/signin']).then(() => {
          window.location.reload();
        });
        alert('Registration successful! Please check your email for verification.');
      },
      error: (err) => {
        console.error('Registration failed:', err);
        if (err?.error?.message === 'Duplicate email: Email already exists in the database.') {
          this.signUpForm.get('email')?.setErrors({ 'potentialDuplicate': true });
          // Store this email as a potential duplicate for the current session
          if (!this.potentiallyDuplicateEmails.includes(this.signUpForm.get('email')?.value)) {
            this.potentiallyDuplicateEmails.push(this.signUpForm.get('email')?.value);
          }
        } else {
          this.emailError = '* Registration failed. Please try again later.';
        }
      }

    });
  }
}
 
}
