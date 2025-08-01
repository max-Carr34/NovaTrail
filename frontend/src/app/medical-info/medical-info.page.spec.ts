import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicalInfoPage } from './medical-info.page';

describe('MedicalInfoPage', () => {
  let component: MedicalInfoPage;
  let fixture: ComponentFixture<MedicalInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicalInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
