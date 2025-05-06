// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule, RouterOutlet } from '@angular/router';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { SearchfilterComponent } from "../searchfilter/searchfilter.component";
// import { ProductService } from '../../services/product.service';
// import { Subscription } from 'rxjs';
//  import { IProductDTO } from '../../model/class/interface/Products'; 

// @Component({
//   selector: 'app-products',
//   imports: [CommonModule, RouterModule, FormsModule, SearchfilterComponent, ReactiveFormsModule],
//   templateUrl: './products.component.html',
//   styleUrl: './products.component.css',
//   providers: [ProductService]
// })
// export class ProductsComponent implements OnInit, OnDestroy {

//   public productList: IProductDTO[] = []; // Use your interface here
//   private searchResults: Subscription | undefined;

//   constructor(
//     private productService: ProductService,
//     private router: Router,
//   ) { }

//   ngOnInit(): void {
//     console.log('ProductComponent initialized');
//     this.productService.getProductList().subscribe(response => {
//       this.productList = response;
//       console.log('Product List:', this.productList); 
//     });

//     this.searchResults = this.productService.searchResults$.subscribe(
//       (results) => {
//         this.productList = results;
//         console.log('Search Results Received: ', this.productList); // Inspect search results too
//       }
//     );
//   }

//   ngOnDestroy(): void {
//     if (this.searchResults) {
//       this.searchResults.unsubscribe();
//     }
//   }
//   viewProductDetails(productId: number) {
//     this.router.navigate(['/product-details', productId]);
//   }
// }

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchfilterComponent } from "../searchfilter/searchfilter.component";
import { ProductService } from '../../services/product.service';
import { Subscription } from 'rxjs';
import { IProductDTO } from '../../model/class/interface/Products'; // Import your interface

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterModule, FormsModule, SearchfilterComponent, ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  providers: [ProductService]
})
export class ProductsComponent implements OnInit, OnDestroy {

  public productList: IProductDTO[] = []; // Use your interface here
  private searchResults: Subscription | undefined;

  constructor(
    private productService: ProductService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    console.log('ProductComponent initialized');
    this.productService.getProductList().subscribe(response => {
      this.productList = response;
      console.log('Product List:', this.productList); // Inspect the data
    });

    this.searchResults = this.productService.searchResults$.subscribe(
      (results) => {
        this.productList = results;
        console.log('Search Results Received: ', this.productList); // Inspect search results too
      }
    );
  }

  ngOnDestroy(): void {
    if (this.searchResults) {
      this.searchResults.unsubscribe();
    }
  }
  viewProductDetails(productId: number) {
    this.router.navigate(['/product-details', productId]);
  }
}