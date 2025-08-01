import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChildRegistrationPage } from './child-registration.page';

describe('ChildRegistrationPage', () => {
  let component: ChildRegistrationPage;
  let fixture: ComponentFixture<ChildRegistrationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildRegistrationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
