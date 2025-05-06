
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { FormsModule } from '@angular/forms';

interface UserDetail {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  contactNumber: string;
  addedOn: string;
  updatedOn: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: number;
  isActive: boolean;
  userRole: string; 
}

@Component({
  selector: 'app-admin-user-list-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-user-list-popup.component.html',
  styleUrl: './admin-user-list-popup.component.css'
})
export class AdminUserListPopupComponent implements OnInit {
  allUsers: UserDetail[] = [];
  @Output() close = new EventEmitter<void>();
  selectedStatus: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchAllUsers();
  }

  fetchAllUsers() {
    this.http.get<UserDetail[]>('http://localhost:9090/OMP/admin/users').subscribe(
      (data) => {
        this.allUsers = data; 
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching all users:', error);
      }
    );
  }

  filterUsersByActiveStatus() {
    if (this.selectedStatus === 'active' || this.selectedStatus === 'inactive') 
      {
      const isActiveValue = this.selectedStatus === 'active';
      const params = new HttpParams().set('isActive', isActiveValue.toString());

      this.http.get<UserDetail[]>('http://localhost:9090/OMP/admin/users/filter', { params }).subscribe(
        (data) => {
          this.allUsers = data; 
        },
        (error: HttpErrorResponse) => {
          console.error('Error filtering users:', error);
        }
      );
    } else {
      this.fetchAllUsers();
    }
  }

  exportToExcel() {
    if (this.allUsers && this.allUsers.length > 0) {
      const formattedUsers = this.allUsers.map(user => ({
        'First Name': user.firstName,
        'Last Name': user.lastName,
        'Email': user.email,
        'Date of Birth': user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-IN') : '',
        'Contact Number': user.contactNumber,
        'Added On': user.addedOn ? new Date(user.addedOn).toLocaleString('en-IN') : '',
        'Updated On': user.updatedOn ? new Date(user.updatedOn).toLocaleString('en-IN') : '',
        'Address Line 1': user.addressLine1,
        'Address Line 2': user.addressLine2,
        'Postal Code': user.postalCode,
        'Active': user.isActive ? 'Yes' : 'No',
        'Role': user.userRole 
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedUsers);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'User Details');
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, 'user_details');
    } else {
      alert('No user data to export.');
    }
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, fileName + '.xlsx');
  }

  closePopup() {
    this.close.emit();
  }
}