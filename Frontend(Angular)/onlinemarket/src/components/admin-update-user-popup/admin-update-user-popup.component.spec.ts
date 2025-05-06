import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUpdateUserPopupComponent } from './admin-update-user-popup.component';

describe('AdminUpdateUserPopupComponent', () => {
  let component: AdminUpdateUserPopupComponent;
  let fixture: ComponentFixture<AdminUpdateUserPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminUpdateUserPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminUpdateUserPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
