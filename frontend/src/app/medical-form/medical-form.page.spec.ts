import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicalFormPage } from './medical-form.page';

describe('MedicalFormPage', () => {
  let component: MedicalFormPage;
  let fixture: ComponentFixture<MedicalFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicalFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
