import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { UserService } from '../../services/user.service';
 
 
interface SubscriberDetail {
  postalCode: any;
  firstName: string;
  lastName: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  dateOfBirth: string;
  userId: number;
  contactNumber: string;
  addedOn: string;
  updatedOn: string;
}
 
@Component({
  selector: 'app-subscriber-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriber-list.component.html',
  styleUrl: './subscriber-list.component.css'
})
export class SubscriberListComponent implements OnInit {
  @Input() product_Id: number | undefined;
  @Output() close = new EventEmitter<void>();
  subscriberDetails: SubscriberDetail[] = [];
 
  
  constructor(private productService: ProductService) { }
 
  

  ngOnInit(): void {
    
    if (this.product_Id) {
      this.fetchSubscribers(this.product_Id);
    }
  }
 
  fetchSubscribers(productId: number) {
    this.productService.getProductSubscriptionList(productId).subscribe(
      (users: any[]) => {
        this.subscriberDetails = users.map(user => ({
          postalCode: user.postalCode,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          addressLine1: user.addressLine1,
          addressLine2: user.addressLine2,
          dateOfBirth: user.dateOfBirth,
          userId: user.userID,
          contactNumber: user.contactNumber,
          addedOn: user.addedOn,
          updatedOn: user.updatedOn,
        }));
      },
      (error: any) => {
        console.error('Error fetching subscribers:', error);
        this.subscriberDetails = [];
      }
    );
  }
 
  downloadAsExcel() {
 
    if (this.subscriberDetails && this.subscriberDetails.length > 0) {
      const formattedSubscribers = this.subscriberDetails.map(user => {
       
        const dob = new Date(user.dateOfBirth);
        const formattedDate = dob.toLocaleDateString('en-IN');
 
        return {
          'First Name': user.firstName,
          'Last Name': user.lastName,
          'Email': user.email,
          'Address Line 1': user.addressLine1,
          'Address Line 2': user.addressLine2,
          'Date of Birth': formattedDate,
          'Postal Code': user.postalCode,
          'Contact Number': user.contactNumber,
          'Added On': user.addedOn,
          'Updated On': user.updatedOn
        };
      });
      const worksheet = XLSX.utils.json_to_sheet(formattedSubscribers);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscribers');
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, `product_${this.product_Id}_subscribers`);
    } else {
      alert('No subscriber data to download.');
    }
  }
 
  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, fileName + '_list.xlsx');
  }
 
  closePopup() {
    this.close.emit();
  }
}
 