import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParentManagementPage } from './parent-management.page';

describe('ParentManagementPage', () => {
  let component: ParentManagementPage;
  let fixture: ComponentFixture<ParentManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
