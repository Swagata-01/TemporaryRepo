import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { HttpClientModule } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { AdminUserListPopupComponent } from '../admin-user-list-popup/admin-user-list-popup.component';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UpdateUserPopupComponent } from '../admin-update-user-popup/admin-update-user-popup.component';

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
  [key: string]: any;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule, CommonModule, HttpClientModule, AdminUserListPopupComponent, UpdateUserPopupComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  providers: [ProductService, UserService]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  // Single Add Product
  productName: string = '';
  productDescription: string = '';
  isActive: boolean = false;
  selectedImageFile: File | null = null;
  imagePreview: string | null = null;
  showAddProductPopup: boolean = false;
  duplicateProductNameError: boolean = false; // For duplicate name validation

  // Bulk Upload
  showAddMultipleProductsPopup: boolean = false;
  bulkProductisactive: boolean = false;
  bulkFile: File | null = null;

  // Update Product
  showUpdatePopup: boolean = false;
  searchId: string = '';
  productFound = false;
  previewImage: string | ArrayBuffer | null = null;
  product: {
    id: string;
    name: string;
    upName: string;
    upDescription: string;
    isActive: boolean;
    image: File | null;
    imageUrl: string;
  } = {
    id: '',
    name: '',
    upName: '',
    upDescription: '',
    isActive: undefined as any,
    image: null,
    imageUrl: ''
  };

  // Get Users Popup
  showGetUsersPopup: boolean = false;
  isAdminLoggedIn: boolean = false; // Renamed for clarity
  isAdminSubscription$: Subscription | undefined;
  isLoading: boolean = true; // To handle potential delays in fetching admin status

  // update user popup code
  isUpdateUserPopupVisible: boolean = false;

  constructor(private productService: ProductService, private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    console.log (this.product.isActive);
    this.isAdminSubscription$ = this.userService.isAdmin$.subscribe(isAdmin => {
      this.isAdminLoggedIn = isAdmin; // Update the boolean based on the observable
      this.isLoading = false;
      if (!this.isAdminLoggedIn) {
        this.router.navigate(['/home']); // Redirect if not admin
      }
    });
  }

  checkDuplicateProductName(name: string): void {
    if (name && name.trim() !== '') {
      this.productService.searchProduct(name).subscribe(
        (products) => {
          this.duplicateProductNameError = products && products.length > 0;
        },
        (error) => {
          console.error('Error checking product name:', error);
          this.duplicateProductNameError = false; // Assume no duplicate on error
        }
      );
    } else {
      this.duplicateProductNameError = false;
    }
  }

  ngOnDestroy(): void {
    if (this.isAdminSubscription$) {
      this.isAdminSubscription$.unsubscribe();
    }
  }

  openAddProductPopup() {
    this.showAddProductPopup = true;
  }

  closeAddProductPopup() {
    this.showAddProductPopup = false;
    this.resetAddProductForm();
    this.duplicateProductNameError = false; 
  }

  onProductNameInput(event: any) {
    this.duplicateProductNameError = false; 
    this.checkDuplicateProductName(event.target.value);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedImageFile = null;
    this.imagePreview = null;
  }

  submitProduct() {
    if (this.selectedImageFile && !this.duplicateProductNameError) {
      this.productService.addProduct(this.productName, this.productDescription, this.selectedImageFile, this.isActive)
        .subscribe(response => {
          alert('Product added successfully');
          this.closeAddProductPopup();
        }, error => {
          if (error && error.error && error.error.message && error.error.message.includes("Duplicate entry") && error.error.message.includes("products.name")) {
            this.duplicateProductNameError = true;
          } else {
            console.error('Error adding product:', error);
            alert('Error adding product. Please try again.');
          }
        });
    }
  }

  resetAddProductForm() {
    this.productName = '';
    this.productDescription = '';
    this.isActive = false;
    this.selectedImageFile = null;
    this.imagePreview = null;
    this.duplicateProductNameError = false;
  }

  // Methods for Bulk Upload popup
  openAddMultipleProductsPopup() {
    this.showAddMultipleProductsPopup = true;
  }

  closeAddMultipleProductsPopup() {
    this.showAddMultipleProductsPopup = false;
    this.bulkFile = null;
    this.bulkProductisactive = false;
  }

  onBulkFileChange(event: any) {
    this.bulkFile = event.target.files[0];
  }

  submitBulkProducts() {
    if (this.bulkFile) {
      this.productService.uploadMultipleProducts(this.bulkFile)
        .subscribe(response => {
          alert('Multiple products added successfully');
          this.closeAddMultipleProductsPopup();
        }, error => {
          console.error('Error uploading multiple products:', error);
        });
    }
  }

  openUpdateProductPopup() {
    this.showUpdatePopup = true;
    this.searchId = '';
    this.productFound = false;
    this.previewImage = null;
  }

  searchProduct() {
    if (this.product.name && this.product.name.trim() !== '') {
      this.productService.searchProduct(this.product.name.trim())
        .subscribe(response => {
          if (response.length > 0 && response[0].name.toLowerCase() === this.product.name.trim().toLowerCase()) {
            this.product = response[0];
            this.product.upName = response[0].name;
            this.product.upDescription = response[0].description;
            this.product.isActive = response[0].isActive;
            this.productService.getProductImageByName(this.product.name)
              .subscribe(imageBlob => {
                const reader = new FileReader();
                reader.onload = () => {
                  this.previewImage = reader.result as string;
                };
                reader.readAsDataURL(imageBlob);
              });
            this.productFound = true;
          } else {
            alert('Product not found!');
            this.productFound = false;
            this.resetUpdateProductForm(); 
          }
        }, error => {
          alert('Error searching for product.');
          this.productFound = false;
          this.resetUpdateProductForm(); // Optionally reset the form on error
        });
    } else {
      alert('Please enter a product name to search.');
      this.productFound = false;
      this.resetUpdateProductForm(); // Optionally reset the form if no search term is entered
    }
  }

  onUpdateFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
        this.product.image = file;
      };
      reader.readAsDataURL(file);
    } else {
      this.product.image = null;
      this.previewImage = this.product.imageUrl;
    }
  }

  updateProduct() {
    const imageFile = this.product.image !== null ? this.product.image : undefined;
    this.productService.updateProduct(
      this.product.name,
      this.product.upName,
      this.product.upDescription,
      imageFile,
      this.product.isActive ? true: false
      
    ).subscribe(response => {
      alert('Product updated successfully!');
      
      this.showUpdatePopup = false;
      this.resetUpdateProductForm();
      if (response && response.imageUrl) {
        this.product.imageUrl = response.imageUrl;
        this.previewImage = response.imageUrl;
      }
    }, error => {
      console.error('Error updating product:', error);
    });
  }
  
  closeUpdateProductPopup() {
    this.showUpdatePopup = false;
    this.resetUpdateProductForm();
  }

  resetUpdateProductForm() {
    this.product = {
      id: '',
      name: '',
      upName: '',
      upDescription: '',
      isActive: false,
      image: null,
      imageUrl: ''
    };
    this.productFound = false;
    this.previewImage = null;
  }

  // Methods for Get Users popup
  openGetUsersPopup() {
    this.showGetUsersPopup = true;
  }

  closeGetUsersPopup() {
    this.showGetUsersPopup = false;
  }
  openUpdateUsers() {
    this.showGetUsersPopup = true;
  }

  openUpdateUserPopup() {
    console.log('openUpdateUserPopup() called');
    console.log('isUpdateUserPopupVisible:', this.isUpdateUserPopupVisible);
    this.isUpdateUserPopupVisible = true;
  }

  closeUpdateUserPopup() {
    this.isUpdateUserPopupVisible = false;
  }

  handleUserUpdated(userData: IUserDetails) {
    console.log('User data received for update:', userData);
    //const userId = userData.userID;
    if (userData && userData.userID) {
      const userId = userData.userID;
      console.log("Inside if");
      const formData = new FormData();
      for (const key in userData) {
        if (userData.hasOwnProperty(key)) {
          formData.append(key, userData[key]);
        }
      }

      this.userService.updateUser(userData.userID, formData).subscribe({
        next: (response) => {
          console.log('User updated successfully:', response);
          this.isUpdateUserPopupVisible = false;
          alert('User updated successfully!');
        },
        error: (error) => {
          console.error('Error updating user:', error);
          alert('Error updating user.');
        }
      });
    } else {
      console.error('User ID is missing in the user data.');
      alert('Error: Could not update user (ID missing).');
    }
  }
  
}
