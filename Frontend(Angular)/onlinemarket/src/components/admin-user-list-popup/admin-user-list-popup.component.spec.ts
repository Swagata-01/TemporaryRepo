import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserListPopupComponent } from './admin-user-list-popup.component';

describe('AdminUserListPopupComponent', () => {
  let component: AdminUserListPopupComponent;
  let fixture: ComponentFixture<AdminUserListPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUserListPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUserListPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
